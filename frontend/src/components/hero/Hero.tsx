"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useLanguage } from "@/context/LanguageContext"
import { Article, Category } from "@/types"

// Import the new components
import { BreakingNewsTicker } from "./BreakingNewsTicker"
import MainFeature from "./MainFeature"
import SecondaryFeatureGrid from "./SecondaryFeatureGrid"

interface HeroProps {
  breaking: Article[];
  featured: Article[];
  categories: Category[];
}

// Animation variants for staggering children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}


const Hero: React.FC<HeroProps> = ({ breaking, featured, categories }) => {
  const { language } = useLanguage()

  // Ensure data exists before destructuring to prevent errors
  const mainFeature = featured?.[0] || breaking?.[0]
  const secondaryFeatures = featured?.slice(1, 5) || []

  return (
    <section className="">
      <BreakingNewsTicker articles={breaking} />

      <motion.div
        className="container mx-auto px-4 pt-8 md:pt-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {mainFeature && <MainFeature article={mainFeature} />}
          <SecondaryFeatureGrid articles={secondaryFeatures} />
        </div>

        <motion.div className="mt-12 md:mt-16">
          <h2 className="text-2xl font-bold text-center mb-6">
            Explore Topics
          </h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <Link
                key={category._id}
                href={`/category/${category.slug?.[language] || category._id}`}
                className="bg-white/5 border border-white/10 hover:bg-white/10 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200"
              >
                {category.name[language]}
              </Link>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}

export default Hero