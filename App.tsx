
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, IncidentReport } from './types';
import { AttmayCharacter } from './components/AttmayCharacter';
import { HUD } from './components/HUD';
import { generateIncidentReport, getCorporateDistraction } from './services/gemini';

const INITIAL_STATE: GameState = {
  balance: 0,
  score: 0,
  isGameOver: false,
  gameTime: 0,
  difficulty: 1,
  status: 'START',
};

const App: React.FC = () => {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const [report, setReport] = useState<IncidentReport | null>(null);
  const [distraction, setDistraction] = useState<string>("Wait for the clock-out...");
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  
  const requestRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number | undefined>(undefined);
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const tiltRef = useRef<number>(0);

  const startGame = useCallback(() => {
    // Reset core physics refs to prevent huge jump on first frame
    lastTimeRef.current = undefined;
    tiltRef.current = 0;
    keysPressed.current = {};
    
    setState({ ...INITIAL_STATE, status: 'PLAYING' });
    setReport(null);
    setDistraction("The quarterly review is coming...");

    // Request motion permissions if required (iOS 13+)
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      (DeviceOrientationEvent as any).requestPermission()
        .catch((e: any) => console.error("Permission denied", e));
    }
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (state.status === 'GAMEOVER') {
      startGame();
      return;
    }
    keysPressed.current[e.key] = true;
  }, [state.status, startGame]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    keysPressed.current[e.key] = false;
  }, []);

  const handleGlobalClick = useCallback(() => {
    if (state.status === 'GAMEOVER') {
      startGame();
    }
  }, [state.status, startGame]);

  const handleOrientation = useCallback((e: DeviceOrientationEvent) => {
    // Gamma is left-to-right tilt in degrees [-90, 90]
    if (e.gamma !== null) {
      tiltRef.current = e.gamma;
    }
  }, []);

  const update = useCallback((time: number) => {
    if (lastTimeRef.current !== undefined) {
      const deltaTime = (time - lastTimeRef.current) / 1000;

      setState(prev => {
        if (prev.status !== 'PLAYING') return prev;

        let newBalance = prev.balance;
        // Faster difficulty ramp as time passes
        const diffMultiplier = 1 + (prev.score / 35); 

        // 1. Natural drift
        const drift = (Math.random() - 0.5) * 45 * deltaTime * diffMultiplier;
        newBalance += drift;

        // 2. Head "weight" gravity (exponential force based on tilt)
        newBalance += (newBalance / 100) * 115 * deltaTime * diffMultiplier;

        // 3. Keyboard input
        const force = 340 * deltaTime;
        if (keysPressed.current['ArrowLeft'] || keysPressed.current['a']) {
          newBalance -= force;
        }
        if (keysPressed.current['ArrowRight'] || keysPressed.current['d']) {
          newBalance += force;
        }

        // 4. Tilt input (Android/Mobile)
        // Normalize tilt: tiltRef.current is deg. Sensitivity: 15deg = full speed force
        const tiltForce = (tiltRef.current / 12) * 280 * deltaTime;
        newBalance += tiltForce;

        // Check loss condition
        const isGameOver = Math.abs(newBalance) >= 100;
        if (isGameOver) {
          return {
            ...prev,
            balance: newBalance,
            isGameOver: true,
            status: 'GAMEOVER',
          };
        }

        return {
          ...prev,
          balance: newBalance,
          score: prev.score + deltaTime,
          difficulty: diffMultiplier
        };
      });
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(update);
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('deviceorientation', handleOrientation);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [handleKeyDown, handleKeyUp, handleOrientation]);

  useEffect(() => {
    if (state.status === 'PLAYING') {
      requestRef.current = requestAnimationFrame(update);
      const distractionInterval = setInterval(async () => {
        const newDist = await getCorporateDistraction();
        setDistraction(newDist);
      }, 10000);
      return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        clearInterval(distractionInterval);
      };
    }
  }, [state.status, update]);

  useEffect(() => {
    if (state.status === 'GAMEOVER') {
      setIsLoadingReport(true);
      generateIncidentReport(state.score, state.balance).then(res => {
        setReport(res);
        setIsLoadingReport(false);
      });
    }
  }, [state.status, state.score, state.balance]);

  return (
    <div 
      className="min-h-screen bg-slate-900 flex items-center justify-center overflow-hidden font-sans select-none cursor-pointer" 
      onMouseDown={handleGlobalClick}
      onTouchStart={handleGlobalClick}
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(180,20,20,0.4)_0%,_rgba(0,0,0,1)_100%)]"></div>
      </div>

      {state.status === 'START' && (
        <div className="relative z-50 text-center p-12 bg-black/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl max-w-md mx-4">
          <h1 className="text-4xl font-black text-white mb-2 tracking-tighter">ATTMAY UCASLAY</h1>
          <p className="text-red-500 font-bold mb-6 text-sm uppercase tracking-widest">Business Analyst Slumber Simulation</p>
          <div className="mb-8 p-4 bg-white/5 rounded-xl text-gray-300 text-sm italic border border-white/10 leading-relaxed">
            "It's 2:45 PM. The silence is deafening. Don't let your heavy head touch the desk or the incident report will be written in blood."
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); startGame(); }}
            className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-5 rounded-2xl transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(220,38,38,0.5)] text-xl"
          >
            START SHIFT
          </button>
          <p className="text-gray-500 text-[10px] mt-6 uppercase font-bold tracking-widest">Balance with A/D, Arrows, or TILT device</p>
        </div>
      )}

      {state.status === 'PLAYING' && (
        <>
          <HUD balance={state.balance} score={state.score} difficulty={state.difficulty} distraction={distraction} />
          <AttmayCharacter balance={state.balance} isGameOver={false} />
        </>
      )}

      {state.status === 'GAMEOVER' && (
        <div className="relative z-50 w-full max-w-2xl px-6 flex flex-col items-center">
          <AttmayCharacter balance={state.balance} isGameOver={true} />
          
          <div className="bg-black/95 backdrop-blur-2xl border-4 border-red-600 rounded-3xl p-8 shadow-[0_0_60px_rgba(220,38,38,0.4)] mt-12 w-full animate-in fade-in slide-in-from-bottom duration-500">
            <div className="text-center mb-6">
              <h2 className="text-5xl font-black text-red-600 tracking-tighter italic drop-shadow-lg">TERMINAL FAILURE</h2>
              <p className="text-sm text-gray-400 mt-2 uppercase font-black tracking-widest animate-pulse">TAP ANYWHERE TO RESPAWN</p>
            </div>

            <div className="bg-red-950/20 p-6 rounded-2xl border border-red-500/30 mb-6 min-h-[120px]">
              {isLoadingReport ? (
                <div className="flex flex-col items-center justify-center h-full space-y-2">
                  <div className="w-full h-2 bg-red-900/50 rounded-full overflow-hidden">
                    <div className="h-full bg-red-600 w-1/2 animate-[shimmer_1.5s_infinite]"></div>
                  </div>
                  <p className="text-red-400 text-[10px] font-black uppercase">Generating Post-Mortem Analytics...</p>
                </div>
              ) : (
                <>
                  <p className="text-red-500 text-[11px] font-black uppercase mb-2 border-b border-red-500/20 pb-1">HR INCIDENT REPORT #504-B</p>
                  <p className="text-white text-base italic leading-relaxed">"{report?.summary}"</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <div className="bg-black px-3 py-1 rounded border border-red-500/40 text-[10px] text-red-400 font-mono">
                      CODE: {report?.corporateLingo}
                    </div>
                    <div className="bg-black px-3 py-1 rounded border border-red-500/40 text-[10px] text-red-400 font-mono">
                      CAUSE: {report?.funnyCause}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-between items-end px-2">
               <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Tenure Length</p>
                  <p className="text-4xl font-mono text-white tracking-tighter">{state.score.toFixed(2)}s</p>
               </div>
               <div className="text-right">
                  <button 
                    onClick={(e) => { e.stopPropagation(); startGame(); }}
                    className="bg-red-600 hover:bg-red-500 text-white font-black px-8 py-3 rounded-xl transition-all transform hover:scale-110 active:scale-95 shadow-lg uppercase text-sm"
                  >
                    RESPAWN
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
