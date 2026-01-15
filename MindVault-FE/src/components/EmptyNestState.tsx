// EmptyNestState - Beautiful empty state for the dashboard
// Features: Glowing button, subtle animations, gradient backgrounds
import { motion } from 'framer-motion';
import { Link2, Sparkles, Plus, Zap } from 'lucide-react';

interface EmptyNestStateProps {
    hasFilters?: boolean;
    onClearFilters?: () => void;
    onAddContent?: () => void;
}

export default function EmptyNestState({ 
    hasFilters = false, 
    onClearFilters,
    onAddContent 
}: EmptyNestStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
        >
            {/* Background gradient orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl"
                />
            </div>

            {/* Content */}
            <div className="relative z-10">
                {/* Animated icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                        delay: 0.2
                    }}
                    className="relative mb-8"
                >
                    {/* Glow ring */}
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 0.8, 0.5],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-xl"
                    />
                    
                    {/* Icon container */}
                    <div className="relative w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/30">
                        <Link2 size={40} className="text-white" strokeWidth={1.5} />
                        
                        {/* Sparkle decoration */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute -top-2 -right-2"
                        >
                            <Sparkles size={20} className="text-yellow-400" />
                        </motion.div>
                    </div>
                </motion.div>

                {/* Text content */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-4">
                        {hasFilters ? 'No matches found' : 'Your nest is empty'}
                    </h2>
                    <p className="text-slate-400 max-w-md mx-auto text-lg mb-8">
                        {hasFilters 
                            ? "We couldn't find any links matching your current filters. Try adjusting your search."
                            : "Start building your knowledge vault. Drop any URL and watch the magic happen."
                        }
                    </p>
                </motion.div>

                {/* Action buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    {hasFilters ? (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onClearFilters}
                            className="px-8 py-3.5 rounded-2xl bg-slate-800 border border-slate-700 text-white font-semibold hover:bg-slate-700 transition-all"
                        >
                            Clear all filters
                        </motion.button>
                    ) : (
                        <>
                            {/* Primary CTA - Glowing button */}
                            <motion.button
                                whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(99, 102, 241, 0.4)" }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onAddContent}
                                className="relative group px-8 py-4 rounded-2xl font-semibold text-white overflow-hidden"
                            >
                                {/* Button background */}
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl" />
                                
                                {/* Shimmer effect */}
                                <motion.div
                                    animate={{
                                        x: ['-100%', '100%'],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "linear",
                                        repeatDelay: 1
                                    }}
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                                />
                                
                                {/* Button content */}
                                <span className="relative flex items-center gap-2">
                                    <Plus size={20} />
                                    Drop your first link
                                </span>
                            </motion.button>

                            {/* Secondary hint */}
                            <div className="flex items-center gap-2 text-slate-500 text-sm">
                                <Zap size={14} className="text-yellow-500" />
                                <span>Paste any URL to get started</span>
                            </div>
                        </>
                    )}
                </motion.div>

                {/* Feature hints */}
                {!hasFilters && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
                    >
                        {[
                            { icon: '🎬', title: 'YouTube', desc: 'Videos & playlists' },
                            { icon: '📝', title: 'Articles', desc: 'News & blogs' },
                            { icon: '🐙', title: 'GitHub', desc: 'Repos & code' },
                        ].map((item, i) => (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.9 + i * 0.1 }}
                                className="text-center"
                            >
                                <div className="text-3xl mb-2">{item.icon}</div>
                                <div className="text-sm font-medium text-slate-300">{item.title}</div>
                                <div className="text-xs text-slate-500">{item.desc}</div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
