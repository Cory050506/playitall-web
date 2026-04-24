"use client";

import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { usePlaybackStore } from "@/stores/playback-store";
import { usePreferencesStore } from "@/stores/preferences-store";
import { useSessionStore } from "@/stores/session-store";
import { useCoverArtUrl } from "@/lib/subsonic/use-cover-art";
import { useDirectStreamUrl } from "@/lib/subsonic/use-direct-stream-url";
import { useStreamUrl } from "@/lib/subsonic/use-stream-url";
import {
  canUseGoogleCastWebSdk,
  getPlatform,
  isElectronRuntime,
} from "@/lib/runtime";
import { SubsonicClient } from "@/lib/subsonic/client";
import {
  librarySnapshotKey,
  loadFreshLibrarySnapshot,
} from "@/lib/subsonic/library-snapshot";
import {
  EQUALIZER_FREQUENCIES,
  EQUALIZER_PRESETS,
} from "@/lib/equalizer-presets";
import type { Song } from "@/lib/subsonic/types";

type AudioContextWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

type CastableAudioElement = HTMLAudioElement & {
  webkitShowPlaybackTargetPicker?: () => void;
  disableRemotePlayback?: boolean;
};

type CastImage = {
  url: string;
};

type CastMusicMetadata = {
  metadataType?: number;
  title?: string;
  artist?: string;
  albumName?: string;
  images?: CastImage[];
};

type CastMediaInfo = {
  metadata?: CastMusicMetadata;
  duration?: number;
};

type CastLoadRequest = {
  currentTime?: number;
};

type CastMediaNamespace = {
  DEFAULT_MEDIA_RECEIVER_APP_ID?: string;
  MetadataType?: {
    MUSIC_TRACK?: number;
  };
  MusicTrackMediaMetadata?: new () => CastMusicMetadata;
  MediaInfo?: new (contentId: string, contentType: string) => CastMediaInfo;
  LoadRequest?: new (mediaInfo: CastMediaInfo) => CastLoadRequest;
};

type CastSession = {
  loadMedia?: (request: unknown) => Promise<unknown>;
};

type CastContext = {
  getCurrentSession?: () => CastSession | null;
  requestSession?: () => Promise<CastSession>;
};

type CastGlobals = typeof globalThis & {
  cast?: {
    framework?: {
      CastContext?: {
        getInstance: () => CastContext;
      };
    };
  };
  chrome?: {
    cast?: {
      media?: CastMediaNamespace;
    };
  };
};

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function getGoogleCastSupport(timeoutMs = 2500) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const globals = globalThis as CastGlobals;
    const castContext = globals.cast?.framework?.CastContext?.getInstance();
    const mediaNamespace = globals.chrome?.cast?.media;
    const MediaInfo = mediaNamespace?.MediaInfo;
    const LoadRequest = mediaNamespace?.LoadRequest;

    if (castContext && mediaNamespace && MediaInfo && LoadRequest) {
      return { castContext, mediaNamespace, MediaInfo, LoadRequest };
    }

    await sleep(100);
  }

  return null;
}

function isLocalhostUrl(value: string) {
  try {
    const url = new URL(value);
    return ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  } catch {
    return false;
  }
}

function isSafariAirPlayAvailable(audio: CastableAudioElement) {
  return typeof audio.webkitShowPlaybackTargetPicker === "function";
}

function setMediaSessionAction(
  action: MediaSessionAction,
  handler: MediaSessionActionHandler
) {
  try {
    navigator.mediaSession.setActionHandler(action, handler);
  } catch {
    // Some Chromium builds expose Media Session but not every action.
  }
}

function requestAdvanceQueue() {
  window.dispatchEvent(new CustomEvent("play-it-all-next"));
}

async function getAutoplaySongs(currentSong: Song, queue: Song[]) {
  const session = useSessionStore.getState();
  const queueIds = new Set(queue.map((song) => song.id));

  const fromSnapshot = (() => {
    if (!session.serverUrl || !session.username) return [];
    const snapshot = loadFreshLibrarySnapshot(
      librarySnapshotKey(session.serverUrl, session.username)
    )?.catalog;
    if (!snapshot) return [];

    const sameArtist = snapshot.songs.filter((song) => {
      if (queueIds.has(song.id) || song.id === currentSong.id) return false;
      if (currentSong.artistId && song.artistId) {
        return song.artistId === currentSong.artistId;
      }
      return Boolean(currentSong.artist && song.artist === currentSong.artist);
    });

    const sameGenre = snapshot.songs.filter((song) => {
      if (queueIds.has(song.id) || song.id === currentSong.id) return false;
      if (!currentSong.genre || !song.genre) return false;
      return song.genre === currentSong.genre;
    });

    const pool = [...sameArtist, ...sameGenre];
    const deduped: Song[] = [];
    const seen = new Set<string>();
    for (const song of pool) {
      if (!seen.has(song.id)) {
        seen.add(song.id);
        deduped.push(song);
      }
    }
    return deduped.slice(0, 25);
  })();

  if (fromSnapshot.length) {
    return fromSnapshot.sort(() => Math.random() - 0.5).slice(0, 12);
  }

  if (!session.serverUrl || !session.username || !session.password) {
    return [];
  }

  try {
    const client = new SubsonicClient({
      serverUrl: session.serverUrl,
      username: session.username,
      password: session.password,
    });
    const response = await client.getRandomSongs(18);
    const songs = response["subsonic-response"]?.randomSongs?.song ?? [];
    return songs.filter((song) => !queueIds.has(song.id) && song.id !== currentSong.id);
  } catch (error) {
    console.error("Autoplay fetch failed:", error);
    return [];
  }
}

