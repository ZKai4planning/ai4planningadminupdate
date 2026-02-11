"use client"
import Image from "next/image"

import logoImage from "../public/images/logo.png"

type LogoProps = {
  collapsed?: boolean
}

export function Logo({ collapsed = false }: LogoProps) {
  return (
    <div className={`${collapsed ? "w-8 h-8" : "w-10 h-10"} relative`}>
      <Image
        src={logoImage}
        alt="Logo"
        fill
        className="object-contain"
        priority
      />
    </div>
  )
}
