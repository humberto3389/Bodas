import React from 'react';
import { motion } from 'framer-motion';

const NavbarSnowParticle = ({ mobile = false }: { mobile?: boolean }) => {
  const isLarge = Math.random() < 0.3;
  const sizeBase = isLarge ? Math.random() * 8 + 6 : Math.random() * 5 + 3;
  const size = sizeBase * (mobile ? 0.6 : 1);
  const startX = Math.random() * 100;
  const startY = Math.random() * 100;
  const duration = Math.random() * 6 + (isLarge ? 8 : 5);
  const delay = Math.random() * -8;
  const swayAmount = Math.random() * 50 + (isLarge ? 30 : 20);
  const opacity = isLarge ? 1 : Math.random() * 0.4 + 0.6;

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        width: size + 'px',
        height: size + 'px',
        borderRadius: '50%',
        backgroundColor: `rgba(255, 255, 255, ${opacity})`,
        left: `${startX}%`,
        top: `${startY}%`,
        zIndex: 1,
      }}
      animate={{
        y: [`${startY}%`, `${startY + 150}%`],
        x: [0, swayAmount, -swayAmount, 0],
      }}
      transition={{
        y: { duration, repeat: Infinity, ease: "linear", delay },
        x: { duration: duration * 1.8, repeat: Infinity, ease: "easeInOut", delay },
      }}
    />
  );
};

const GeometricParticle = ({ mobile = false }: { mobile?: boolean }) => {
  const size = Math.random() * (mobile ? 4 : 8) + 2;
  const startX = Math.random() * 100;
  const startY = Math.random() * 100;
  const duration = Math.random() * 8 + 12;
  const delay = Math.random() * -15;

  return (
    <motion.div
      className="absolute pointer-events-none rounded-full bg-white/5 backdrop-blur-sm"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        left: `${startX}%`,
        top: `${startY}%`,
      }}
      animate={{
        y: [`${startY}%`, `${startY + 150}%`],
        x: [0, Math.random() * 30 - 15, 0],
        rotate: [0, 180, 360],
      }}
      transition={{
        y: { duration, repeat: Infinity, ease: "linear", delay },
        x: { duration: duration * 1.5, repeat: Infinity, ease: "easeInOut", delay },
        rotate: { duration: duration * 2, repeat: Infinity, ease: "linear", delay }
      }}
    />
  );
};

export const LandingParticles = React.memo(({ isMobile, isDark }: { isMobile: boolean, isDark: boolean }) => {
  return (
    <>
      {/* Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: isMobile ? 4 : 12 }).map((_, i) => (
          <GeometricParticle key={i} mobile={isMobile} />
        ))}
      </div>
      
      {/* Navbar Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
          {Array.from({ length: isMobile ? 3 : 10 }).map((_, i) => (
            <NavbarSnowParticle key={i} mobile={isMobile} />
          ))}
      </div>
    </>
  );
});
