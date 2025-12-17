
import React from 'react';

interface Props {
  balance: number;
  score: number;
  difficulty: number;
  distraction: string;
}

export const HUD: React.FC<Props> = ({ balance, score, difficulty, distraction }) => {
  const balancePercent = Math.min(Math.max((balance + 100) / 2, 0), 100);
  const color = Math.abs(balance) > 70 ? 'bg-red-500' : Math.abs(balance) > 40 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div className="absolute top-0 w-full p-6 flex flex-col items-center pointer-events-none select-none">
      <div className="flex justify-between w-full max-w-2xl mb-4">
        <div className="bg-black/60 text-white px-4 py-2 rounded-lg backdrop-blur-md border border-white/20">
          <span className="text-xs uppercase text-gray-400 block font-bold">Shift Progress</span>
          <span className="text-xl font-mono">{score.toFixed(1)}s</span>
        </div>
        <div className="bg-black/60 text-white px-4 py-2 rounded-lg backdrop-blur-md border border-white/20 text-right">
          <span className="text-xs uppercase text-gray-400 block font-bold">Fatigue Level</span>
          <span className="text-xl font-mono">{(difficulty * 10).toFixed(0)}%</span>
        </div>
      </div>

      {/* Stability Bar */}
      <div className="w-full max-w-md h-6 bg-gray-800 rounded-full border-2 border-white/30 overflow-hidden relative">
        <div 
          className={`h-full transition-all duration-75 ${color}`}
          style={{ width: `${balancePercent}%` }}
        ></div>
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/50 -translate-x-1/2"></div>
      </div>
      <p className="text-white text-[10px] mt-1 font-bold tracking-widest uppercase opacity-50">Head Equilibrium</p>

      {/* Distraction Ticker */}
      <div className="mt-8 bg-white/10 text-white px-6 py-2 rounded-full border border-white/10 backdrop-blur-sm animate-pulse">
        <span className="text-xs text-blue-300 font-bold mr-2 italic">ALERT:</span>
        <span className="text-sm font-medium">{distraction}</span>
      </div>
    </div>
  );
};
