export type SubsonicResponse<T> = {
  "subsonic-response": T & {
    status: "ok" | "failed";
    version?: string;
    type?: string;
    serverVersion?: string;
    openSubsonic?: boolean;
    error?: {
      code: number;
      message: string;
    };
  };
};

export type PingResponse = SubsonicResponse<object>;

export type ArtistID3 = {
  id: string;
  name: string;
  albumCount?: number;
  coverArt?: string;
  artistImageUrl?: string;
};

export type AlbumID3 = {
  id: string;
  name: string;
  artist?: string;
  artistId?: string;
  coverArt?: string;
  songCount?: number;
  duration?: number;
  year?: number;
  genre?: string;
  created?: string;
};

export type AlbumWithSongs = AlbumID3 & {
  song?: Song[];
};

export type Song = {
  id: string;
  parent?: string;
  isDir?: boolean;
  title: string;
  album?: string;
  artist?: string;
  track?: number;
  year?: number;
  genre?: string;
  coverArt?: string;
  size?: number;
  contentType?: string;
  suffix?: string;
  duration?: number;
  bitRate?: number;
  path?: string;
  discNumber?: number;
  created?: string;
  albumId?: string;
  artistId?: string;
  type?: string;
};

export type Playlist = {
  id: string;
  name: string;
  songCount?: number;
  duration?: number;
  coverArt?: string;
  changed?: string;
};

export type PlaylistWithSongs = Playlist & {
  song?: Song[];
};

export type Genre = {
  songCount?: number;
  albumCount?: number;
  value?: string;
};

export type IndexesResponse = SubsonicResponse<{
  indexes?: {
    ignoredArticles?: string;
    index?: Array<{
      name: string;
      artist?: ArtistID3[];
    }>;
    lastModified?: number;
  };
}>;

export type AlbumList2Response = SubsonicResponse<{
  albumList2?: {
    album?: AlbumID3[];
  };
}>;

export type AlbumResponse = SubsonicResponse<{
  album?: AlbumWithSongs;
}>;

export type ArtistResponse = SubsonicResponse<{
  artist?: ArtistID3 & {
    album?: AlbumID3[];
  };
}>;

export type PlaylistResponse = SubsonicResponse<{
  playlist?: PlaylistWithSongs;
}>;

export type LyricsResponse = SubsonicResponse<{
  lyrics?: {
    artist?: string;
    title?: string;
    value?: string;
  };
}>;

export type LyricsBySongIdResponse = SubsonicResponse<{
  lyricsList?: {
    structuredLyrics?: Array<{
      displayArtist?: string;
      displayTitle?: string;
      lang?: string;
      line?: Array<{
        value?: string;
        start?: number;
      }>;
    }>;
  };
}>;

export type Search3Response = SubsonicResponse<{
  searchResult3?: {
    artist?: ArtistID3[];
    album?: AlbumID3[];
    song?: Song[];
  };
}>;

export type PlaylistsResponse = SubsonicResponse<{
  playlists?: {
    playlist?: Playlist[];
  };
}>;

export type RandomSongsResponse = SubsonicResponse<{
  randomSongs?: {
    song?: Song[];
  };
}>;

export type SongsByGenreResponse = SubsonicResponse<{
  songsByGenre?: {
    song?: Song[];
  };
}>;

export type GenresResponse = SubsonicResponse<{
  genres?: {
    genre?: Genre[];
  };
}>;

export type ScanStatusResponse = SubsonicResponse<{
  scanStatus?: {
    scanning?: boolean;
    count?: number;
  };
}>;
