import React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

interface ReportButtonProps {
  onClick: () => void;
}

export const ReportButton: React.FC<ReportButtonProps> = ({ onClick }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onClick}
            className="bg-red-600 hover:bg-red-700 text-white p-2.5 rounded-md shadow-md shrink-0"
            title="Send Report"
            aria-label="Send Report"
          >
            <AlertCircle size={18} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Send Report</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
