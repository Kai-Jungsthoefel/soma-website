'use client';
import { motion, useReducedMotion } from 'framer-motion';
export default function Reveal({ children, className = '', delay = 0, ...props }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={reduced ? false : {opacity:0,y:42}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.12}} transition={{duration:.8,delay,ease:[.16,1,.3,1]}} {...props}>{children}</motion.div>;
}
