"use client";

import { useRouter, usePathname, useParams } from "next/navigation";
import { useState } from "react";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "km", label: "Khmer", flag: "🇰🇭" },
];

const LanguageSwitcher = () => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const currentLang = (params.lang as "en" | "km") || "en";
  const [open, setOpen] = useState(false);

  const handleSwitch = (code: "en" | "km") => {
    if (code === currentLang) return;
    const newPath = pathname.startsWith(`/${currentLang}`)
      ? pathname.substring(currentLang.length + 1)
      : pathname;
    router.push(`/${code}${newPath}`);
    setOpen(false);
  };

  const current = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];
  const other = LANGUAGES.find((l) => l.code !== currentLang) || LANGUAGES[1];

  return (
    <div className="relative select-none">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-2 px-3 py-1 rounded-md border bg-background hover:bg-muted transition"
      >
        <span className="text-lg" role="img" aria-hidden="true">{current.flag}</span>
        <span className="text-xs font-semibold uppercase">{current.code}</span>
        <svg
          className={`w-4 h-4 ml-1 transition-transform ${open ? "rotate-180" : "rotate-0"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <ul
          className="absolute left-0 mt-2 min-w-[100px] rounded-md border bg-background shadow-lg z-50"
          role="listbox"
          tabIndex={-1}
        >
          <li>
            <button
              onClick={() => handleSwitch(other.code as "en" | "km")}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted text-sm"
              role="option"
              aria-selected={false}
            >
              <span className="text-lg" role="img" aria-hidden="true">{other.flag}</span>
              <span>{other.label}</span>
            </button>
          </li>
        </ul>
      )}
    </div>
  );
};

export default LanguageSwitcher;
