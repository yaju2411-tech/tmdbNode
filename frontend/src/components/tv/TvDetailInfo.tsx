import { useParams } from "react-router-dom";
import useTvDetail, { useTvDetailCast } from "../../hooks/useTvDetail";
import React from "react";
import { Button } from "../ui/button";
import { X } from "lucide-react";

interface Props {
  onClose: () => void;
}

const TvDetailInfo = ({ onClose }: Props) => {
  const { id } = useParams<{ id: string }>();
  const { data: tv } = useTvDetail(id);
  const { data: castData } = useTvDetailCast(id);

  if (!tv) return null;
  const topActors = castData?.cast
    ?.filter((c: any) => c.known_for_department === "Acting")
    .slice(0, 5);

  return (
    <div className="relative mt-8 rounded-xl overflow-hidden shadow-2xl transition-all duration-500 max-w-7xl mx-auto border dark:border-zinc-800/40 dark:bg-black/60 backdrop-blur-sm">
      <div className="relative z-10 p-6 md:p-10 text-white">
        {/* Header */}
        <div className="flex justify-between mb-10 pb-4 border-b border-zinc-800">
          <h2 className="text-3xl font-bold text-red-600 tracking-wide md:mb-0 border-l-4 border-red-600 pl-3">More Details</h2>
          <Button
            onClick={onClose}
            variant="outline"
            className="text-white rounded-md hover:bg-red-500 transition-colors"
          ><X/></Button>
        </div>

        {/* Quick Info Grid / Table */}
        <div className="backdrop-blur-sm dark:bg-black/40 shadow-xl rounded-xl p-6 mb-10 border dark:border-zinc-800/50 backdrop-blur-md overflow-x-auto scrollbar-hide">
          <table className="w-full text-center text-sm md:text-base min-w-[600px]">
            <thead>
              <tr className="text-black dark:text-zinc-500 text-xs font-semibold tracking-wider">
                <th className="pb-3 w-1/4 uppercase">Rating</th>
                <th className="pb-3 w-1/4 uppercase">Total Episodes</th>
                <th className="pb-3 w-1/4 uppercase">Type</th>
                <th className="pb-3 w-1/4 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-black dark:text-white text-2xl font-bold tracking-tight">{tv.vote_average.toFixed(1)} / 10</td>
                <td className="text-black dark:text-white text-2xl font-bold tracking-tight">{tv.seasons.reduce((acc: any, s: any) => acc + s.episode_count, 0)}</td>
                <td className="text-black text-2xl font-bold tracking-tight text-teal-400 capitalize">{tv.type || "Show"}</td>
                <td>
                  <span className="bg-green-600/90 text-white px-3 py-1 rounded-md text-sm font-bold shadow-sm whitespace-nowrap">
                    {tv.ststus || "Returning Series"}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Seasons Detailed Table */}
        <div className="mb-10">
          <h3 className="text-xl font-bold text-red-500 dark:text-zinc-200 mb-4 border-l-4 border-red-600 pl-3">Seasons Overview</h3>
          <div className="shadow-xl overflow-x-auto dark:bg-black/40 rounded-xl border dark:border-zinc-800/50 backdrop-blur-md">
            <table className="w-full text-left text-md text-sm">
              <thead>
                <tr className="font-bold bg-gray-200 dark:bg-white/5 border-b border-zinc-700/50 text-blue-500 dark:text-zinc-400">
                  <th className="px-6 py-4 font-medium w-24">Poster</th>
                  <th className="px-6 py-4 font-medium">Season Details</th>
                  <th className="px-6 py-4 font-medium w-28 text-center">Episodes</th>
                  <th className="px-6 py-4 font-medium w-32 text-center">Air Date</th>
                  <th className="px-6 py-4 font-medium w-24 text-center">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {tv.seasons.map((season: any, index: number) => (
                  <tr key={`${season.id}-${index}`} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      {season.poster_path ? (
                        <div className="shadow-lg rounded shrink-0 w-16 h-24 overflow-hidden border border-zinc-700">
                          <img
                            src={`https://image.tmdb.org/t/p/w200${season.poster_path}`}
                            alt={season.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-24 bg-zinc-800 rounded border border-zinc-700 flex items-center justify-center">
                          <span className="text-xs text-zinc-500">No Image</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-base text-black/60 dark:text-zinc-100">{season.name}</div>
                      <div className="text-sm font-bold text-base text-black/60 dark:text-zinc-100">
                        {season.overview || <span className="italic opacity-50">No description available for this season.</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="bg-teal-500/50 text-white dark:bg-teal-500/20 dark:text-teal-300 font-bold px-3 py-1.5 rounded-md text-center max-w-max mx-auto shadow-sm">
                        {season.episode_count}
                      </div>
                    </td>
                    <td className="font-bold text-black/60 dark:text-zinc-100">
                      {season.air_date ? new Date(season.air_date).toLocaleDateString() : "TBA"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="bg-teal-500/20 dark:bg-zinc-800/80 text-green-500 font-semibold px-2 py-1 inline-flex items-center justify-center rounded border dark:border-zinc-700 w-10 text-center shadow-sm">
                        {season.vote_average ? season.vote_average.toFixed(1) : "-"}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Cast List Table */}
        <div>
          <h3 className="text-xl font-semibold text-red-500 dark:text-zinc-200 mb-4 border-l-4 border-red-600 pl-3">Top Cast</h3>
          <div className="shadow-xl overflow-x-auto dark:bg-black/40 rounded-xl border dark:border-zinc-800/50 backdrop-blur-md">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-white/5 border-b border-zinc-700/50 text-blue-500 font-bold dark:text-zinc-400">
                  <th className="px-6 py-4 font-medium">Actor</th>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {topActors?.map((actor: any) => (
                  <tr key={actor.cast_id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <img
                        src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                        alt={actor.name}
                        onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/150"; }}
                        className="w-12 h-12 rounded-full object-cover shadow-md border dark:border-zinc-700"
                      />
                    </td>
                    <td className="px-6 py-4 font-bold text-black/60 dark:text-zinc-100">
                      {actor.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-teal-400 font-medium">as</span> <span className="font-semibold text-black/60 dark:text-zinc-200">{actor.character || "Main Role"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};

export default TvDetailInfo;
