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
    <div className="relative mt-6 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 max-w-7xl mx-auto border border-gray-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md">
      <div className="p-4 sm:p-8 text-gray-900 dark:text-white">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-200 dark:border-zinc-800">
          <h2 className="text-xl sm:text-2xl font-black text-[#E50914] tracking-wide border-l-4 border-[#E50914] pl-3">
            More Details
          </h2>
          <Button
            onClick={onClose}
            variant="outline"
            className="p-2 h-9 w-9 rounded-full hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </Button>
        </div>

        {/* Quick Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <div className="p-3 sm:p-4 rounded-xl bg-gray-100 dark:bg-zinc-900/80 border border-gray-200 dark:border-zinc-800/80 flex flex-col items-center justify-center text-center">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1">
              Rating
            </span>
            <span className="text-lg sm:text-2xl font-black text-emerald-600 dark:text-emerald-500">
              {movie.vote_average?.toFixed(1)} / 10
            </span>
          </div>

          <div className="p-3 sm:p-4 rounded-xl bg-gray-100 dark:bg-zinc-900/80 border border-gray-200 dark:border-zinc-800/80 flex flex-col items-center justify-center text-center">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1">
              Budget
            </span>
            <span className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white">
              {movie.budget ? `$${(movie.budget / 1000000).toFixed(1)}M` : "N/A"}
            </span>
          </div>

          <div className="p-3 sm:p-4 rounded-xl bg-gray-100 dark:bg-zinc-900/80 border border-gray-200 dark:border-zinc-800/80 flex flex-col items-center justify-center text-center">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1">
              Release Date
            </span>
            <span className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">
              {movie.release_date ? new Date(movie.release_date).toLocaleDateString() : "N/A"}
            </span>
          </div>

          <div className="p-3 sm:p-4 rounded-xl bg-gray-100 dark:bg-zinc-900/80 border border-gray-200 dark:border-zinc-800/80 flex flex-col items-center justify-center text-center">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1">
              Status
            </span>
            <span className="bg-emerald-600 text-white px-2.5 py-0.5 rounded-md text-xs font-bold shadow-sm">
              {movie.status || "Released"}
            </span>
          </div>
        </div>

        {/* Cast Table */}
        {topActors && topActors.length > 0 && (
          <div className="mb-8">
            <h3 className="text-base sm:text-lg font-bold text-[#E50914] mb-3 border-l-4 border-[#E50914] pl-3">
              Top Cast & Characters
            </h3>
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 scrollbar-none">
              <table className="w-full text-left text-xs sm:text-sm whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-200/80 dark:bg-zinc-800/80 text-gray-700 dark:text-zinc-400 font-bold border-b border-gray-300 dark:border-zinc-800">
                    <th className="px-4 py-3">Actor</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Character</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                  {topActors.map((actor: any) => (
                    <tr key={actor.cast_id || actor.credit_id} className="hover:bg-gray-100 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <img
                          src={
                            actor.profile_path
                              ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                              : "https://placehold.co/150x150?text=No+Photo"
                          }
                          alt={actor.name}
                          className="w-10 h-10 rounded-full object-cover shadow-sm border border-gray-300 dark:border-zinc-700"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-gray-900 dark:text-zinc-100">{actor.name}</div>
                        <div className="text-[11px] text-gray-500 dark:text-zinc-500">
                          {actor.gender === 1 ? "Female" : "Male"}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800 dark:text-zinc-300">
                        {actor.character || "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Production Companies */}
        {movie.production_companies && movie.production_companies.length > 0 && (
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#E50914] mb-3 border-l-4 border-[#E50914] pl-3">
              Production Companies
            </h3>
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 scrollbar-none">
              <table className="w-full text-left text-xs sm:text-sm whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-200/80 dark:bg-zinc-800/80 text-gray-700 dark:text-zinc-400 font-bold border-b border-gray-300 dark:border-zinc-800">
                    <th className="px-4 py-3">Logo</th>
                    <th className="px-4 py-3">Company Name</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                  {movie.production_companies.slice(0, 5).map((company: any) => (
                    <tr key={company.id} className="hover:bg-gray-100 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="px-4 py-3 w-32">
                        {company.logo_path ? (
                          <div className="bg-white p-1.5 rounded-md inline-block border border-gray-200">
                            <img
                              src={`https://image.tmdb.org/t/p/w200${company.logo_path}`}
                              alt={company.name}
                              className="h-6 w-auto object-contain max-w-[90px]"
                            />
                          </div>
                        ) : (
                          <span className="text-gray-500 dark:text-zinc-500 italic text-xs">No Logo</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-900 dark:text-zinc-200">
                        {company.name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetailInfo;
