import React, { useState, useEffect } from "react";
import { useAdminHook } from "../../hooks/UseAdminHook";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { BadgeCheckIcon, Loader2, UserCircle } from "lucide-react";
import { toast } from "sonner";

interface AdminUpdateProfileDialogProps {
  children?: React.ReactNode;
  adminData: any;
}

export const AdminUpdateProfileDialog: React.FC<AdminUpdateProfileDialogProps> = ({ children, adminData }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | undefined>();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const { updateAdmin } = useAdminHook();

  useEffect(() => {
    if (open && adminData) {
      setName(adminData.name || "");
      setEmail(adminData.email || "");
      setPreview(adminData.avatar_url);
      setFile(null);
    }
  }, [open, adminData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminData?.user_id) {
      toast.error("Admin ID not found.");
      return;
    }
    
    setIsUpdating(true);
    try {
      await updateAdmin({
        id: adminData.user_id,
        name,
        email,
        file
      });
      setOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="w-full justify-start gap-2 border-zinc-300 dark:border-zinc-700">
            <BadgeCheckIcon size={16} /> Update Profile
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-900 rounded-xl shadow-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold dark:text-white">Update Profile</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="flex justify-center">
            <div className="relative group cursor-pointer" onClick={() => document.getElementById("admin-avatar-upload")?.click()}>
              {preview ? (
                <img 
                  src={preview} 
                  alt="Admin Avatar" 
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 dark:border-zinc-800 shadow-md transition-opacity group-hover:opacity-70"
                />
              ) : (
                <UserCircle className="w-24 h-24 text-gray-400 group-hover:text-gray-500 transition-colors" />
              )}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xs font-semibold bg-black/50 px-2 py-1 rounded">Change</span>
              </div>
            </div>
            <input 
              id="admin-avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setFile(f);
                  setPreview(URL.createObjectURL(f));
                }
              }}
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-gray-100 dark:bg-zinc-900 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                title="Email cannot be changed"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-zinc-800">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isUpdating} className="dark:border-zinc-700">
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isUpdating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
