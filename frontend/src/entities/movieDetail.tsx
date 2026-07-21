export interface Video {
  key: string;
  type: string; 
  site: string; 
}

export interface MovieDetail {
  id: number;
  title: string;
  overview: string;
  backdrop_path: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  runtime: number;
  budget:number;
  revenue:string;
  status:string;

  genres: { 
    id: number; 
    name: string 
  }[];
  production_companies: { 
    id: number; 
    name: string; 
    logo_path: string 
  }[];
  cast : {
    cast_id:string,
    known_for_department:string,
    character:string;
    gender:number;
    profile_path:string;
    name:string;
  }[];
  videos: {
    results: Video[];
  };
  
}
