import { useState } from 'react';
import { LETTERS } from '../music';
import { accuracy, loadStats, resetStats, type Tally } from '../stats';
import { useT } from '../i18n';
import c from './controls.module.css';
import d from './Dashboard.module.css';

interface DashboardProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onBack: () => void;
}

function barColor(pct: number): string {
  if (pct >= 80) return 'var(--good)';
  if (pct >= 50) return 'var(--gold)';
  return 'var(--bad)';
}

export function Dashboard({ isDark, onToggleTheme, onBack }: DashboardProps) {
  const t = useT();
  const [stats, setStats] = useState(loadStats);
  const [armed, setArmed] = useState(false);

  const overall = accuracy({ correct: stats.correct, total: stats.total });
  const hasData = stats.total > 0;

  const modeRows: { key: string; label: string; tally: Tally }[] = ['1', '2', '3']
    .map((m) => ({
      key: m,
      label: m === '1' ? t.mode1Title : m === '2' ? t.mode2Title : t.mode3Title,
      tally: stats.perMode[m] ?? { correct: 0, total: 0 },
    }))
    .filter((r) => r.tally.total > 0);

  return (
    <div className={c.wrap}>
      <div className={c.topbar} style={{ marginBottom: 12 }}>
        <button className={c.ghostBtn} onClick={onBack} aria-label={t.back}>
          ‹
        </button>
        <div className={c.brand} style={{ fontSize: 16 }}>
          <span>📊 {t.results}</span>
        </div>
        <button
          className={c.ghostBtn}
          onClick={onToggleTheme}
          title={t.toggleTheme}
          aria-label={t.toggleTheme}
        >
          {isDark ? '☀️' : '🌙'}
        </button>
      </div>

      {!hasData ? (
        <div className={d.empty}>{t.noData}</div>
      ) : (
        <>
          <div className={d.tiles}>
            <div className={`${d.tile} ${d.accent}`}>
              <div className={d.v}>{overall}%</div>
              <div className={d.k}>{t.statAccuracy}</div>
            </div>
            <div className={d.tile}>
              <div className={d.v}>{stats.total}</div>
              <div className={d.k}>{t.statAnswered}</div>
            </div>
            <div className={`${d.tile} ${d.gold}`}>
              <div className={d.v}>{stats.bestStreak}</div>
              <div className={d.k}>{t.statBest}</div>
            </div>
            <div className={d.tile}>
              <div className={d.v}>{stats.days.length}</div>
              <div className={d.k}>{t.statDays}</div>
            </div>
          </div>

          <div className={d.section}>
            <p className={d.sectionTitle}>{t.perNoteTitle}</p>
            {LETTERS.map((l) => {
              const tally = stats.perNote[l] ?? { correct: 0, total: 0 };
              const pct = accuracy(tally);
              return (
                <div key={l} className={d.row}>
                  <span className={d.rowLabel}>{l}</span>
                  <span className={d.bar}>
                    <span
                      className={d.barFill}
                      style={{
                        width: `${tally.total ? pct : 0}%`,
                        background: barColor(pct),
                      }}
                    />
                  </span>
                  <span className={d.pct}>{tally.total ? `${pct}%` : '—'}</span>
                  <span className={d.count}>
                    {tally.correct}/{tally.total}
                  </span>
                </div>
              );
            })}
          </div>

          {modeRows.length > 0 && (
            <div className={d.section}>
              <p className={d.sectionTitle}>{t.perModeTitle}</p>
              {modeRows.map((r) => {
                const pct = accuracy(r.tally);
                return (
                  <div key={r.key} className={d.row}>
                    <span style={{ flex: 1, fontWeight: 700, fontSize: 14 }}>{r.label}</span>
                    <span className={d.pct}>{pct}%</span>
                    <span className={d.count}>
                      {r.tally.correct}/{r.tally.total}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <button
            className={`${d.resetBtn} ${armed ? d.armed : ''}`}
            onClick={() => {
              if (!armed) {
                setArmed(true);
                window.setTimeout(() => setArmed(false), 3000);
                return;
              }
              resetStats();
              setStats(loadStats());
              setArmed(false);
            }}
          >
            {armed ? t.resetConfirm : t.reset}
          </button>
        </>
      )}
    </div>
  );
}
