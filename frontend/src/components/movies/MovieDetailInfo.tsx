import { useParams } from "react-router-dom";
import useMovieDetail, { useMovieDetailCast } from "../../hooks/useMovieDetail";
import React from "react";
import { Button } from "../ui/button";
import { X } from "lucide-react";

interface Props {
  onClose: () => void;
}

const MovieDetailInfo = ({ onClose }: Props) => {
  const { id } = useParams();
  const { data: movie } = useMovieDetail(id);
  const { data: castData } = useMovieDetailCast(id);

  if (!movie) return null;
  const topActors = castData?.cast
    ?.filter((c: any) => c.known_for_department === "Acting")
    .slice(0, 5);

  return (
    <div className="relative mt-8 rounded-xl overflow-hidden shadow-2xl transition-all duration-500 max-w-7xl mx-auto border dark:border-zinc-800/40 dark:bg-black/60 backdrop-blur-sm">
      <div className="relative z-10 p-6 md:p-10 text-white">
        {/* Header */}
        <div className="flex flex-row justify-between items-center mb-10 pb-4 border-b dark:border-zinc-800">
          <h2 className="text-3xl font-bold text-red-600 tracking-wide mb-4 md:mb-0 border-l-4 border-red-600 pl-3">More Details</h2>
          <Button 
            onClick={onClose} 
            variant="outline" 
            className=" text-white hover:bg-red-500 transition-colors"
          >
          <X/>
          </Button>
        </div>

        {/* Quick Info Grid / Table */}
        <div className="backdrop-blur-sm dark:bg-black/40 shadow-xl rounded-xl p-6 mb-10 border dark:border-zinc-800/50 backdrop-blur-md overflow-x-auto scrollbar-hide">
          <table className="w-full text-center text-sm md:text-base min-w-[600px]">
            <thead>
              <tr className="text-black dark:text-zinc-500 text-xs font-semibold tracking-wider">
                <th className="pb-3 w-1/4 uppercase">Rating</th>
                <th className="pb-3 w-1/4 uppercase">Budget</th>
                <th className="pb-3 w-1/4 uppercase">Release Date</th>
                <th className="pb-3 w-1/4 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-black dark:text-white text-2xl font-bold tracking-tight">{movie.vote_average.toFixed(1)} / 10</td>
                <td className="text-black dark:text-white text-2xl font-bold tracking-tight">${(movie.budget / 1000000).toFixed(1)}M</td>
                <td className="text-black dark:text-white text-xl font-medium tracking-tight">{new Date(movie.release_date).toLocaleDateString()}</td>
                <td>
                  <span className="bg-green-600/90 text-white px-3 py-1 rounded-md text-sm font-bold shadow-sm whitespace-nowrap">
                    {movie.status}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Cast Table */}
        <div className="mb-10">
          <h3 className="text-xl font-bold text-red-500 dark:text-zinc-200 mb-4 border-l-4 border-red-600 pl-3">Top Cast & Characters</h3>
          <div className="shadow-xl overflow-x-auto dark:bg-black/40 rounded-xl border dark:border-zinc-800/50 backdrop-blur-md">
            <table className="w-full text-left text-md whitespace-nowrap">
              <thead>
                <tr className="font-bold bg-gray-200 dark:bg-white/5 border-b border-zinc-700/50 text-blue-500 dark:text-zinc-400">
                  <th className="px-6 py-4 font-medium">Actor</th>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Character</th>
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
                    <td className="px-6 py-4">
                      <div className="font-bold text-base text-black/60 dark:text-zinc-100">{actor.name}</div>
                      <div className="text-xs text-zinc-500 mt-1">{actor.gender === 1 ? "Female" : "Male"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-teal-500 font-medium">as</span> <span className="font-semibold text-black/60 dark:text-zinc-200">{actor.character}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Production Companies */}
        <div>
          <h3 className="text-xl font-semibold text-red-500 dark:text-zinc-200 mb-4 border-l-4 border-red-600 pl-3">Production Companies</h3>
          <div className="shadow-xl overflow-x-auto dark:bg-black/40 rounded-xl border dark:border-zinc-800/50 backdrop-blur-md">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-white/5 border-b dark:border-zinc-700/50 text-green-500 font-bold dark:text-zinc-400">
                  <th className="px-6 py-4 font-medium">Logo</th>
                  <th className="px-6 py-4 font-medium">Company Name</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {movie.production_companies?.slice(0, 5).map((company: any) => (
                  <tr key={company.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 w-32">
                      {company.logo_path ? (
                        <div className="bg-white/90 p-2 rounded-md inline-block">
                          <img 
                            src={`https://image.tmdb.org/t/p/w200${company.logo_path}`} 
                            alt={company.name}
                            className="h-8 w-auto object-contain max-w-[100px]"
                          />
                        </div>
                      ) : (
                        <span className="text-black dark:text-zinc-600 italic">No Logo</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-black dark:text-zinc-200">
                      {company.name}
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

export default MovieDetailInfo;
