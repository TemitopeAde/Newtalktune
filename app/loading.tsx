import React from "react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background">
      <div className="relative flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-white/50 border-t-white"></div>
        <p className="text-xs font-medium tracking-widest text-neutral-500 animate-pulse">
          Loading
        </p>
      </div>
    </div>
  );
}
