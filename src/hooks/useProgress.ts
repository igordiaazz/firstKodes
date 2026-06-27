'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'firstkodes_progress';
const MAX_LIVES = 3;

export const MODULE_NUMBERS: Record<string, number> = {
  fundamentos: 1,
  decisoes: 2,
  repeticoes: 3,
  funcoes: 4,
  modulo5: 5,
};

export function getModuleNumber(id: string): number {
  return MODULE_NUMBERS[id] ?? 0;
}

export function formatElapsedTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) {
    return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
  }
  return `${seconds}s`;
}

export interface ProgressData {
  lives: number;
  unlockedModules: number[];
  phasesCompleted: Record<string, number>;
  streak: number;
  moduleStartTime: number;
}

function getDefaultProgress(): ProgressData {
  return {
    lives: MAX_LIVES,
    unlockedModules: [1],
    phasesCompleted: {},
    streak: 0,
    moduleStartTime: 0,
  };
}

function readStorage(): ProgressData {
  if (typeof window === 'undefined') return getDefaultProgress();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultProgress();
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && 'unlockedModules' in parsed) {
      return {
        lives: typeof parsed.lives === 'number' ? parsed.lives : MAX_LIVES,
        unlockedModules: Array.isArray(parsed.unlockedModules)
          ? parsed.unlockedModules
          : [1],
        phasesCompleted: parsed.phasesCompleted || {},
        streak: typeof parsed.streak === 'number' ? parsed.streak : 0,
        moduleStartTime: typeof parsed.moduleStartTime === 'number' ? parsed.moduleStartTime : 0,
      };
    }
    const legacy = parsed as Record<string, number>;
    return {
      lives: MAX_LIVES,
      unlockedModules: [1],
      phasesCompleted: legacy,
      streak: 0,
      moduleStartTime: 0,
    };
  } catch {
    return getDefaultProgress();
  }
}

function writeStorage(data: ProgressData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
  }
}

export function useProgress() {
  const [progress, setProgress] = useState<ProgressData>(getDefaultProgress);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProgress(readStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) writeStorage(progress);
  }, [progress, hydrated]);

  const loseLife = useCallback(() => {
    setProgress((prev) => ({
      ...prev,
      lives: Math.max(0, prev.lives - 1),
    }));
  }, []);

  const completePhase = useCallback((moduleId: string, count: number) => {
    setProgress((prev) => ({
      ...prev,
      phasesCompleted: {
        ...prev.phasesCompleted,
        [moduleId]: Math.max(count, prev.phasesCompleted[moduleId] ?? 0),
      },
    }));
  }, []);

  const completeModule = useCallback((moduleId: number) => {
    setProgress((prev) => {
      const nextId = moduleId + 1;
      const wasFirst = prev.streak === 0;

      if (prev.unlockedModules.includes(nextId)) {
        if (wasFirst) return { ...prev, streak: 1 };
        return prev;
      }

      return {
        ...prev,
        unlockedModules: [...prev.unlockedModules, nextId],
        streak: wasFirst ? 1 : prev.streak,
      };
    });
  }, []);

  const setCurrentModule = useCallback((_moduleId: string) => {
  }, []);

  const setModuleStartTime = useCallback((time: number) => {
    setProgress((prev) => ({ ...prev, moduleStartTime: time }));
  }, []);

  const resetProgress = useCallback(() => {
    setProgress(getDefaultProgress());
  }, []);

  const adminCompleteAll = useCallback(() => {
    setProgress((prev) => ({
      ...prev,
      unlockedModules: [1, 2, 3, 4, 5],
      phasesCompleted: {
        ...prev.phasesCompleted,
        fundamentos: 6,
        decisoes: 6,
        repeticoes: 6,
        funcoes: 6,
      },
    }));
  }, []);

  return {
    progress,
    hydrated,
    loseLife,
    completePhase,
    completeModule,
    setCurrentModule,
    setModuleStartTime,
    resetProgress,
    adminCompleteAll,
  };
}
