"use client"

import { useEffect, useState } from "react"
import { Logo } from "./logo"

export function LoginHeader() {
  // Hidden at top, shows after scroll
  const [hideBrand, setHideBrand] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      setHideBrand(window.scrollY <= 40)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-60 w-full bg-[#050B18]/80 backdrop-blur-md border-b border-white/10">
      <div className="flex items-center justify-between px-10 py-4">
        
        {/* Brand */}
        <a href="/" className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 transition-all duration-300 ease-in-out ${
              hideBrand
                ? "opacity-0 scale-90 w-0 overflow-hidden"
                : "opacity-100 scale-100"
            }`}
          >
            <Logo />
            <h2 className="text-white text-lg font-bold whitespace-nowrap">
              Ai4Planning
            </h2>
          </div>
        </a>

        {/* Right */}
        <a
          href="/login"
          className="text-[10px] text-white font-bold text-primary uppercase tracking-widest"
        >
          Login
        </a>
      </div>
    </header>
  )
}
