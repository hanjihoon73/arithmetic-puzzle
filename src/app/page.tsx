'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { LEVEL_1 } from '@/lib/levelData'; // Import the mock level
import Board from '@/components/game/Board';
import NumberPool from '@/components/game/NumberPool';
import GameControls from '@/components/game/GameControls';
import Header from '@/components/game/Header';

export default function Home() {
  const { initializeLevel, status } = useGameStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    initializeLevel(LEVEL_1);
  }, [initializeLevel]);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black font-sans pb-20 pt-20">
      <Header />

      <div className="container max-w-md mx-auto px-4 flex flex-col items-center">
        {status === 'won' && (
          <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-center font-bold w-full">
            Level Complete! 🎉
          </div>
        )}

        {status === 'lost' && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-center font-bold w-full">
            Game Over 😢
          </div>
        )}

        <Board />
        <GameControls />
        <NumberPool />
      </div>
    </main>
  );
}
