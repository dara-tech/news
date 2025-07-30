import Link from "next/link"
import { motion } from "framer-motion"

interface LogoProps {
  lang: string
}

const Logo = ({ lang }: LogoProps) => {
  return (
    <Link href={`/${lang}`} className="flex items-center gap-3 font-extrabold text-2xl tracking-tight group">
      <motion.span
        className="bg-primary text-primary-foreground rounded-lg px-3 py-2 shadow group-hover:shadow-lg transition-all duration-200"
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
      >
        N
      </motion.span>
      <span className="text-foreground group-hover:text-primary transition-colors">Newsly</span>
    </Link>
  )
}

export default Logo