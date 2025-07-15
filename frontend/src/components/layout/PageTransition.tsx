'use client';

import { motion } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const variants = {
    hidden: { opacity: 0, y: 15 },
    enter: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="enter"
      transition={{ ease: 'linear', duration: 0.3, delay: 0.1 }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
