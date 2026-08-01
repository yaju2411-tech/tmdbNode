import TvDetailTrailer from "./TvDetailTrailer";
import { useState } from "react";
import TvDetailInfo from "./TvDetailInfo";
import { useParams, useOutletContext } from "react-router-dom";
import { RecommendationRow } from "../common/Recommanded";

const TvDetailPage = () => {
  const { id: tvId } = useParams();
  const [show, setShow] = useState(false);
  const { user, watchlist } = useOutletContext<any>();

  if (!tvId) return <div className="text-white mt-10 text-center">No TV Show Found</div>;

  return (
    <div className="min-h-screen text-white pb-10 w-full px-5">
      <TvDetailTrailer onMoreDetail={() => setShow(true)} />
      {show && (
        <div className="z-10 mt-10 mx-auto">
          <TvDetailInfo onClose={() => setShow(false)} />
        </div>
      )}
      <RecommendationRow id={tvId!} type="tv" user={user?.id} watchlist={watchlist} />
    </div>
  );
};

export default TvDetailPage;