import { cn } from "@/lib/utils";

interface PlusProps {
  className?: string;
}

export function Plus({ className }: PlusProps) {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 11 11"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-white/40", className)}
    >
      <path
        d="M5.5 11V0M0 5.5H11"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  );
}
