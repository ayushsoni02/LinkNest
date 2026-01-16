import { motion } from "framer-motion";
import Logo from "../icons/Logo";

interface ServerWakeupProps {
  isVisible: boolean;
}

export default function ServerWakeup({ isVisible }: ServerWakeupProps) {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* Content */}
      <div className="relative flex flex-col items-center gap-6">
        {/* Pulsing Logo */}
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.8, 1, 0.8]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="text-indigo-400"
        >
          <div className="w-16 h-16">
            <Logo />
          </div>
        </motion.div>

        {/* App name */}
        <h1 className="text-2xl font-bold text-white tracking-tight">
          LinkNest
        </h1>

        {/* Loading message */}
        <div className="flex flex-col items-center gap-3">
          <p className="text-slate-400 text-sm">
            Waking up server...
          </p>
          
          {/* Loading dots */}
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ 
                  y: [0, -8, 0],
                  opacity: [0.4, 1, 0.4]
                }}
                transition={{ 
                  duration: 0.8, 
                  repeat: Infinity,
                  delay: i * 0.15
                }}
                className="w-2 h-2 bg-indigo-500 rounded-full"
              />
            ))}
          </div>
        </div>

        {/* Subtext */}
        <p className="text-slate-500 text-xs mt-4 max-w-xs text-center">
          Free-tier servers spin down after inactivity. This usually takes 30-60 seconds.
        </p>
      </div>
    </motion.div>
  );
}
