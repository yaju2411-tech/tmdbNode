import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import { GenreList } from "./GenreList";
import { AppSidebar } from "./Sidebar";
import { useState, useEffect } from "react";
import GlobalSearch from "./SearchComponent";
import { useWatchList } from "../../hooks/useWatchList";
import { GoToTop } from "./GoToTop";
import useSignUpHook from "../../hooks/useSignUpHook";
import useSocketListener from "../../hooks/useSocketListener";

const Layout = () => {
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [openSidebar, setOpenSidebar] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [collapse, setCollapse] = useState(false);
  const { userData } = useSignUpHook();
  const user = userData;
  const [filters, setFilters] = useState({
    rating: 0, country: "", familySafe: true,
  })
  const location = useLocation();
  const isTv = location.pathname.includes("/tv");
  const { data: watchlist = [] } = useWatchList(user?.id);

  // Activate real-time socket invalidations for user & admin queries
  useSocketListener();

  // Clear search text automatically whenever route location changes
  useEffect(() => {
    setSearchText("");
  }, [location.pathname]);

  return (
    <div className="h-screen bg-white dark:bg-[#141414] text-black dark:text-white overflow-hidden overflow-x-hidden w-screen">
      <Navbar onSearch={setSearchText} searchText={searchText} setOpenSidebar={setOpenSidebar} />
      <GlobalSearch searchText={searchText} user={user} watchlist={watchlist} onClose={() => setSearchText("")} />
      <div className="flex h-[calc(100vh-72px)] overflow-hidden gap-3">
        <AppSidebar setCollapsed={setCollapse} collapsed={collapse} filters={filters} setFilters={setFilters} openSidebar={openSidebar} setOpenSidebar={setOpenSidebar} user={user} />
        <div className="flex-1 overflow-hidden flex flex-col pr-0 md:pr-6">
          {!searchText && (
            <GenreList
              type={isTv ? "tv" : "movie"}
              onClose={(id) => setSelectedGenre(id)}
            />)}
          <main
            className="flex-1 overflow-y-auto scrollbar-hide"
          >
            <Outlet
              context={{
                searchText,
                selectedGenre,
                filters,
                setFilters,
                user,
                watchlist
              }}
            />
          </main>
          <GoToTop />
        </div>
      </div>
    </div>
  );
};

export default Layout;