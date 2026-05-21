import React from 'react';
import { motion, Variants } from 'framer-motion';
import { ScheduleOverview } from '../mentor-features';

export function SessionsPage() {
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6 max-w-7xl mx-auto h-full flex flex-col"
        >
            <motion.div variants={itemVariants} className="flex justify-between items-end mb-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Session Management</h2>
                    <p className="text-muted-foreground mt-1 text-sm">Organize your calendar, accept requests, and schedule tasks.</p>
                </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex-1">
                <ScheduleOverview />
            </motion.div>
        </motion.div>
    );
}
