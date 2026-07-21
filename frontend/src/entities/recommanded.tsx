export interface Recommandation {
    id:number;
    title?:string;
    name?:string;
    poster_path:string;
    backdrop_path:string;
    vote_average:number;
    genre_ids:number[];
    media_type?:"movie" | "tv";
}