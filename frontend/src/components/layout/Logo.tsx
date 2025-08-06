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
    logoText: 'Newsly',
    logoTextColor: '#000000',
    logoBackgroundColor: '#ffffff',
    logoFontSize: 24,
  });

  useEffect(() => {
    const fetchLogoSettings = async () => {
      try {
        const response = await api.get('/admin/settings/logo');
        
        if (response.data.success && response.data.settings) {
          setSettings(prev => ({ ...prev, ...response.data.settings }));
        }
      } catch (error) {
        // Silently use default settings if API call fails
        console.log('Using default logo settings');
      }
    };

    fetchLogoSettings();
  }, []);

  const getLogoStyles = () => {
    const styles: React.CSSProperties = {
      fontSize: `${settings.logoFontSize || 24}px`,
      fontWeight: 'bold',
      color: settings.logoTextColor || '#000000',
      backgroundColor: settings.logoBackgroundColor || '#ffffff',
      padding: '8px',
      borderRadius: '4px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      transition: 'all 0.2s ease-in-out',
    };

    return styles;
  };

  const renderLogoContent = () => {
    // If we have an image logo and URL, display it
    if (settings.logoDisplayMode === 'image' && settings.logoUrl) {
      return (
        <img
          src={settings.logoUrl}
          alt="Logo"
          className="h-8 w-auto object-contain"
          style={{ filter: 'brightness(0) saturate(100%) invert(var(--tw-invert))' }}
          onError={(e) => {
            // If image fails to load, hide it and fall back to text
            e.currentTarget.style.display = 'none';
            const parent = e.currentTarget.parentElement;
            if (parent) {
              parent.innerHTML = `
                <span style="
                  font-size: ${settings.logoFontSize || 24}px;
                  font-weight: bold;
                  color: ${settings.logoTextColor || '#000000'};
                  background-color: ${settings.logoBackgroundColor || '#ffffff'};
                  padding: 8px;
                  border-radius: 4px;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                ">
                  ${settings.logoText || 'Newsly'}
                </span>
              `;
            }
          }}
        />
      );
    }

    // Display text logo
    return (
      <motion.span
        style={getLogoStyles()}
        className="flex items-center justify-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {settings.logoText || 'Newsly'}
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