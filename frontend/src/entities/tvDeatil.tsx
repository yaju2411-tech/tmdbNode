export interface Genres{
    id:number;
    name:string;
}
export interface Cast{
    cast_id:number;
    name:string;
    gender:number;
    known_for_department:string;
    profile_path:string;
}
export interface CastResponse {
  cast: Cast[];
  id: number;
}
export interface Video{
    type: string;
    id:number;
    site:string;
    size:string;
    key:string;
}
export interface Sesons{
    id:number;
    name:string;
    overview:string;
    poster_path:string;
    season_number:number;
    vote_average:number;
    air_date:string;
    episode_count:number;
}
export interface TvDetail{
    id:number;
    name:string;
    adult:boolean;
    backdrop_path:string;
    poster_path:string;
    episode_run_time:string;
    vote_average:number;
    type:string;
    tagline:string;
    ststus:string;

    languages:string[];
    genres:Genres[];
    seasons:Sesons[];
    cast:Cast[];
    videos:{results:Video[]};
}