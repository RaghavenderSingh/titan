"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CornerChevron } from "../ui/corner-chevron";
import { BorderBeam } from "../ui/border-beam";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
  showMarkers?: boolean;
}

export function FeatureCard({ title, description, icon, className, showMarkers }: FeatureCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={cn(
        "relative h-full rounded-[2.5rem] bg-white/[0.02] border border-white/10 backdrop-blur-3xl overflow-hidden group transition-all duration-500 hover:bg-white/[0.05] hover:border-white/20",
        className
      )}
    >
      <BorderBeam 
        size={250} 
        duration={12} 
        delay={9} 
        colorFrom="#3b82f6" 
        colorTo="#60a5fa" 
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      />
      
      
      {showMarkers && (
        <>
          <CornerChevron className="absolute top-6 right-6 z-20 opacity-40 group-hover:opacity-100 transition-opacity" rotation={0} />
          <CornerChevron className="absolute bottom-6 left-6 z-20 opacity-40 group-hover:opacity-100 transition-opacity" rotation={180} />
        </>
      )}


      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      

      <div className="absolute inset-1.5 md:inset-2 rounded-[2.3rem] md:rounded-[2.2rem] border border-white/[0.03] bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />


      <div className={cn(
        "relative z-10 flex flex-col p-6 md:p-8 h-full", 
        className?.includes('flex-row') ? "md:flex-row md:items-center md:gap-10" : "justify-start gap-4 md:gap-6"
      )}>
        <div className={cn("flex flex-col gap-4 md:gap-5", className?.includes('flex-row') && "md:flex-row md:items-center md:gap-10")}>
          <div className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center">
 
            <div className="absolute inset-0 rounded-lg bg-white/[0.03] ring-1 ring-white/10 group-hover:ring-blue-500/30 group-hover:bg-blue-500/5 transition-all duration-500" />
            

            <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative text-white/70 group-hover:text-blue-400 group-hover:scale-110 transition-all duration-500">
              {icon}
            </div>
          </div>
          <div className="space-y-2 md:space-y-3">
            <h3 className="text-lg md:text-2xl font-bold text-white group-hover:text-blue-50 transition-colors tracking-tight leading-none">
              {title}
            </h3>
            <p className="text-gray-400 leading-relaxed text-sm md:text-base group-hover:text-gray-300 transition-colors max-w-xl">
              {description}
            </p>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-blue-500/5 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
    </motion.div>
  );
}
