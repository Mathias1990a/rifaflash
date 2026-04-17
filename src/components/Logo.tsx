import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  animated?: boolean;
}

export function Logo({ size = 'md', showText = true, animated = true }: LogoProps) {
  const sizes = {
    sm: { container: 40, bolt: 20, badge: 14, font: 'text-sm' },
    md: { container: 48, bolt: 24, badge: 16, font: 'text-base' },
    lg: { container: 64, bolt: 32, badge: 20, font: 'text-xl' },
    xl: { container: 120, bolt: 60, badge: 36, font: 'text-3xl' }
  };

  const s = sizes[size];

  const LogoSVG = (
    <svg
      width={s.container}
      height={s.container}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Gradiente de fondo - violeta a azul */}
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="50%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        
        {/* Gradiente del rayo - dorado */}
        <linearGradient id="boltGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        
        {/* Sombra interior */}
        <radialGradient id="innerShadow" cx="50%" cy="50%" r="50%">
          <stop offset="70%" stopColor="transparent" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.3)" />
        </radialGradient>
        
        {/* Brillo */}
        <linearGradient id="shine" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
          <stop offset="50%" stopColor="transparent" />
        </linearGradient>
        
        {/* Gradiente del badge */}
        <linearGradient id="badgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e5e7eb" />
        </linearGradient>
      </defs>
      
      {/* Círculo de fondo */}
      <circle cx="100" cy="100" r="95" fill="url(#bgGradient)" />
      
      {/* Sombra interior */}
      <circle cx="100" cy="100" r="95" fill="url(#innerShadow)" />
      
      {/* Brillo */}
      <circle cx="100" cy="100" r="95" fill="url(#shine)" opacity="0.6" />
      
      {/* Borde dorado */}
      <circle cx="100" cy="100" r="92" stroke="url(#boltGradient)" strokeWidth="4" />
      
      {/* Rayo dorado */}
      <motion.path
        d="M115 35 L75 95 L95 95 L85 145 L125 85 L105 85 L115 35 Z"
        fill="url(#boltGradient)"
        stroke="#f59e0b"
        strokeWidth="2"
        initial={animated ? { pathLength: 0, opacity: 0 } : false}
        animate={animated ? { pathLength: 1, opacity: 1 } : false}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
      
      {/* Sombra del rayo */}
      <path
        d="M117 37 L77 97 L97 97 L87 147 L127 87 L107 87 L117 37 Z"
        fill="rgba(0,0,0,0.2)"
        transform="translate(4, 4)"
      />
      
      {/* Badge 100K */}
      <g transform="translate(125, 115)">
        {/* Círculo del badge */}
        <circle cx="0" cy="0" r="28" fill="url(#badgeGradient)" stroke="#fbbf24" strokeWidth="3" />
        
        {/* Borde dorado del badge */}
        <circle cx="0" cy="0" r="25" fill="none" stroke="url(#boltGradient)" strokeWidth="2" />
        
        {/* Texto 100K */}
        <text
          x="0"
          y="5"
          textAnchor="middle"
          fontFamily="Arial, sans-serif"
          fontWeight="900"
          fontSize="16"
          fill="#1e1b4b"
        >
          100K
        </text>
      </g>
    </svg>
  );

  if (!showText) {
    return (
      <div className="flex items-center justify-center">
        {animated ? (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {LogoSVG}
          </motion.div>
        ) : (
          LogoSVG
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {animated ? (
        <motion.div
          whileHover={{ scale: 1.05, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          {LogoSVG}
        </motion.div>
      ) : (
        LogoSVG
      )}
      
      {showText && (
        <div className="flex flex-col">
          <span className={`font-display tracking-wider ${s.font} text-white`}>
            Rifa
            <span className="text-yellow-400">Flash</span>
          </span>
        </div>
      )}
    </div>
  );
}

// Componente de splash screen para la APK
export function SplashScreen({ onComplete }: { onComplete?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 2.5, duration: 0.5 }}
      onAnimationComplete={onComplete}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #4c1d95 0%, #6366f1 50%, #3b82f6 100%)'
      }}
    >
      {/* Fondo animado */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(251, 191, 36, 0.1) 0%, transparent 50%)'
        }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      
      {/* Logo grande */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, duration: 1 }}
      >
        <Logo size="xl" showText={false} animated={false} />
      </motion.div>
      
      {/* Texto */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-6 text-4xl font-display text-white tracking-wider"
      >
        Rifa<span className="text-yellow-400">Flash</span>
      </motion.h1>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="mt-2 text-white/70 text-lg"
      >
        Concursos Flash AR
      </motion.p>
      
      {/* Barra de carga */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: 200 }}
        transition={{ delay: 1, duration: 1.5, ease: "easeInOut" }}
        className="mt-8 h-1 bg-yellow-400 rounded-full"
      />
      
      {/* Partículas doradas */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-yellow-400 rounded-full"
          style={{
            left: `${20 + i * 15}%`,
            top: `${30 + (i % 2) * 40}%`
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.5, 1, 0.5],
            scale: [1, 1.5, 1]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2
          }}
        />
      ))}
    </motion.div>
  );
}