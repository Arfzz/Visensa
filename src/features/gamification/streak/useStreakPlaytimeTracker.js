import { useEffect, useRef } from "react";
import { useStreakStore } from "./useStreakStore";

/**
 * Custom hook to track active game playtime with zero frame drops.
 * Features 5-second interval batching and high-precision timestamp deltas.
 *
 * @param {boolean} isActive - Whether the game is actively in progress
 * @param {number} batchIntervalSec - Batching interval in seconds (default: 5)
 */
export const useStreakPlaytimeTracker = (isActive = false, batchIntervalSec = 5) => {
  const addActivePlaytime = useStreakStore((state) => state.addActivePlaytime);

  const accumulatedSecsRef = useRef(0);
  const lastTimeRef = useRef(null);

  // --- FLUSH ACCUMULATED PLAYTIME TO ZUSTAND ---
  const flushPlaytime = () => {
    if (accumulatedSecsRef.current > 0) {
      const secondsToDispatch = Math.round(accumulatedSecsRef.current);
      if (secondsToDispatch > 0) {
        addActivePlaytime(secondsToDispatch);
      }
      accumulatedSecsRef.current = 0;
    }
  };

  useEffect(() => {
    if (!isActive) {
      flushPlaytime();
      lastTimeRef.current = null;
      return;
    }

    lastTimeRef.current = performance.now();

    const intervalId = setInterval(() => {
      if (!lastTimeRef.current) return;

      const now = performance.now();
      const deltaSec = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      accumulatedSecsRef.current += deltaSec;

      if (accumulatedSecsRef.current >= batchIntervalSec) {
        const secondsToDispatch = Math.floor(accumulatedSecsRef.current);
        accumulatedSecsRef.current -= secondsToDispatch;
        addActivePlaytime(secondsToDispatch);
      }
    }, 1000);

    return () => {
      clearInterval(intervalId);
      flushPlaytime();
      lastTimeRef.current = null;
    };
  }, [isActive, batchIntervalSec, addActivePlaytime]);

  return {
    flushPlaytime,
  };
};

export default useStreakPlaytimeTracker;
