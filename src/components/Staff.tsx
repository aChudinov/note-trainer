import { useId } from 'react';
import type { Clef } from '../music';
import { diatonicIndex } from '../music';
import { useT } from '../i18n';
import s from './Staff.module.css';

interface StaffProps {
  midi: number;
  clef: Clef;
}

const W = 360;
const CX = 250;
const CY = 150;
const GAP = 18;
const STEP = GAP / 2;
const LEFT = 24;
const RIGHT = 336;
// Crop the viewBox to the vertical band the staff, clef and ledgers actually use,
// so the note card isn't mostly empty space (was 0..300).
const VIEW_TOP = 72;
const VIEW_H = 184;

export function Staff({ midi, clef }: StaffProps) {
  const t = useT();
  // Re-mount the note group on each note so the pop animation replays.
  const key = useId() + midi + clef;
  const dCenter = clef === 'treble' ? diatonicIndex(71) : diatonicIndex(50); // H4 / D3 on the middle line
  const offset = diatonicIndex(midi) - dCenter; // diatonic steps above center
  const ny = CY - offset * STEP;

  const staffLines = [-2, -1, 0, 1, 2].map((i) => CY + i * GAP);

  const ledgers: number[] = [];
  if (offset > 4) for (let k = 6; k <= offset; k += 2) ledgers.push(CY - k * STEP);
  if (offset < -4) for (let k = 6; k <= -offset; k += 2) ledgers.push(CY + k * STEP);

  const stemUp = offset < 0;
  const sx = stemUp ? CX + 9.5 : CX - 9.5;
  const sy2 = stemUp ? ny - GAP * 3.4 : ny + GAP * 3.4;

  return (
    <svg viewBox={`0 ${VIEW_TOP} ${W} ${VIEW_H}`} role="img" aria-label={t.staffAria}>
      {staffLines.map((y, i) => (
        <line
          key={i}
          x1={LEFT}
          y1={y}
          x2={RIGHT}
          y2={y}
          stroke="var(--staff-ink)"
          strokeWidth={2}
          strokeLinecap="round"
          opacity={0.9}
        />
      ))}

      {clef === 'treble' ? (
        <text
          x={46}
          y={CY + GAP * 2.05}
          fontSize={GAP * 7.4}
          fill="var(--staff-ink)"
          textAnchor="middle"
          style={{ fontFamily: 'ui-rounded, system-ui, serif' }}
        >
          𝄞
        </text>
      ) : (
        <text
          x={52}
          y={CY + GAP * 1.1}
          fontSize={GAP * 4.5}
          fill="var(--staff-ink)"
          textAnchor="middle"
          style={{ fontFamily: 'ui-rounded, system-ui, serif' }}
        >
          𝄢
        </text>
      )}

      <g key={key} className={s.pop}>
        {ledgers.map((y, i) => (
          <line
            key={i}
            x1={CX - 18}
            y1={y}
            x2={CX + 18}
            y2={y}
            stroke="var(--staff-ink)"
            strokeWidth={2}
            strokeLinecap="round"
          />
        ))}
        <line
          x1={sx}
          y1={ny}
          x2={sx}
          y2={sy2}
          stroke="var(--staff-ink)"
          strokeWidth={3}
          strokeLinecap="round"
        />
        <ellipse
          cx={CX}
          cy={ny}
          rx={11.5}
          ry={8.4}
          transform={`rotate(-22 ${CX} ${ny})`}
          fill="var(--accent)"
        />
      </g>
    </svg>
  );
}
