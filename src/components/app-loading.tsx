'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function AppLoading() {
    const [isLoading, setIsLoading] = useState(true);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Simulate loading progress
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => setIsLoading(false), 300);
                    return 100;
                }
                return prev + 10;
            });
        }, 150);

        return () => clearInterval(interval);
    }, []);

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
                >
                    <div className="flex flex-col items-center space-y-8 px-4">
                        {/* Animated logo container */}
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                                duration: 0.6,
                                ease: [0.43, 0.13, 0.23, 0.96]
                            }}
                            className="relative"
                        >
                            {/* Glow effect */}
                            <motion.div
                                className="absolute inset-0 rounded-full bg-primary/20 blur-2xl"
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.3, 0.5, 0.3],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />

                            {/* Logo */}
                            <motion.div
                                className="relative"
                                animate={{
                                    y: [0, -8, 0],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            >
                                <img
                                    src="/logo.png"
                                    alt="Sambhar Soul"
                                    className="w-32 h-32 object-contain relative z-10"
                                />
                            </motion.div>
                        </motion.div>

                        {/* Brand name with gradient */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            className="text-center space-y-2"
                        >
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
                                Sambhar Soul
                            </h1>
                            <p className="text-sm text-muted-foreground font-medium">
                                Authentic South Indian Flavors
                            </p>
                        </motion.div>

                        {/* Progress bar */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="w-64 space-y-2"
                        >
                            <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-orange-500 to-orange-400"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                            <p className="text-xs text-center text-muted-foreground">
                                {progress < 100 ? 'Preparing your experience...' : 'Ready!'}
                            </p>
                        </motion.div>

                        {/* Animated dots */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="flex space-x-2"
                        >
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    className="w-2 h-2 bg-orange-500 rounded-full"
                                    animate={{
                                        scale: [1, 1.5, 1],
                                        opacity: [0.5, 1, 0.5],
                                    }}
                                    transition={{
                                        duration: 1,
                                        repeat: Infinity,
                                        delay: i * 0.2,
                                        ease: "easeInOut"
                                    }}
                                />
                            ))}
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
