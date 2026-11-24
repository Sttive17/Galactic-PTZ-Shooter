import { GameEngine } from './components/Scene3D/GameEngine';
import { GameHUD } from './components/HUD/GameHUD';

function App() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-white">
      <GameEngine />
      <GameHUD />
    </div>
  );
}

export default App;
