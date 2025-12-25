import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface CornerChevronProps {
  className?: string;
  rotation?: number;
}

export function CornerChevron({ className, rotation = 0 }: CornerChevronProps) {
  return (
    <motion.svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-white/60", className)}
      style={{ rotate: rotation }}
      animate={{
        opacity: [0.3, 0.6, 0.3],
        scale: [0.95, 1.05, 0.95],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M10.75 8.75L14.25 12L10.75 15.25"
      ></path>
    </motion.svg>
  );
}
