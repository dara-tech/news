"use client";

import { useRouter, usePathname, useParams } from "next/navigation";
import { useEffect, useState } from "react";

// Creative, advanced language switcher: "A" for English, "ក" for Khmer, in chat bubbles, inspired by the image

const LANGUAGES = [
  { code: "en", label: "English", symbol: "A" },
  { code: "km", label: "Khmer", symbol: "ក" },
];

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const currentLang = (params.lang as "en" | "km") || "en";
  const [query, setQuery] = useState("");

  useEffect(() => {
    setQuery(window.location.search);
  }, [pathname]);

  const otherLang = LANGUAGES.find((l) => l.code !== currentLang)!;

  const buildLangPath = (code: "en" | "km") => {
    let newPath = pathname.startsWith(`/${currentLang}`)
      ? pathname.substring(currentLang.length + 1)
      : pathname;
    if (!newPath.startsWith("/")) newPath = "/" + newPath;
    let result = `/${code}${newPath}`;
    if (query) result += query;
    return result;
  };

  // For animation: 0 for en, 1 for km
  const isKm = currentLang === "km";

  return (
    <button
      aria-label={`Switch to ${otherLang.label}`}
      onClick={() => router.push(buildLangPath(otherLang.code as "en" | "km"))}
      className="relative flex items-center justify-center w-16 h-10"
      style={{ outline: "none" }}
    >
      {/* Chat bubble for English ("A") */}
      <span
        className={`absolute left-0 z-10 flex items-center justify-center w-8 h-8 rounded-lg shadow-md transition-all duration-300
          ${!isKm ? "bg-red-500 text-white scale-110" : "bg-gray-400 text-white scale-95 opacity-70"}
        `}
        style={{
          top: 0,
          boxShadow: !isKm
            ? "0 2px 8px 0 #ef444433"
            : "0 1px 4px 0 #88888822",
          transition: "all 0.3s",
        }}
      >
        <span className="font-bold text-xl" style={{ fontFamily: "inherit" }}>A</span>
        {/* Chat bubble tail */}
        <span
          className="absolute"
          style={{
            left: "22px",
            bottom: "-6px",
            width: 0,
            height: 0,
            borderLeft: "6px solid #ef4444",
            borderTop: "6px solid transparent",
            borderBottom: "6px solid transparent",
            display: !isKm ? "block" : "none",
          }}
        />
      </span>
      {/* Chat bubble for Khmer ("ក") */}
      <span
        className={`absolute right-0 z-10 flex items-center justify-center w-8 h-8 rounded-lg shadow-md transition-all duration-300
          ${isKm ? "bg-gray-700 text-white scale-110" : "bg-gray-400 text-white scale-95 opacity-70"}
        `}
        style={{
          top: 0,
          boxShadow: isKm
            ? "0 2px 8px 0 #22222244"
            : "0 1px 4px 0 #88888822",
          transition: "all 0.3s",
        }}
      >
        <span className="font-bold text-xl" style={{ fontFamily: "inherit" }}>ក</span>
        {/* Chat bubble tail */}
        <span
          className="absolute"
          style={{
            right: "22px",
            bottom: "-6px",
            width: 0,
            height: 0,
            borderRight: "6px solid #374151",
            borderTop: "6px solid transparent",
            borderBottom: "6px solid transparent",
            display: isKm ? "block" : "none",
          }}
        />
      </span>
      {/* Overlap effect */}
      <span
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-white border-2 border-gray-200 dark:border-gray-600 z-0"
        style={{
          boxShadow: "0 1px 4px 0 #88888811",
        }}
        aria-hidden="true"
      />
    </button>
  );
}
