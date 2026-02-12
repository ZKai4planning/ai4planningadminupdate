"use client"
import Image from "next/image"

import logoImage from "../public/images/logo.png"

type LogoProps = {
  collapsed?: boolean
}

export function Logo({ collapsed = false }: LogoProps) {
  return (
    <div
      className={`${
        collapsed ? "w-8 h-8 p-1" : "w-10 h-10 p-1.5"
      } relative rounded-lg bg-slate-900`}
    >
      <Image
        src={logoImage}
        alt="Logo"
        fill
        className="object-contain p-1"
        priority
      />
    </div>
  )
}
