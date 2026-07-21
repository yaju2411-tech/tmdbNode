import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePaymentId } from '../hooks/usePaymentId';

const MovieCard = ({ movie }: any) => {
  const navigate = useNavigate();
  const {paymentId,receiptNumber} = usePaymentId(String(movie.id),"movie");
  const handleNavigation = () => {
    if (!movie?.id) return;
    navigate(`/app/movieDetail/${movie.id}`);
  };
  return (
    <div 
      onClick={handleNavigation} 
      className="group cursor-pointer flex flex-col gap-2 transition-transform duration-300 hover:scale-105"
    >
      <div className="relative overflow-hidden rounded-md aspect-[2/3] bg-zinc-900 shadow-md transition-shadow group-hover:shadow-[0_0_15px_rgba(229,9,20,0.3)]">
        <img
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={movie.title}
          className="h-full w-full object-cover"
        />
      </div>
      
      <div className="">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">
          {movie.title}
        </h3>
        <span className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-semibold flex items-center gap-1 overflow-hidden">
          <span className="text-green-600 dark:text-green-500 font-bold">⭐ {movie.vote_average?.toFixed(1) || "N/A"}</span>
          <span>•</span>
          <span>{movie.release_date?.substring(0, 4) || "Unknown"}</span>
          {(receiptNumber || paymentId) && (
            <button 
              onClick={(e) => { e.stopPropagation(); navigate(`/receipt/${receiptNumber || paymentId}`); }}
              className="ml-auto flex items-center justify-center p-1.5 rounded-full hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
              title="View Receipt"
            >
              🧾
            </button>
          )}
        </span>
        
      </div>
    </div>
  );
};

export default MovieCard;