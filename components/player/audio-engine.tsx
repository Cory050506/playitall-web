"use client";

import { useEffect, useRef } from "react";
import { usePlaybackStore } from "@/stores/playback-store";
import { useStreamUrl } from "@/lib/subsonic/use-stream-url";

export function AudioEngine() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentSong = usePlaybackStore((s) => s.currentSong);
  const isPlaying = usePlaybackStore((s) => s.isPlaying);
  const volume = usePlaybackStore((s) => s.volume);
  const setCurrentTime = usePlaybackStore((s) => s.setCurrentTime);
  const setDuration = usePlaybackStore((s) => s.setDuration);
  const next = usePlaybackStore((s) => s.next);
  const pause = usePlaybackStore((s) => s.pause);

  const streamUrl = useStreamUrl(currentSong?.id);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = "metadata";
    }

    const audio = audioRef.current;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime || 0);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      const before = usePlaybackStore.getState().currentSong?.id;
      next();
      const after = usePlaybackStore.getState().currentSong?.id;
      if (before === after) pause();
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, [next, pause, setCurrentTime, setDuration]);

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
      void audio.play().catch(() => {
        pause();
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, pause, streamUrl]);

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

  return null;
}
