import { motion, AnimatePresence } from "motion/react";
import { User, ArrowRight, X } from "lucide-react";

interface ProfileSetupPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onSetup: () => void;
}

export function ProfileSetupPopup({ isOpen, onClose, onSetup }: ProfileSetupPopupProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100]"
                        onClick={onClose}
                    />

                    {/* Popup */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="fixed inset-0 flex items-center justify-center z-[101] p-4 pointer-events-none"
                    >
                        <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border overflow-hidden pointer-events-auto relative">

                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-colors"
                                aria-label="Close"
                            >
                                <X className="size-5" />
                            </button>

                            {/* Content */}
                            <div className="p-8 text-center">
                                <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <User className="size-10 text-primary" />
                                </div>

                                <h2 className="text-2xl font-bold mb-3">Welcome to The-Setu!</h2>
                                <p className="text-muted-foreground mb-8 leading-relaxed">
                                    To get the most personalized experience, recommendations, and job matches, please complete your profile.
                                </p>

                                <div className="space-y-3">
                                    <button
                                        onClick={onSetup}
                                        className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
                                    >
                                        Setup My Profile
                                        <ArrowRight className="size-4" />
                                    </button>

                                    <button
                                        onClick={onClose}
                                        className="w-full py-3.5 bg-secondary/50 text-foreground rounded-xl font-medium hover:bg-secondary transition-colors"
                                    >
                                        I'll do it later
                                    </button>
                                </div>
                            </div>

                            {/* Progress Indicator (Visual Delight) */}
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-secondary">
                                <motion.div
                                    initial={{ width: "0%" }}
                                    animate={{ width: "30%" }}
                                    transition={{ delay: 0.5, duration: 1 }}
                                    className="h-full bg-primary"
                                />
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
