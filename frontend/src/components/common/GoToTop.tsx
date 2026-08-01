import { ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";

export const GoToTop = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!show) return null;

  return (
    <button
      onClick={scrollTop}
      className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-2xl transition-all"
    >
      <ChevronUp size={22} />
    </button>
  );
};