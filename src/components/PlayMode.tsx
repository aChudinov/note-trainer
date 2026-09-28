import { useCallback, useEffect, useRef, useState } from 'react';
import { appOctave, freqToMidi, noteName } from '../music';
import { autoCorrelate, getCtx } from '../audio';
import a from './answers.module.css';
import c from './controls.module.css';

interface PlayModeProps {
  midi: number;
  answered: boolean;
  micOctave: boolean;
  onAnswer: (ok: boolean) => void;
}

export function PlayMode({ midi, answered, micOctave, onAnswer }: PlayModeProps) {
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState('Klikni na „Poslouchat“ a zahraj notu');
  const [heard, setHeard] = useState<{ name: string; oct: number } | null>(null);
  const [level, setLevel] = useState(0);

  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number>(0);
  const bufRef = useRef<Float32Array<ArrayBuffer> | null>(null);
  const histRef = useRef<number[]>([]);
  // keep latest values available inside the RAF loop without re-subscribing
  const midiRef = useRef(midi);
  const answeredRef = useRef(answered);
  const micOctaveRef = useRef(micOctave);
  const onAnswerRef = useRef(onAnswer);
  midiRef.current = midi;
  answeredRef.current = answered;
  micOctaveRef.current = micOctave;
  onAnswerRef.current = onAnswer;

  const stop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    analyserRef.current = null;
    setListening(false);
    setLevel(0);
  }, []);

  // stop listening when the question is answered or the note changes
  useEffect(() => {
    if (answered) stop();
  }, [answered, stop]);
  useEffect(() => {
    setHeard(null);
    histRef.current = [];
  }, [midi]);
  // cleanup on unmount
  useEffect(() => stop, [stop]);

  const loop = useCallback(() => {
    const analyser = analyserRef.current;
    const buf = bufRef.current;
    if (!analyser || !buf) return;
    analyser.getFloatTimeDomainData(buf);

    let rms = 0;
    for (let i = 0; i < buf.length; i++) rms += buf[i] * buf[i];
    rms = Math.sqrt(rms / buf.length);
    setLevel(Math.min(100, rms * 400));

    const f = autoCorrelate(buf, getCtx().sampleRate);
    if (f > 0) {
      const m = freqToMidi(f);
      setHeard({ name: noteName(m), oct: appOctave(m) });
      const hist = histRef.current;
      hist.push(m);
      if (hist.length > 6) hist.shift();
      if (hist.length >= 4 && !answeredRef.current) {
        const last = hist.slice(-4);
        if (last.every((x) => x === last[0])) {
          const got = last[0];
          const target = midiRef.current;
          const ok = micOctaveRef.current
            ? got === target
            : noteName(got) === noteName(target);
          if (ok) {
            stop();
            onAnswerRef.current(true);
            return;
          }
        }
      }
    } else {
      setHeard(null);
    }
    rafRef.current = requestAnimationFrame(loop);
  }, [stop]);

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('Mikrofon tu není dostupný 😕');
      return;
    }
    setStatus('Povol prosím mikrofon…');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      streamRef.current = stream;
      const ac = getCtx();
      if (ac.state === 'suspended') await ac.resume();
      const src = ac.createMediaStreamSource(stream);
      const analyser = ac.createAnalyser();
      analyser.fftSize = 2048;
      src.connect(analyser);
      analyserRef.current = analyser;
      bufRef.current = new Float32Array(analyser.fftSize);
      histRef.current = [];
      setListening(true);
      setStatus('Poslouchám… zahraj notu 🎧');
      rafRef.current = requestAnimationFrame(loop);
    } catch (err) {
      const name = err instanceof Error ? err.name : 'chyba';
      setStatus(`Nepovedlo se zapnout mikrofon (${name})`);
    }
  }, [loop]);

  return (
    <div>
      <div className={a.micBox}>
        <div className={a.micHeard}>
          {heard ? (
            <>
              {heard.name}
              <small>{heard.oct}</small>
            </>
          ) : (
            '—'
          )}
        </div>
        <div className={a.micStatus}>{status}</div>
        <div className={a.level}>
          <i style={{ width: `${level}%` }} />
        </div>
      </div>
      <div className={c.actions}>
        <button
          className={`${c.btn} ${c.btnPrimary}`}
          disabled={answered}
          onClick={() => {
            if (listening) {
              stop();
              setStatus('Zastaveno');
            } else {
              void start();
            }
          }}
        >
          {listening ? '⏸ Zastavit' : '🎤 Poslouchat'}
        </button>
      </div>
    </div>
  );
}
