'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function LoadingScreen() {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Hide loading screen after a minimum time
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    if (!isVisible) return null;

    return (
        <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
        >
            <div className="flex flex-col items-center space-y-6">
                {/* Logo with pulse animation */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                        duration: 0.5,
                        ease: "easeOut"
                    }}
                >
                    <motion.img
                        src="/logo.png"
                        alt="Sambhar Soul"
                        className="w-32 h-32 object-contain"
                        animate={{
                            scale: [1, 1.05, 1],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                </motion.div>

                {/* App name */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-center"
                >
                    <h1 className="text-3xl font-bold text-primary mb-2">Sambhar Soul</h1>
                    <p className="text-sm text-muted-foreground">Authentic South Indian Flavors</p>
                </motion.div>

                {/* Loading spinner */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center space-x-2"
                >
                    <div className="flex space-x-1">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                className="w-2 h-2 bg-primary rounded-full"
                                animate={{
                                    y: [0, -10, 0],
                                    opacity: [0.5, 1, 0.5],
                                }}
                                transition={{
                                    duration: 0.8,
                                    repeat: Infinity,
                                    delay: i * 0.15,
                                    ease: "easeInOut"
                                }}
                            />
                        ))}
                    </div>
                </motion.div>

                {/* Loading text */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-xs text-muted-foreground"
                >
                    Preparing your experience...
                </motion.p>
            </div>
        </motion.div>
    );
}
