import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Wallet, Chrome } from "lucide-react";
import { useState } from "react";
import mageCharacter from "@/assets/mage-character.png";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const [email, setEmail] = useState("");

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-md">
              <div className="flex justify-center -mb-8 relative z-10">
                <motion.img
                  src={mageCharacter}
                  alt="Character"
                  className="h-24 md:h-32 w-auto drop-shadow-[0_0_20px_hsl(269_44%_40%/0.6)]"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>

              <div className="glass-panel-ai rounded-xl border border-primary/30 p-6 pt-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-primary/20 to-transparent rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-secondary/20 to-transparent rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-primary/10 to-transparent rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-secondary/10 to-transparent rounded-br-xl" />

                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors z-10"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="text-center mb-6">
                  <h2 className="font-display text-2xl md:text-3xl font-bold gradient-text tracking-wider">
                    WELCOME
                  </h2>
                  <div className="w-12 h-0.5 bg-gradient-to-r from-primary to-secondary mx-auto mt-2 rounded-full" />
                </div>

                <div className="space-y-2 mb-4">
                  <label className="text-sm font-medium text-foreground">Email address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 rounded-xl border border-border/50 bg-muted/50 px-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full h-12 rounded-xl font-display font-semibold text-sm tracking-wider text-primary-foreground bg-gradient-to-r from-primary to-secondary hover:shadow-[0_0_25px_hsl(269_44%_40%/0.4)] transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Send Code
                </motion.button>

                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-border/50" />
                  <span className="text-xs text-muted-foreground font-medium">or</span>
                  <div className="flex-1 h-px bg-border/50" />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full h-12 rounded-xl font-display font-semibold text-sm tracking-wider text-primary-foreground border border-primary/30 bg-gradient-to-r from-primary/80 to-secondary/80 hover:shadow-[0_0_25px_hsl(269_44%_40%/0.3)] transition-all duration-300 flex items-center justify-center gap-2 mb-3"
                >
                  <Wallet className="w-4 h-4" />
                  Connect Wallet
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full h-12 rounded-xl font-medium text-sm text-foreground border border-border/50 bg-muted/30 hover:bg-muted/50 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Chrome className="w-4 h-4" />
                  Google
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
