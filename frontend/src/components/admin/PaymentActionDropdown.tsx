import { MoreHorizontal } from "lucide-react";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";

interface Props {
  onAction: (action: string) => void
}

export const PaymentActionDropdown = ({ onAction }: Props) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="border-zinc-700 bg-zinc-900">
          <MoreHorizontal size={18} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-zinc-900 border-zinc-800 text-white w-56">
        <DropdownMenuItem className="hover:bg-blue-500 text-white px-2" onClick={() => { onAction("retry_verification") }}>
          Retry Verification
        </DropdownMenuItem>
        <DropdownMenuItem className="hover:bg-blue-500 text-white px-2" onClick={() => onAction("grant_access")}>
          Grant Movie Access
        </DropdownMenuItem>
        <DropdownMenuItem className="hover:bg-blue-500 text-white px-2" onClick={() => onAction("resend_email")}>
          Resend Email
        </DropdownMenuItem>
        <DropdownMenuItem className="hover:bg-blue-500 text-white px-2" onClick={() => onAction("regenerate_receipt")}>
          Regenerate Receipt
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}