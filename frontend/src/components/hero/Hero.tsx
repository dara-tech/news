"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { ChevronRight, ChevronLeft } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"

interface Article {
  _id: string;
  slug: string;
  title: {
    en: string;
    kh: string;
  };
  category: string;
  thumbnail?: string;
  description?: {
    en: string;
    kh: string;
  };
}

interface HeroProps {
  breaking: Article[];
  featured: Article[];
  categories: string[];
}

const Hero: React.FC<HeroProps> = ({ breaking, featured, categories }) => {
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0)
  const { language } = useLanguage()

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentNewsIndex((prev) => (prev + 1) % breaking.length)
    }, 8000) // Increased from 5000ms to 8000ms for slower rotation
    return () => clearInterval(interval)
  }, [breaking.length])

  const mainFeature = featured[0] || breaking[0]

  return (
    <section className="relative bg-gradient-to-b from-background to-background/80">
      {/* Breaking News Ticker */}
      <div className="h-8 bg-black/80 text-white">
        <div className="container mx-auto flex items-center px-4">
          <span className="text-sm font-semibold">Breaking News:</span>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentNewsIndex}
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.9 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="ml-4 text-sm"
            >
              <Link
                href={`/news/${breaking[currentNewsIndex]?.slug}`}
                className="hover:text-primary transition-colors"
              >
                {breaking[currentNewsIndex]?.title[language] || "No breaking news"}
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Main Hero Content */}
      <div className="container mx-auto px-4 py-8 relative">
        {/* Navigation Arrows */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 hidden md:block">
          <button
            onClick={() => {
              setCurrentNewsIndex((prev) =>
                prev === 0 ? breaking.length - 1 : prev - 1
              )
            }}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:block">
          <button
            onClick={() => {
              setCurrentNewsIndex((prev) => (prev + 1) % breaking.length)
            }}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Main Feature Story */}
          <div className="col-span-2 bg-white/5 rounded-lg overflow-hidden relative group">
            <div className="relative h-96">
              {mainFeature?.thumbnail && (
                <img
                  src={mainFeature.thumbnail}
                  alt={mainFeature.title.en}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement
                    img.src = '/placeholder.jpg'
                    img.alt = 'Placeholder image'
                  }}
                  loading="lazy"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-300 group-hover:opacity-90" />
              <div className="absolute bottom-0 left-0 p-6 transition-all duration-300 group-hover:translate-y-2">
                <Link href={`/news/${mainFeature?.slug}`} className="hover:underline">
                  <h1 className="text-4xl font-bold text-white mb-2">
                    {mainFeature?.title?.[language] || 'No Title'}
                  </h1>
                </Link>
                {mainFeature?.description?.en && (
                  <Link href={`/news/${mainFeature?.slug}`} className="hover:underline">
                    <p className="text-white/90">
                      {mainFeature.description?.[language]}
                    </p>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Secondary Stories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featured.slice(1, 5).map((article) => (
              <motion.div
                key={article._id}
                whileHover={{ scale: 1.02 }}
                className="bg-white/5 rounded-lg overflow-hidden"
              >
                <div className="relative h-48 group">
                  {article.thumbnail && (
                    <img
                      src={article.thumbnail}
                      alt={article.title.en}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement
                        img.src = '/placeholder.jpg'
                        img.alt = 'Placeholder image'
                      }}
                      loading="lazy"
                    />
                  )}
                </div>
                <div className="p-4">
                  <Link href={`/news/${article.slug}`} className="hover:underline">
                    <h2 className="text-xl font-semibold mb-2">
                      {article.title?.[language] || 'No Title'}
                    </h2>
                  </Link>
                  {article.description?.en && (
                    <Link href={`/news/${article.slug}`} className="hover:underline">
                      <p className="text-gray-300">
                        {article.description?.[language]}
                      </p>
                    </Link>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Category Sections */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">Explore Categories</h2>
          <div className="flex flex-wrap gap-4 justify-center">
            {categories.map((category) => (
              <Link
                key={category}
                href={`/category/${category.toLowerCase()}`}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 hover:scale-105"
              >
                <span>{category.charAt(0).toUpperCase()}</span>
                <span>{category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>


    </section>
  )
}

export default Hero
