"use client";

import { useRouter, usePathname, useParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";

// Center the icon content using flex utilities
const LANGUAGES = [
  {
    code: "en",
    label: "English",
    icon: (
      <span className="flex items-center justify-center w-full h-full font-bold text-base">
        En
      </span>
    ),
  },
  {
    code: "km",
    label: "ភាសាខ្មែរ",
    icon: (
      <span className="flex items-center justify-center w-full h-full font-bold text-base">
        ខ្មែរ
      </span>
    ),
  },
];

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const currentLang = (params.lang as string) || "en";
  const [loading, setLoading] = useState(false);

  // Removed unused variable currentLangData
  const otherLang = LANGUAGES.find(l => l.code !== currentLang) || LANGUAGES[1];

  // Build a new path with the selected language code
  const buildLangPath = useCallback(
    (code: string) => {
      let newPath = pathname.startsWith(`/${currentLang}`)
        ? pathname.substring(currentLang.length + 1)
        : pathname;
      if (!newPath.startsWith("/")) newPath = "/" + newPath;
      // Preserve query string if present
      const search = typeof window !== "undefined" ? window.location.search : "";
      return `/${code}${newPath}${search}`;
    },
    [pathname, currentLang]
  );

  const handleSwitch = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await router.push(buildLangPath(otherLang.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSwitch}
      aria-label={`Switch to ${otherLang.label}`}
      disabled={loading}
      variant="outline"
      className="flex items-center gap-2 px-3 py-1 rounded-md text-base"
      type="button"
    >
      <span
        className="inline-flex items-center justify-center w-6 h-6 text-lg"
        aria-hidden="true"
      >
        {otherLang.icon}
      </span>
      <span className="hidden sm:inline items-center">{otherLang.label}</span>
      {loading && (
        <svg className="animate-spin ml-2 h-4 w-4 text-gray-500" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      )}
    </Button>
  );
}
