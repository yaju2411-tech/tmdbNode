export interface Genre {
  id: number;
  name: string;
}

export interface Movie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path?: string;
  overview?: string;
  vote_average?: number;
  release_date?: string;
  genre_ids?: number[];
  genres?: Genre[];
  runtime?: number;
}

export interface TvShow {
  id: number;
  name: string;
  poster_path: string;
  backdrop_path?: string;
  overview?: string;
  vote_average?: number;
  first_air_date?: string;
  genre_ids?: number[];
  genres?: Genre[];
  episode_run_time?: number[];
}

export interface WatchlistItem {
  _id?: string;
  userId: string;
  contentId: number;
  contentType: "movie" | "tv";
  title: string;
  poster_path?: string;
  vote_average?: number;
  createdAt?: string;
}
