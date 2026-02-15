'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { LEVEL_1, LEVELS } from '@/lib/levelData';
import Board from '@/components/game/Board';
import NumberPool from '@/components/game/NumberPool';
import GameControls from '@/components/game/GameControls';
import Header from '@/components/game/Header';

export default function Home() {
  const { initializeLevel, status, level } = useGameStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Initialize with Level 1 if no level is set, or if we want to force start at 1 on reload
    // For now, let's trust the store or default to 1.
    // If we want to persist progress, we'd need more logic, but for now:
    initializeLevel(LEVEL_1);
  }, [initializeLevel]);

  const handleNextLevel = () => {
    if (!level) return;
    const nextId = level.id + 1;
    const nextLevelData = LEVELS[nextId];
    if (nextLevelData) {
      initializeLevel(nextLevelData);
    } else {
      alert("All levels completed! Restarting from Level 1.");
      initializeLevel(LEVEL_1);
    }
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black font-sans pb-20 pt-20">
      <Header />

      <div className="container max-w-md mx-auto px-4 flex flex-col items-center">
        {status === 'won' && (
          <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-center font-bold w-full flex flex-col gap-2 items-center">
            <span>Level Complete! 🎉</span>
            <button
              onClick={handleNextLevel}
              className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors shadow-sm"
            >
              Next Level
            </button>
          </div>
        )}

        {status === 'lost' && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-center font-bold w-full">
            Game Over 😢
          </div>
        )}

        <Board />
        <NumberPool />
        <GameControls />
      </div>
    </main>
  );
}
