import { GameEngine } from './components/Scene3D/GameEngine';
import { GameHUD } from './components/HUD/GameHUD';

function App() {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-black text-white [height:100dvh]">
      <GameEngine />
      <GameHUD />
    </div>
  );
}

export default App;
