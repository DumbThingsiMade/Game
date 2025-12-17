
import React from 'react';

interface Props {
  balance: number;
  isGameOver: boolean;
}

export const AttmayCharacter: React.FC<Props> = ({ balance, isGameOver }) => {
  // Map balance (-100 to 100) to rotation (-45 to 45 deg)
  const rotation = (balance / 100) * 60;
  
  return (
    <div className="relative w-64 h-80 flex flex-col items-center justify-end">
      {/* Background Text on Game Over */}
      {isGameOver && (
        <div className="absolute top-[-140px] w-[400px] text-center z-50 animate-bounce">
          <p className="text-red-600 font-black text-4xl uppercase tracking-tighter drop-shadow-[0_4px_0_rgba(0,0,0,0.8)]">
            "THAT GUY WAS AN ASSHOLE ANYWAY"
          </p>
        </div>
      )}

      {/* The Desk */}
      <div className="absolute bottom-0 w-[450px] h-32 bg-amber-900 border-t-4 border-amber-950 rounded-sm shadow-2xl z-20 overflow-visible">
        <div className="absolute top-2 left-10 w-24 h-4 bg-gray-200 rounded-full opacity-20"></div>
        {/* Desk Blood Pool */}
        {isGameOver && (
          <div className="absolute top-[-5px] left-1/2 -translate-x-1/2 w-80 h-12 bg-red-700 rounded-full blur-md opacity-90 animate-pulse"></div>
        )}
      </div>

      {/* Attmay's Body */}
      <div className="relative w-40 h-48 bg-blue-100 rounded-t-3xl border-x-4 border-t-4 border-gray-300 z-10 flex flex-col items-center">
        {/* Tie */}
        <div className="w-4 h-24 bg-red-600 absolute top-0 left-1/2 -translate-x-1/2 rounded-b-lg"></div>
        
        {/* Neck Stump on Game Over */}
        {isGameOver && (
          <div className="absolute top-0 w-10 h-6 bg-red-600 rounded-full -translate-y-3 border-2 border-red-800 flex justify-center overflow-visible">
             {/* Dynamic spurts */}
             <div className="absolute w-2 bg-red-600 -top-8 left-1 animate-spurt" style={{ animationDelay: '0s' }}></div>
             <div className="absolute w-1 bg-red-500 -top-12 left-4 animate-spurt" style={{ animationDelay: '0.1s' }}></div>
             <div className="absolute w-3 bg-red-700 -top-6 left-7 animate-spurt" style={{ animationDelay: '0.2s' }}></div>
          </div>
        )}

        {/* Arm resting on desk */}
        <div className="absolute -left-10 bottom-10 w-32 h-10 bg-blue-200 border-4 border-gray-300 rotate-[20deg] rounded-full"></div>
      </div>

      {/* Attmay's Head - The Balancing Element */}
      <div 
        className={`absolute z-30 ${isGameOver ? 'animate-roll' : 'transition-all duration-[100ms] ease-out'}`}
        style={!isGameOver ? { 
          transform: `translateY(-120px) rotate(${rotation}deg)`,
          transformOrigin: 'bottom center'
        } : {}}
      >
        <div className={`relative w-28 h-32 bg-pink-200 rounded-[40%] border-4 border-gray-400 shadow-lg flex flex-col items-center justify-center ${isGameOver ? 'scale-90' : ''}`}>
          {/* Eyes (Droopy or Dead) */}
          <div className="flex space-x-6 mt-4">
            {isGameOver ? (
               <>
                 <span className="text-black font-black text-2xl select-none">X</span>
                 <span className="text-black font-black text-2xl select-none">X</span>
               </>
            ) : (
               <>
                 <div className="w-4 h-1 bg-black rounded-full"></div>
                 <div className="w-4 h-1 bg-black rounded-full"></div>
               </>
            )}
          </div>
          {/* Mouth */}
          <div className={`w-6 h-2 bg-pink-300 rounded-full mt-4 border border-pink-400 ${isGameOver ? 'h-5 w-8 bg-black rounded-full' : ''}`}></div>
          
          {/* Hair */}
          <div className="absolute top-0 w-full flex justify-center -translate-y-2">
            <div className="w-2 h-4 bg-gray-600 rotate-12 mx-1"></div>
            <div className="w-2 h-4 bg-gray-600 -rotate-12 mx-1"></div>
          </div>

          {/* Blood splat on the head itself when dead */}
          {isGameOver && (
            <div className="absolute inset-0 bg-red-600/40 rounded-[40%] flex items-center justify-center">
              <div className="w-full h-full border-4 border-red-900 rounded-[40%] opacity-60"></div>
            </div>
          )}
        </div>
      </div>

      {/* Spattered Blood on screen overlay */}
      {isGameOver && (
        <div className="fixed inset-0 pointer-events-none z-[60]">
          <div className="absolute top-1/4 left-1/3 w-16 h-16 bg-red-700 rounded-full opacity-40 blur-lg animate-pulse"></div>
          <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-red-900 rounded-full opacity-30 blur-xl animate-ping"></div>
          <div className="absolute bottom-1/4 left-1/2 w-10 h-10 bg-red-500 rounded-full opacity-50 blur-md animate-bounce"></div>
        </div>
      )}
    </div>
  );
};
