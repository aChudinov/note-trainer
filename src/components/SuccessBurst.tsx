import { useEffect, useRef, useState } from 'react';
import s from './SuccessBurst.module.css';

const EMOJIS = ['🎉', '⭐', '🌟', '🎊', '🏆', '💜'];

/** Plays a one-shot celebration in the screen center whenever `trigger` changes. */
export function SuccessBurst({ trigger }: { trigger: number }) {
  const [visible, setVisible] = useState(false);
  const emoji = useRef('🎉');

  useEffect(() => {
    if (trigger === 0) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    emoji.current = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    setVisible(true);
    const id = window.setTimeout(() => setVisible(false), 950);
    return () => window.clearTimeout(id);
  }, [trigger]);

  if (!visible) return null;

  return (
    <div className={s.overlay} aria-hidden="true">
      <span className={s.ring} />
      <span className={`${s.ring} ${s.ring2}`} />
      <span className={s.emoji}>{emoji.current}</span>
    </div>
  );
}
