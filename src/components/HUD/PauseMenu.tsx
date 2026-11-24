import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../game/gameState';
import { SettingsPanel } from './SettingsPanel';

export const PauseMenu = () => {
  const isPaused = useGameStore((state) => state.isPaused);
  const togglePause = useGameStore((state) => state.togglePause);
  const resetGame = useGameStore((state) => state.resetGame);
  const setSettingsOpen = useGameStore((state) => state.setSettingsOpen);

  useEffect(() => {
    if (useGameStore.getState().isSettingsOpen !== isPaused) {
      setSettingsOpen(isPaused);
    }
    return () => {
      if (useGameStore.getState().isSettingsOpen) {
        setSettingsOpen(false);
      }
    };
  }, [isPaused, setSettingsOpen]);

  return (
    <AnimatePresence>
      {isPaused && (
        <motion.div
          key="pause-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md pointer-events-auto p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 15 }}
            className="w-full max-w-xl"
          >
            <SettingsPanel
              showResumeButton={true}
              isOpen={isPaused}
              onClose={() => {
                setSettingsOpen(false);
                if (useGameStore.getState().isPaused) {
                  togglePause();
                }
              }}
              onAbort={() => {
                setSettingsOpen(false);
                resetGame('MENU');
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
