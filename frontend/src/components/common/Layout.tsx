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
  const [collapse, setCollapse] = useState(true);
  const { userData } = useSignUpHook();
  const user = userData;
  const [filters, setFilters] = useState({
    rating: 0,
    country: "",
    familySafe: true,
  });
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
    <div className="h-screen w-full bg-white dark:bg-[#141414] text-black dark:text-white flex flex-col overflow-hidden transition-colors">
      {/* Top Sticky Header */}
      <Navbar onSearch={setSearchText} searchText={searchText} setOpenSidebar={setOpenSidebar} />
      
      {/* Global Search Overlay */}
      <GlobalSearch searchText={searchText} user={user} watchlist={watchlist} onClose={() => setSearchText("")} />
      
      {/* App Main Shell Container */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Collapsible Sidebar */}
        <AppSidebar
          setCollapsed={setCollapse}
          collapsed={collapse}
          filters={filters}
          setFilters={setFilters}
          openSidebar={openSidebar}
          setOpenSidebar={setOpenSidebar}
          user={user}
        />

        {/* Content Workspace Column */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white dark:bg-[#141414] transition-colors">
          {!searchText && (
            <GenreList
              type={isTv ? "tv" : "movie"}
              selectedGenre={selectedGenre}
              onClose={(id) => setSelectedGenre(id)}
            />
          )}

          <main className="flex-1 overflow-y-auto scrollbar-none">
            <Outlet
              context={{
                searchText,
                selectedGenre,
                filters,
                setFilters,
                user,
                watchlist,
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