"use client";

import { FadeIn } from "@/components/landing/FadeIn";
import { Plus } from "@/components/ui/plus";

export function Stats() {
  return (
    <section className="py-12 relative z-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="relative border border-white/10 bg-white/[0.02] backdrop-blur-sm">
          
          <Plus className="absolute -top-[5.5px] -left-[5.5px] z-10" />
          <Plus className="absolute -bottom-[5.5px] -right-[5.5px] z-10" />

          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-white/10">
            {[
              { label: "Uptime", value: "99.99%" },
              { label: "Deploy Time", value: "< 1s" },
              { label: "Requests/day", value: "1B+" },
              { label: "Frameworks", value: "35+" },
            ].map((stat, i) => (
              <FadeIn
                key={i}
                delay={0.2 + i * 0.1}
                direction="none"
                className="p-8 text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-white mb-1 tracking-tight">
                  {stat.value}
                </div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                  {stat.label}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
