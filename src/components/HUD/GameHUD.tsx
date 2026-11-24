import { useGameStore } from '../../game/gameState';
import { Crosshair } from './Crosshair';
import { ScoreBoard } from './ScoreBoard';
import { AmmoHUD } from './AmmoHUD';
import { ControlsPanel } from './ControlsPanel';
import { MainMenu } from './MainMenu';
import { GameOver } from './GameOver';
import { TopBar } from './TopBar';
import { RoundTransition } from './RoundTransition';
import { PauseMenu } from './PauseMenu';
import { LevelMap } from './LevelMap';
import { PowerSelection, ActivePowersBar } from './PowerSelection';
import { BossBar } from './BossBar';
import { FpsCounter } from './FpsCounter';
import { WaveBanner } from './WaveBanner';
import { PortalCinematic } from './PortalCinematic';
import { TouchControls } from './TouchControls';
import { AnimatePresence } from 'framer-motion';

export const GameHUD = () => {
  const mode = useGameStore((state) => state.mode);
  const showFps = useGameStore((state) => state.preferences.showFps);
  const hudEffects = useGameStore((state) => state.preferences.hudEffects);

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden text-white font-mono z-10">
      {showFps && <FpsCounter />}

      {/* Subtle Global AAA Effects */}
      {hudEffects && (
        <>
          <div className="scanlines pointer-events-none z-50 opacity-20" />
          <div className="vignette pointer-events-none z-40 opacity-50" />
        </>
      )}

      <AnimatePresence mode="wait">
        {mode === 'MENU' && (
          <div key="menu" className="pointer-events-auto absolute inset-0 z-30">
             <MainMenu />
          </div>
        )}

        {(mode === 'CHALLENGE' || mode === 'TRAINING') && (
          <div key="game" className="absolute inset-0 z-20">
            <TopBar />
            <ActivePowersBar />
            <BossBar />
            <WaveBanner />
            <Crosshair />
            <ScoreBoard />
            <AmmoHUD />
            
            <div className="pointer-events-none hidden md:block">
              <ControlsPanel />
            </div>

            <PowerSelection />
            <PortalCinematic />
            <RoundTransition />
            <PauseMenu />
            <TouchControls />
          </div>
        )}

        {mode === 'GAMEOVER' && (
          <div key="gameover" className="pointer-events-auto absolute inset-0 z-30">
             <GameOver />
          </div>
        )}

        {mode === 'LEVEL_MAP' && (
          <div key="levelmap" className="pointer-events-auto absolute inset-0 z-30">
             <LevelMap />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
