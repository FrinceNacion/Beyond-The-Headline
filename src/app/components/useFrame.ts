import { useEffect, useState } from "react";

/** Chunky frame clock. Everything animated in this game steps off one of these —
 *  integer frames at a low rate, never a smooth interpolation. */
export function useFrame(fps: number, frames = Number.MAX_SAFE_INTEGER) {
  const [t, setT] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setT((v) => (v + 1) % frames), Math.round(1000 / fps));
    return () => window.clearInterval(id);
  }, [fps, frames]);
  return t;
}
