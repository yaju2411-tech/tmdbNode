import { useAddMutation, useRemoveWatchlist } from "../hooks/useWatchList";
import { PlusCircle } from "lucide-react";
import React from "react";
import { MdDone } from "react-icons/md";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface Props {
  item: any;
  type: "movie" | "tv";
  userId?: string;
  watchlist: any[];
}

export const Watchlist = ({
  item,
  type,
  userId,
  watchlist
}: Props) => {
  const addMutation = useAddMutation();
  const removeMutation =
    useRemoveWatchlist();

  const isSaved = watchlist?.some(
    (watch: any) =>
      watch.media_id === item.id &&
      watch.media_type === type
  );

  const toggleWatchlist = (
    e: React.MouseEvent
  ) => {

    e.stopPropagation();

    if (isSaved) {

      removeMutation.mutate({
        media_id: item.id,
        media_type: type
      });

    } else {

      addMutation.mutate({
        ...item,
        media_type: type
      });
    }
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={toggleWatchlist}
              className="p-2 rounded-full drak:bg-black/70 overflow-x-hidden w-full"
            >
              {isSaved ? <MdDone size={15} /> : <PlusCircle size={15} />}
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {isSaved ? <p>Already In Watchlist</p> : <p>Add to Watchlist</p>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
};