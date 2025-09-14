import Link from "next/link"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import api from "@/lib/api"

interface LogoProps {
  lang: string
}

interface LogoSettings {
  logoUrl?: string;
  logoDisplayMode?: 'image' | 'text';
  logoText?: string;
  logoTextColor?: string;
  logoBackgroundColor?: string;
  logoFontSize?: number;
}

const Logo = ({ lang }: LogoProps) => {
  const [settings, setSettings] = useState<LogoSettings>({
    logoDisplayMode: 'text',
    logoText: 'Razewire',
    logoTextColor: '#000000',
    logoBackgroundColor: '#ffffff',
    logoFontSize: 24,
  });
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchLogoSettings = async () => {
      try {
        const response = await api.get('/settings/public/logo');
        
        if (response.data.success && response.data.settings) {
          setSettings(prev => ({ ...prev, ...response.data.settings }));
          // Reset image error when settings change
          setImageError(false);
        }
      } catch (error) {
        // Silently use default settings if API call fails
      }
    };

    fetchLogoSettings();
  }, []);


  const renderLogoContent = () => {
    // If we have an image logo and URL, and no image error, display it
    if (settings.logoDisplayMode === 'image' && settings.logoUrl && !imageError) {
      return (
        <img
          src={settings.logoUrl}
          alt="Logo"
          className="h-8 w-auto object-contain"
          onError={() => {
            // If image fails to load, set error state to fall back to text
            setImageError(true);
          }}
        />
      );
    }

    // Display text logo (fallback or default)
    return (
      <motion.span

        className="flex items-center justify-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {settings.logoText || 'Razewire'}
      </motion.span>
    );
  };

  return (
    <Link href={`/${lang}`} className="flex items-center gap-3 font-extrabold text-2xl tracking-tight group">
      {renderLogoContent()}
    </Link>
  )
}

export default Logo