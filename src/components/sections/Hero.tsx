'use client';

import { motion } from 'framer-motion';
import { ArrowRight, FlaskRound, Shield, Truck, Users } from 'lucide-react';

// Детерминированные позиции вместо случайных
const fixedPositions = [
  { left: 15, top: 10 },
  { left: 85, top: 5 },
  { left: 25, top: 40 },
  { left: 75, top: 25 },
  { left: 10, top: 70 },
  { left: 90, top: 60 },
  { left: 50, top: 15 },
  { left: 35, top: 55 },
  { left: 65, top: 45 },
  { left: 20, top: 85 },
  { left: 80, top: 75 },
  { left: 45, top: 30 },
  { left: 55, top: 65 },
  { left: 30, top: 20 },
  { left: 70, top: 50 },
  { left: 5, top: 35 },
  { left: 95, top: 40 },
  { left: 40, top: 80 },
  { left: 60, top: 10 },
  { left: 25, top: 60 },
];

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900" />
      
      {/* Animated Background Elements with fixed positions */}
      <div className="absolute inset-0 opacity-20">
        {fixedPositions.map((pos, i) => (
          <motion.div
            key={i}
            className="absolute text-white/5"
            style={{
              left: `${pos.left}%`,
              top: `${pos.top}%`,
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 360],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <FlaskRound size={48} />
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 lg:px-8 text-center text-white">
        {/* ... остальной код без изменений ... */}
      </div>
    </section>
  );
};

export default Hero;