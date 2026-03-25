"use client";

import { useState } from "react";

export default function Header() {
  const [isLight, setIsLight] = useState(false);

  function toggleTheme() {
    const next = !isLight;
    setIsLight(next);
    document.documentElement.classList.toggle("light", next);
  }

  return (
    <header className="flex items-center justify-between px-4 py-3 md:px-7 md:py-4 border-b border-border">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg btn-gradient flex items-center justify-center">
          <span className="text-white text-xs font-mono" aria-hidden="true">&#9835;</span>
        </div>
        <span className="font-mono text-sm text-text-primary font-medium tracking-tight">
          Song Mood
        </span>
      </div>

      <button
        onClick={toggleTheme}
        aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
        className="w-[26px] h-[26px] rounded-full bg-inner-card flex items-center justify-center cursor-pointer hover:brightness-125 transition-all"
      >
        <span className="text-[12px]" aria-hidden="true">
          {isLight ? "☀" : "☽"}
        </span>
      </button>
    </header>
  );
}
