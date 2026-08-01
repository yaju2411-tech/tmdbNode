import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import { api } from "../../servicies/api-client";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  ticket: any;
};

export const AIEmailAssistant = ({ isOpen, onClose, ticket }: Props) => {
  const [instruction, setInstruction] = useState("");
  const [draft, setDraft] = useState("");
  const [isDrafting, setIsDrafting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const queryClient = useQueryClient();

  const handleDraft = async () => {
    if (!instruction.trim()) {
      toast.error("Please provide instructions for the AI.");
      return;
    }
    setIsDrafting(true);
    try {
      const res = await api.post(`/admin/tickets/${ticket._id}/draft-email`, {
        instruction
      });
      setDraft(res.data.draft);
      toast.success("Draft generated successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to generate draft");
    } finally {
      setIsDrafting(false);
    }
  };

  const handleSend = async () => {
    if (!draft.trim()) {
      toast.error("Draft is empty.");
      return;
    }
    setIsSending(true);
    try {
      await api.post(`/admin/tickets/${ticket._id}/send-email`, {
        subject: `Response to your Ticket #${ticket.ticketId}`,
        body: draft
      });
      queryClient.invalidateQueries({ queryKey: ["adminTickets"] });
      queryClient.refetchQueries({ queryKey: ["adminTickets"] });
      toast.success("Email sent to user!");
      setDraft("");
      setInstruction("");
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send email");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-zinc-950 border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            AI Email Assistant
          </DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-gray-400">
            Provide instructions to the AI on how to respond to {ticket?.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Instructions for AI</label>
            <Textarea 
              placeholder="e.g. Tell them to clear their cache and try again, or that we have refunded their money."
              className="resize-none dark:bg-zinc-900"
              rows={3}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
            />
          </div>

          <Button 
            onClick={handleDraft} 
            disabled={isDrafting || !instruction.trim()}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white"
          >
            {isDrafting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
            Draft with AI
          </Button>

          <div className="space-y-2">
            <label className="text-sm font-medium">Review Draft</label>
            <Textarea 
              placeholder="The generated draft will appear here. You can edit it before sending."
              className="resize-none h-40 dark:bg-zinc-900"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSend} disabled={isSending || !draft.trim()} className="bg-[#E50914] hover:bg-red-700 text-white">
            {isSending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
            Send Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
