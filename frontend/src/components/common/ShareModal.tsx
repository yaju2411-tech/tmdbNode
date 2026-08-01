import movieLogo from "../../assets/movie.jpeg";
import tvLogo from "../../assets/tv.jpeg";
import {
  Copy,
  Link2,
  Tv2,
  Clapperboard,
  Film,
  Download,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { QRCode } from "react-qrcode-logo";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import React from "react";
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  id: number;
  title: string;
  type: "movie" | "tv";
}

export const ShareModal = ({open,onOpenChange,id,title,type,}: Props) => {
  const [mode, setMode] = useState<"url" | "qr">("url");
  const qrRef = useRef<HTMLDivElement | null>(null);
  const shareUrl = window.location.hostname === "localhost"
    ? `https://tmdb-rho-lemon.vercel.app/app/${type}Detail/${id}`
    : `https://tmdb-rho-lemon.vercel.app/app/${type}Detail/${id}`;
  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    toast.success("URL Copied");
  };
  const downloadQr = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if(!canvas) return;
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title}-qr.png`;
    link.click();
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-lg border-zinc-800 bg-zinc-950 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Share {type === "movie" ? "Movie" : "TV Show"}
          </DialogTitle>
          <DialogDescription>
            Share the {type}
          </DialogDescription>
        </DialogHeader>
        {/* TOP BUTTONS */}
        <div className="grid grid-cols-2 gap-3 mt-2">
          <Button
            onClick={() => setMode("url")} variant={mode === "url" ? "default" : "secondary"} className=" bg-zinc-800">
            <Link2 className="mr-2 h-4 w-4" />
            Copy URL
          </Button>
          <Button onClick={() => setMode("qr")} variant={mode === "qr" ? "default" : "secondary"} className="bg-zinc-800">
            Scan And Share
          </Button>
        </div>

        {/* URL MODE */}
        {mode === "url" && (
          <div className="mt-5 flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-1">
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm text-zinc-300">
                {shareUrl}
              </p>
            </div>
            <Button size="icon" onClick={handleCopy} className="shrink-0">
              Copy Url
            </Button>
          </div>
        )}

        {/* QR MODE */}
        {mode === "qr" && (
          <div className="mt-6 flex flex-col items-center">
            <div
              ref={qrRef}
              className="relative rounded-3xl bg-white p-4 shadow-2xl"
            >
              <QRCode
                value={shareUrl}
                size={220}
                logoImage={
                  type === "movie"
                    ? movieLogo
                    : tvLogo
                }
                logoWidth={50}
                logoHeight={50}
                qrStyle="dots"
                eyeRadius={10}
                removeQrCodeBehindLogo={true}
              />
            </div>
            <p className="mt-4 text-center text-lg font-semibold">
              {title}
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              Scan QR to open directly
            </p>
            <Button
              onClick={downloadQr}
              className="mt-5 w-full dark:bg-black/60 dark:text-white py-5 bg-white/60 text-black"
            >
              <Download className="mr-2 h-4 w-4" />
              Download QR
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};