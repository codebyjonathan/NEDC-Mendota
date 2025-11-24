"use client"

import Image from "next/image"

export function AppHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <>
      {/* Status Bar */}
      <div className="bg-white px-6 py-3 flex justify-between items-center text-sm border-b border-gray-100">
        <span className="font-semibold">9:41</span>
        <div className="flex items-center gap-1">
          <svg className="w-4 h-3" viewBox="0 0 16 12" fill="none">
            <rect x="0.5" y="0.5" width="15" height="11" rx="1.5" stroke="black" />
            <rect x="2" y="2" width="10" height="8" fill="black" />
          </svg>
        </div>
      </div>

      {/* App Header */}
      <div className="bg-white px-6 py-4 flex items-center gap-4 shadow-sm">
        <div className="w-14 h-14 flex-shrink-0">
          <Image src="/logo.png" alt="Logo" width={56} height={56} className="w-full h-full object-contain" />
        </div>
        <div className="flex-1">
          <h1 className="text-base font-bold text-gray-900 leading-tight">{title}</h1>
          <p className="text-xs text-gray-600">{subtitle}</p>
        </div>
      </div>
    </>
  )
}
