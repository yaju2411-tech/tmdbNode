import React, { useRef, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Eye, EyeOff } from "lucide-react";
import useSignUpHook from "../../hooks/useSignUpHook";

interface Props {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

export const SettingsModal = ({ isOpen, setIsOpen }: Props) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const { userData, updateProfile, provider, updateProfileLoading } = useSignUpHook();
  
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profilePassword, setProfilePassword] = useState("");
  const [showProfilePassword, setShowProfilePassword] = useState(false);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | undefined>();

  const isGoogle = provider === "google";

  useEffect(() => {
    if (userData) {
      setProfileName(userData.name || "");
      setProfileEmail(userData.email || "");
      setProfilePreview(userData.avatar_url || "");
    }
  }, [userData]);

  const handleUpdateProfile = async () => {
    try {
      if (!profileEmail && !profileName && !profileFile && !profilePassword) {
          setIsOpen(false);
          return;
      }
      await updateProfile({
        name: profileName,
        email: profileEmail,
        password: profilePassword,
        file: profileFile,
      });
      setIsOpen(false);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-[#09090b] text-gray-900 dark:text-white border border-gray-200 dark:border-zinc-800 shadow-2xl transition-colors z-[100]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Update Profile</DialogTitle>
        </DialogHeader>
        
        <div className="flex justify-center my-2">
          <img
            src={profilePreview || "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"}
            alt="Preview"
            className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 dark:border-zinc-800 shadow-md"
          />
        </div>
        
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Avatar Image</label>
            <button
              type="button"
              onClick={() => { 
                setProfileFile(null);  
                if (fileRef.current) {
                  fileRef.current.value = "";
                }
                setProfilePreview(userData?.avatar_url || undefined); 
              }} 
              className="text-xs text-red-600 dark:text-red-500 hover:underline font-semibold"
            >
              Remove
            </button>
          </div>
          <Input
            accept="image/*"
            className="bg-gray-50 dark:bg-[#18181b] border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-gray-300 file:text-[#E50914] file:font-semibold transition-colors h-10"
            type="file"
            ref={fileRef}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setProfileFile(e.target.files[0]);
                setProfilePreview(URL.createObjectURL(e.target.files[0]));
              }
            }}
          />
        </div>
        
        <div className="flex flex-col gap-1 mt-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Name</label>
          <Input
            className="bg-gray-50 dark:bg-[#18181b] border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white transition-colors h-10"
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            type="text"
          />
        </div>
        
        <div className="flex flex-col gap-1 mt-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Email</label>
          <Input
            className="bg-gray-50 dark:bg-[#18181b] border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white transition-colors h-10"
            value={profileEmail}
            onChange={(e) => setProfileEmail(e.target.value)}
            type="email"
          />
        </div>
        
        {!isGoogle && (
          <div className="flex flex-col gap-1 mt-2 mb-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">New Password</label>
            <div className="relative">
              <Input
                className="bg-gray-50 dark:bg-[#18181b] border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white transition-colors pr-10 h-10 placeholder:text-gray-400 dark:placeholder:text-zinc-500"
                value={profilePassword}
                onChange={(e) => setProfilePassword(e.target.value)}
                type={showProfilePassword ? "text" : "password"}
                placeholder="Leave blank to keep same"
              />
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); setShowProfilePassword(!showProfilePassword); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-white"
              >
                {showProfilePassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        )}
        
        <DialogFooter className="mt-4">
          <Button
            className="w-full sm:w-auto bg-[#E50914] hover:bg-red-700 text-white font-bold rounded-xl py-2 transition-colors"
            disabled={updateProfileLoading}
            onClick={handleUpdateProfile}
          >
            {updateProfileLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
