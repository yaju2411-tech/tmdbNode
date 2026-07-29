import React from "react";
import {
  Swords, 
  Compass, 
  Ghost, 
  Laugh, 
  Heart, 
  Skull, 
  Video, 
  Users, 
  Wand2, 
  Landmark, 
  Music, 
  Search, 
  Rocket, 
  MonitorPlay, 
  Crosshair, 
  Mountain, 
  Film, 
  Baby, 
  Eye, 
  Newspaper, 
  MessageCircle, 
  Clapperboard,
  ShieldAlert, 
} from "lucide-react";

export const getGenreIcon = (genreName: string) => {
  const name = genreName.toLowerCase();
  
  if (name.includes("action") || name.includes("adventure")) return <Swords size={22} />;
  if (name.includes("animation")) return <Clapperboard size={22} />;
  if (name.includes("comedy")) return <Laugh size={22} />;
  if (name.includes("crime")) return <ShieldAlert size={22} />;
  if (name.includes("documentary")) return <Video size={22} />;
  if (name.includes("drama")) return <Film size={22} />;
  if (name.includes("family")) return <Users size={22} />;
  if (name.includes("fantasy")) return <Wand2 size={22} />;
  if (name.includes("history")) return <Landmark size={22} />;
  if (name.includes("horror")) return <Ghost size={22} />;
  if (name.includes("music")) return <Music size={22} />;
  if (name.includes("mystery")) return <Search size={22} />;
  if (name.includes("romance") || name.includes("soap")) return <Heart size={22} />;
  if (name.includes("science fiction") || name.includes("sci-fi")) return <Rocket size={22} />;
  if (name.includes("tv movie")) return <MonitorPlay size={22} />;
  if (name.includes("thriller")) return <Skull size={22} />;
  if (name.includes("war")) return <Crosshair size={22} />;
  if (name.includes("western")) return <Mountain size={22} />;
  if (name.includes("kids")) return <Baby size={22} />;
  if (name.includes("reality")) return <Eye size={22} />;
  if (name.includes("news")) return <Newspaper size={22} />;
  if (name.includes("talk")) return <MessageCircle size={22} />;
  
  // default
  return <Film size={22} />;
};
