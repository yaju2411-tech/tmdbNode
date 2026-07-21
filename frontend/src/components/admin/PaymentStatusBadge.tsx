interface Props {
  status: string;
}

export const PaymentStatusBadge = ({
  status,
}: Props) => {
  const colors: Record<string, string> = {
    open: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    resolved:"bg-green-500/20 text-green-400 border-green-500/30",
    investigating:"bg-blue-500/20 text-blue-400 border-blue-500/30",
    rejected:"bg-red-500/20 text-red-400 border-red-500/30",
    pending:"bg-orange-500/20 text-orange-400 border-orange-500/30",
  };

  return (
    <span className={`px-3 py-1 rounded-md text-xs font-semibold border
        ${colors[status] || colors.open}`}>
      {status}
    </span>
  );
};