export function AudioEngine() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const filterRefs = useRef<BiquadFilterNode[]>([]);

  const currentSong = usePlaybackStore((s) => s.currentSong);
  const isPlaying = usePlaybackStore((s) => s.isPlaying);
  const volume = usePlaybackStore((s) => s.volume);
  const setCurrentTime = usePlaybackStore((s) => s.setCurrentTime);
  const setDuration = usePlaybackStore((s) => s.setDuration);

  const equalizerPreset = usePreferencesStore((s) => s.equalizerPreset);
  const streamUrl = useStreamUrl(currentSong?.id);
  const directStreamUrl = useDirectStreamUrl(currentSong?.id);
  const castCoverArtUrl = useCoverArtUrl(currentSong?.coverArt, 800);

  const advanceQueue = useCallback(async () => {
    const state = usePlaybackStore.getState();
    const song = state.currentSong;
    const atEnd = state.currentIndex >= state.queue.length - 1;

    if (!song || !atEnd) {
      state.next();
      return;
    }

    if (!usePreferencesStore.getState().keepMusicPlaying) {
      state.pause();
      return;
    }

    const additions = await getAutoplaySongs(song, state.queue);
    if (additions.length) {
      const uniqueAdditions = additions.filter(
        (candidate) => !state.queue.some((queued) => queued.id === candidate.id)
      );

      if (uniqueAdditions.length) {
        const nextQueue = [...state.queue, ...uniqueAdditions];
        const nextOriginalQueue = state.isQueueShuffled
          ? [...state.originalQueue, ...uniqueAdditions]
          : nextQueue;

        usePlaybackStore.getState().setQueue(nextQueue, state.currentIndex + 1, {
          originalQueue: nextOriginalQueue,
          isShuffled: state.isQueueShuffled,
        });
        toast.success("Added related songs to keep the music going.");
        return;
      }
    }

    state.pause();
  }, []);

  useEffect(() => {
    if (!currentSong) {
      document.title = "Play It All";
      if ("mediaSession" in navigator) {
        navigator.mediaSession.metadata = null;
      }
      return;
    }

    const artist = currentSong.artist || "Unknown Artist";
    const title = `${currentSong.title} - ${artist}`;
    document.title = title;

    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.title,
        artist,
        album: currentSong.album || undefined,
        artwork: castCoverArtUrl
          ? [
              { src: castCoverArtUrl, sizes: "512x512", type: "image/png" },
            ]
          : undefined,
      });

      setMediaSessionAction("play", () => {
        usePlaybackStore.getState().play();
      });
      setMediaSessionAction("pause", () => {
        usePlaybackStore.getState().pause();
      });
      setMediaSessionAction("previoustrack", () => {
        usePlaybackStore.getState().previous();
      });
      setMediaSessionAction("nexttrack", () => {
        requestAdvanceQueue();
      });
    }
  }, [castCoverArtUrl, currentSong]);

  const ensureEqualizerGraph = useCallback((audio: HTMLAudioElement) => {
    if (typeof window === "undefined") return null;

    const AudioContextCtor =
      window.AudioContext ?? (window as AudioContextWindow).webkitAudioContext;

    if (!AudioContextCtor) return null;

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextCtor();
    }

    const audioContext = audioContextRef.current;

    if (!sourceRef.current) {
      sourceRef.current = audioContext.createMediaElementSource(audio);
    }

    if (!filterRefs.current.length) {
      filterRefs.current = EQUALIZER_FREQUENCIES.map((frequency) => {
        const filter = audioContext.createBiquadFilter();
        filter.type = "peaking";
        filter.frequency.value = frequency;
        filter.Q.value = 1.08;
        filter.gain.value = 0;
        return filter;
      });
    }

    sourceRef.current.disconnect();
    for (const filter of filterRefs.current) {
      filter.disconnect();
    }

    let previous: AudioNode = sourceRef.current;
    for (const filter of filterRefs.current) {
      previous.connect(filter);
      previous = filter;
    }
    previous.connect(audioContext.destination);

    return audioContext;
  }, []);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = "metadata";
      audioRef.current.disableRemotePlayback = false;
    }

    const audio = audioRef.current;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime || 0);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      void advanceQueue();
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);

      // StrictMode can mount/unmount/mount in development. Tear the media element
      // down fully so we don't leave a ghost audio instance playing underneath.
      audio.pause();
      audio.removeAttribute("src");
      audio.load();

      if (audioRef.current === audio) {
        audioRef.current = null;
      }
    };
  }, [advanceQueue, setCurrentTime, setDuration]);

  useEffect(() => {
    const castHandler = () => {
      const audio = audioRef.current as CastableAudioElement | null;
      if (!audio) return;

      void (async () => {
        if (!currentSong || !directStreamUrl) {
          toast.error("Pick a song before casting.");
          return;
        }

        if (!window.isSecureContext && !isSafariAirPlayAvailable(audio)) {
          toast.error("Chromecast needs HTTPS or localhost. This LAN address is not secure.");
          return;
        }

        if (isLocalhostUrl(directStreamUrl)) {
          toast.error("Chromecast cannot play localhost streams. Use your server's LAN or HTTPS address.");
          return;
        }

        const googleCast = canUseGoogleCastWebSdk()
          ? await getGoogleCastSupport()
          : null;

        if (googleCast) {
          const { castContext, mediaNamespace, MediaInfo, LoadRequest } = googleCast;
          const session =
            castContext.getCurrentSession?.() ??
            (await castContext.requestSession?.());

          if (!session?.loadMedia) {
            toast.error("No Cast session was selected.");
            return;
          }

          const mediaInfo = new MediaInfo(
            directStreamUrl,
            currentSong.contentType || "audio/mpeg"
          );
          const metadata = mediaNamespace.MusicTrackMediaMetadata
            ? new mediaNamespace.MusicTrackMediaMetadata()
            : {};

          metadata.metadataType =
            mediaNamespace.MetadataType?.MUSIC_TRACK ?? metadata.metadataType;
          metadata.title = currentSong.title;
          metadata.artist = currentSong.artist || "Unknown Artist";
          metadata.albumName = currentSong.album;
          metadata.images = castCoverArtUrl ? [{ url: castCoverArtUrl }] : [];

          mediaInfo.metadata = metadata;
          mediaInfo.duration = currentSong.duration;

          const request = new LoadRequest(mediaInfo);
          request.currentTime = audio.currentTime || 0;

          await session.loadMedia(request);
          toast.success("Casting started.");
          return;
        }

        const airPlayPicker = audio.webkitShowPlaybackTargetPicker;
        if (isSafariAirPlayAvailable(audio) && airPlayPicker) {
          airPlayPicker.call(audio);
          return;
        }

        if (isElectronRuntime()) {
          const platform = getPlatform();
          if (platform === "mac") {
            toast.error("AirPlay is not available in the desktop app on this Mac right now.");
            return;
          }

          if (platform === "windows" || platform === "linux") {
            toast.error("Casting is disabled in the desktop app on Windows and Linux.");
            return;
          }
        }

        toast.error(
          "No Cast picker is available here."
        );
      })().catch((error) => {
        console.error("Cast failed:", error);
        toast.error("Casting failed. Make sure your Cast device can reach your music server.");
      });
    };

    window.addEventListener("play-it-all-cast", castHandler);

    return () => {
      window.removeEventListener("play-it-all-cast", castHandler);
    };
  }, [castCoverArtUrl, currentSong, directStreamUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const gains = EQUALIZER_PRESETS[equalizerPreset] ?? EQUALIZER_PRESETS.flat;
    const hasEqGain = gains.some((gain) => gain !== 0);

    if (!hasEqGain && !audioContextRef.current) return;

    const audioContext = ensureEqualizerGraph(audio);
    if (!audioContext) return;

    filterRefs.current.forEach((filter, index) => {
      filter.gain.setTargetAtTime(gains[index] ?? 0, audioContext.currentTime, 0.016);
    });
  }, [equalizerPreset, ensureEqualizerGraph]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!streamUrl) return;

    const currentSrc = audio.getAttribute("data-stream-url");
    if (currentSrc === streamUrl) return;

    audio.src = streamUrl;
    audio.setAttribute("data-stream-url", streamUrl);
    audio.load();

    if (isPlaying) {
      void audio.play().catch(() => {});
    }
  }, [streamUrl, isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !streamUrl) return;

    if (isPlaying) {
      void audioContextRef.current?.resume();
      void audio.play().catch(() => {
        usePlaybackStore.getState().pause();
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, streamUrl]);

  useEffect(() => {
    const seekHandler = (event: Event) => {
      const custom = event as CustomEvent<number>;
      const time = custom.detail;

      const audio = audioRef.current;
      if (!audio || Number.isNaN(time)) return;

      audio.currentTime = time;
      setCurrentTime(time);
    };

    window.addEventListener("play-it-all-seek", seekHandler as EventListener);

    return () => {
      window.removeEventListener("play-it-all-seek", seekHandler as EventListener);
    };
  }, [setCurrentTime]);

  useEffect(() => {
    const nextHandler = () => {
      void advanceQueue();
    };

    window.addEventListener("play-it-all-next", nextHandler);

    return () => {
      window.removeEventListener("play-it-all-next", nextHandler);
    };
  }, [advanceQueue]);

  return null;
}
