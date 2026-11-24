import { useEffect } from 'react';
import { GameEngine } from './components/Scene3D/GameEngine';
import { GameHUD } from './components/HUD/GameHUD';
import { useDeviceProfile } from './hooks/useDeviceProfile';
import { preloadAllModels } from './game/modelLoader';

function App() {
  const deviceProfile = useDeviceProfile();

  useEffect(() => {
    preloadAllModels();
  }, []);

  return (
    <div
      data-input-mode={deviceProfile.inputMode}
      data-screen-layout={deviceProfile.screenLayout}
      data-screen-orientation={deviceProfile.orientation}
      className="relative h-screen w-full overflow-hidden bg-black text-white [height:100dvh]"
    >
      <GameEngine />
      <GameHUD touchControlsEnabled={deviceProfile.inputMode === 'touch'} />
    </div>
  );
}

export default App;
