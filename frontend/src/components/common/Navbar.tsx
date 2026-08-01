import { SearchIcon, Eye, EyeOff, X, SunIcon, MoonIcon, MenuIcon, HelpCircle, Bell, Crown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useRef, useEffect, useState } from "react";
import useSignUpHook from "../../hooks/useSignUpHook";
import { useRole } from "../../hooks/useRole";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Input } from "../ui/input";
import { MdAccountBox, MdOutlineAdminPanelSettings, MdUpdate } from "react-icons/md";
import { FaSignOutAlt } from "react-icons/fa";
import SubscriptionModal from "../payment/SubscriptionModal";

interface Props {
  searchText: string,
  onSearch: (text: string) => void;
  setOpenSidebar: any;
}

const Navbar = ({ onSearch, searchText, setOpenSidebar }: Props) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { userData, logout, updateProfile, provider, updateProfileLoading, isFetching, isLoading } = useSignUpHook();
  const { role } = useRole();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profilePassword, setProfilePassword] = useState("");
  const [showProfilePassword, setShowProfilePassword] = useState(false);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | undefined>();
  const [isDark, setIsDark] = useState(true);
  const isGoogle = provider === "google"

  useEffect(() => {
    if (localStorage.getItem("theme") === "light") {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);
  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };
  useEffect(() => {
    if (userData) {
      setProfileName(userData.name || "");
      setProfileEmail(userData.email || "");
      setProfilePreview(userData.avatar_url || "");
    }
  }, [userData]);
  const handleUpdateProfile = async () => {
    try {
      if (!profileEmail || !profileFile) return;
      await updateProfile({
        name: profileName,
        email: profileEmail,
        password: profilePassword,
        file: profileFile,
      });
      setIsProfileOpen(false);
    } catch (err) {
      console.log(err);
    }
  };

  const isVipActive = userData?.subscription?.status === "active" && 
                    userData?.subscription?.expiresAt && 
                    new Date(userData.subscription.expiresAt) > new Date();

  return (<>
    <SubscriptionModal isOpen={isSubModalOpen} onClose={() => setIsSubModalOpen(false)} />
    <nav className="w-full flex px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-white dark:bg-zinc-950 border-b border-gray-200 dark:border-zinc-900 text-gray-900 dark:text-white items-center justify-between sticky top-0 z-50 transition-all duration-500">
      <div className="flex items-center flex-1">
        <Link to="/" className="flex items-center" onClick={() => setOpenSidebar(false)}>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#E50914] tracking-wider hover:text-red-500 transition-colors">TMDB</h1>
        </Link>
        <div className="flex-1 flex items-center mx-3 sm:mx-8 relative max-w-xl">
          <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 sm:size-[20px]" />
          <Input
            value={searchText}
            placeholder="Search..."
            onChange={(e) => onSearch(e.target.value)}
            className="pl-9 sm:pl-10 text-sm sm:text-base h-9 sm:h-10 w-full"
          />
          {searchText && <X size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-red-500 sm:size-[20px]" onClick={() => onSearch("")} />}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button
          onClick={() => setIsSubModalOpen(true)}
          className={`h-9 px-3.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-md ${
            isVipActive
              ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-950/30"
              : "bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white shadow-red-950/30"
          }`}
        >
          <Crown className="w-3.5 h-3.5 fill-current" />
          <span>{isVipActive ? "VIP Active" : "Upgrade to VIP"}</span>
        </Button>

        <div className="hidden md:flex items-center gap-4 font-semibold mr-4">
          <Link to="/app/discover/tv" className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors text-sm">TV Shows</Link>
          <Link to="/app/discover/movie" className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors text-sm">Movies</Link>
        </div>
          {userData && (
            <Link to="/app/myMovies" className="text-[#E50914] dark:text-[#E50914] hover:text-red-600 dark:hover:text-red-500 transition-colors text-sm truncate max-w-[100px] sm:max-w-none">Purchased</Link>
          )}

        {!isLoading && userData && (
          <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="hidden md:flex cursor-pointer border border-gray-300 dark:border-zinc-800 hover:border-gray-500 transition-colors">
                  <AvatarImage src={userData.avatar_url} />
                  <AvatarFallback className="bg-gray-200 dark:bg-zinc-800 text-black dark:text-white">{userData.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white dark:bg-zinc-950 text-black dark:text-white border-gray-200 dark:border-zinc-800 space-y-1" align="end">
                <DropdownMenuLabel className="flex items-center gap-3"><MdAccountBox /><p>My Account</p></DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-200 dark:bg-zinc-800" />
                {role === "admin" && (
                  <DropdownMenuItem className="gap-3 focus:bg-gray-100 dark:focus:bg-zinc-800 focus:text-black dark:focus:text-white cursor-pointer transition-colors font-semibold text-[#E50914] dark:text-[#E50914]" onSelect={(e) => { e.preventDefault(); navigate("/adminPanel"); }}>
                    <MdOutlineAdminPanelSettings /><p>Admin Panel</p>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem className="gap-3 focus:bg-gray-100 dark:focus:bg-zinc-800 focus:text-black dark:focus:text-white cursor-pointer transition-colors" onSelect={(e) => { e.preventDefault(); setIsProfileOpen(true); }}>
                  <MdUpdate /><p>Update Profile</p>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-3 focus:bg-gray-100 dark:focus:bg-zinc-800 focus:text-black dark:focus:text-white cursor-pointer transition-colors" onSelect={() => { navigate("/help") }}>
                  <HelpCircle /><p>Help</p>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-3 focus:bg-gray-100 dark:focus:bg-zinc-800 focus:text-black dark:focus:text-white cursor-pointer transition-colors" onClick={toggleTheme}>
                  {isDark ? <SunIcon /> : <MoonIcon />}{isDark ? <p>LightMode</p> : <p>DarkMode</p>}
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-3 focus:bg-red-100 dark:focus:bg-red-900/50 focus:text-red-600 dark:focus:text-red-500 cursor-pointer text-red-600 dark:text-red-500 transition-colors" onSelect={() => logout()}>
                  <FaSignOutAlt /><p>Sign out</p>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DialogContent className="sm:max-w-[425px] bg-white dark:bg-zinc-950 text-black dark:text-white border border-gray-200 dark:border-zinc-800 shadow-2xl transition-colors">
              <DialogHeader>
                <DialogTitle>Update Profile</DialogTitle>
              </DialogHeader>
              <div className="flex justify-center">
                <img src={profilePreview || "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"} alt="Preview" className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-gray-200 dark:border-zinc-800 shadow-md" />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Avatar Image</label>
                  <button type="button" onClick={() => {
                    setProfileFile(null);
                    if (fileRef.current) {
                      fileRef.current.value === ""
                    }
                    setProfilePreview(undefined);
                  }}
                    className="text-xs text-[#E50914] hover:underline">Remove</button>
                </div>
                <Input accept="image/*" className="bg-gray-50 dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 text-gray-700 dark:text-gray-300 file:text-[#E50914] transition-colors" type="file"
                  ref={fileRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setProfileFile(e.target.files[0]);
                      setProfilePreview(URL.createObjectURL(e.target.files[0]));
                    }
                  }} />
              </div>
              <div className="grid gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input className="bg-gray-50 dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 transition-colors" value={profileName} onChange={(e) => setProfileName(e.target.value)} type="text" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input className="bg-gray-50 dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 transition-colors" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} type="email" />
                </div>
                {!isGoogle && <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">New Password</label>
                  <div className="relative">
                    <Input className="bg-gray-50 dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 transition-colors pr-10" value={profilePassword} onChange={(e) => setProfilePassword(e.target.value)} type={showProfilePassword ? "text" : "password"} placeholder="Leave blank to keep same" />
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); setShowProfilePassword(!showProfilePassword); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 dark:hover:text-white"
                    >
                      {showProfilePassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>}
              </div>
              <DialogFooter>
                <Button className="bg-[#E50914] hover:bg-red-700 text-white transition-colors" disabled={updateProfileLoading} onClick={handleUpdateProfile}>{updateProfileLoading ? "updating..." : "save changes"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        <Button onClick={() => setOpenSidebar(true)} className="md:hidden rounded-lg bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-500"><MenuIcon size={22} /></Button>
      </div>
    </nav>
  </>);
};

export default Navbar;