import { FaChartPie, FaUser } from "react-icons/fa";
import { MdMovie } from "react-icons/md";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

export const AdminDiscloser = ({ setTab }: { setTab: (tab: any) => void }) => {
  return (
    <>
      {/* Sidebar Mini (Desktop only) */}
      <TooltipProvider>
        <div className="overflow-x-hidden max-w-full w-[60px] bg-white dark:bg-zinc-950 border-r border-gray-200 dark:border-zinc-900 hidden md:flex flex-col items-center py-4 space-y-4 shrink-0 transition-all z-20 top-16 min-h-screen fixed">
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={() => { setTab("analytics"); }} className="focus:bg-zinc-800 p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                <p className="size-lg"><FaChartPie /></p>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Analytics</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={() => { setTab("users"); }} className="focus:bg-zinc-800 p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                <FaUser size={20} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>User</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={() => { setTab("mpurchases"); }} className="focus:bg-zinc-800 p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                <MdMovie size={20} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Purchase</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </>
  );
}