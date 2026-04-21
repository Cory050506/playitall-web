import {
  AlbumList2Response,
  AlbumResponse,
  ArtistResponse,
  GenresResponse,
  IndexesResponse,
  LyricsBySongIdResponse,
  LyricsResponse,
  PingResponse,
  PlaylistResponse,
  PlaylistsResponse,
  RandomSongsResponse,
  ScanStatusResponse,
  Search3Response,
  SongsByGenreResponse,
} from "@/lib/subsonic/types";
import {
  getErrorMessage,
  makeSalt,
  md5Hex,
  normalizeBaseUrl,
} from "@/lib/subsonic/helpers";

export type SubsonicCredentials = {
  serverUrl: string;
  username: string;
  password: string;
};

type RequestOptions = {
  signal?: AbortSignal;
};

export class SubsonicClient {
  private serverUrl: string;
  private username: string;
  private password: string;

  constructor(credentials: SubsonicCredentials) {
    this.serverUrl = normalizeBaseUrl(credentials.serverUrl);
    this.username = credentials.username.trim();
    this.password = credentials.password;
  }

  private buildUrl(
    path: string,
    params?: Record<string, string | number | undefined>
  ) {
    const salt = makeSalt();
    const token = md5Hex(this.password + salt);

    const url = new URL(`${this.serverUrl}${path}`);

    url.searchParams.set("u", this.username);
    url.searchParams.set("t", token);
    url.searchParams.set("s", salt);
    url.searchParams.set("f", "json");
    url.searchParams.set("v", "1.16.1");
    url.searchParams.set("c", "play-it-all-web");

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    return url.toString();
  }

  private async request<T>(
    path: string,
    params?: Record<string, string | number | undefined>,
    options?: RequestOptions
  ): Promise<T> {
    const url = this.buildUrl(path, params);

    const response = await fetch(url, {
      method: "GET",
      signal: options?.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    const root = json?.["subsonic-response"];

    if (!root) {
      throw new Error("Invalid Subsonic response.");
    }

    if (root.status === "failed") {
      throw new Error(root.error?.message || "Subsonic request failed.");
    }

    return json as T;
  }

  async ping(options?: RequestOptions) {
    return this.request<PingResponse>("/rest/ping.view", undefined, options);
  }

  async getIndexes(options?: RequestOptions) {
    return this.request<IndexesResponse>("/rest/getIndexes.view", undefined, options);
  }

  async getRandomSongs(size = 12, options?: RequestOptions) {
    return this.request<RandomSongsResponse>(
      "/rest/getRandomSongs.view",
      { size },
      options
    );
  }

  async getAlbumList2(
    type: "newest" | "recent" | "random" | "alphabeticalByName" = "newest",
    size = 24,
    offset = 0,
    options?: RequestOptions
  ) {
    return this.request<AlbumList2Response>(
      "/rest/getAlbumList2.view",
      { type, size, offset },
      options
    );
  }

  async getAlbum(id: string, options?: RequestOptions) {
    return this.request<AlbumResponse>("/rest/getAlbum.view", { id }, options);
  }

  async getArtist(id: string, options?: RequestOptions) {
    return this.request<ArtistResponse>("/rest/getArtist.view", { id }, options);
  }

  async search3(query: string, options?: RequestOptions) {
    return this.request<Search3Response>(
      "/rest/search3.view",
      {
        query,
        artistCount: 12,
        artistOffset: 0,
        albumCount: 16,
        albumOffset: 0,
        songCount: 30,
        songOffset: 0,
      },
      options
    );
  }

  async getPlaylists(options?: RequestOptions) {
    return this.request<PlaylistsResponse>(
      "/rest/getPlaylists.view",
      undefined,
      options
    );
  }

  async getPlaylist(id: string, options?: RequestOptions) {
    return this.request<PlaylistResponse>(
      "/rest/getPlaylist.view",
      { id },
      options
    );
  }

  async getLyrics(artist: string, title: string, options?: RequestOptions) {
    return this.request<LyricsResponse>(
      "/rest/getLyrics.view",
      { artist, title },
      options
    );
  }

  async getLyricsBySongId(id: string, options?: RequestOptions) {
    return this.request<LyricsBySongIdResponse>(
      "/rest/getLyricsBySongId.view",
      { id },
      options
    );
  }

  async getGenres(options?: RequestOptions) {
    return this.request<GenresResponse>("/rest/getGenres.view", undefined, options);
  }

  async getSongsByGenre(genre: string, count = 100, offset = 0, options?: RequestOptions) {
    return this.request<SongsByGenreResponse>(
      "/rest/getSongsByGenre.view",
      { genre, count, offset },
      options
    );
  }

  async getScanStatus(options?: RequestOptions) {
    return this.request<ScanStatusResponse>(
      "/rest/getScanStatus.view",
      undefined,
      options
    );
  }

  getCoverArtUrl(id: string, size = 500) {
    return this.buildUrl("/rest/getCoverArt.view", { id, size });
  }

  getStreamUrl(id: string, maxBitRate?: number) {
    return this.buildUrl("/rest/stream.view", {
      id,
      maxBitRate,
    });
  }

  getDownloadUrl(id: string) {
    return this.buildUrl("/rest/download.view", { id });
  }
}

export async function testSubsonicConnection(credentials: SubsonicCredentials) {
  try {
    const client = new SubsonicClient(credentials);
    const result = await client.ping();
    const root = result["subsonic-response"];

    return {
      ok: true as const,
      version: root.version ?? null,
      serverVersion: root.serverVersion ?? null,
      type: root.type ?? null,
    };
  } catch (error) {
    return {
      ok: false as const,
      error: getErrorMessage(error),
    };
  }
}
