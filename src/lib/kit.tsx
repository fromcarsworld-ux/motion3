// src/lib/kit.tsx
import {loadFont} from '@remotion/google-fonts/Lora';
import {evolvePath} from '@remotion/paths';
import {noise2D} from '@remotion/noise';
import {AbsoluteFill, Easing, interpolate, random, useCurrentFrame} from 'remotion';
import {useId} from 'react';
import type {CSSProperties, ReactNode} from 'react';

const normalLora = loadFont('normal', {weights: ['400', '500', '600', '700'], subsets: ['latin']});
loadFont('italic', {weights: ['400', '500', '600', '700'], subsets: ['latin']});

export const W = 1920, H = 1080, FPS = 30, SAFE = 120, TOTAL = 1714;
export const C = {
  ink: '#0B0C0E', ink2: '#14161A', ivory: '#F4EFE6', paper: '#FBF8F2', champagne: '#C8A96A',
  gold2: '#E8D3A2', emerald: '#1F8A70', ember: '#E4572E', mist: '#8A867D', mistDark: '#5E5A52',
  line: 'rgba(255,255,255,0.10)', lineDark: 'rgba(255,255,255,0.10)', lineLight: 'rgba(11,12,14,0.08)',
} as const;
export const T = {display: 132, h1: 96, h2: 64, h3: 44, body: 32, small: 24, label: 20} as const;
export const FONT = normalLora.fontFamily;
export const ease = {
  expoOut: Easing.bezier(0.16, 1, 0.3, 1), softOut: Easing.bezier(0.22, 1, 0.36, 1),
  inOut: Easing.bezier(0.76, 0, 0.24, 1), backOut: Easing.bezier(0.34, 1.56, 0.64, 1),
  expoIn: Easing.bezier(0.7, 0, 0.84, 0), quartOut: Easing.bezier(0.25, 1, 0.5, 1),
} as const;
type Curve = (progress: number) => number;
const finite = (n: number, fallback = 0): number => Number.isFinite(n) ? n : fallback;
export const clamp01 = (n: number): number => Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : 0;
export const lerp = (a: number, b: number, p: number): number => a + (b - a) * p;
export const prog = (frame: number, start: number, dur: number, e: Curve = ease.expoOut): number => {
  const s = finite(start), d = Math.max(0, finite(dur));
  if (!d) return frame < s ? 0 : 1;
  return clamp01(interpolate(finite(frame), [s, s + d], [0, 1], {easing: e, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
};
export const stag = (i: number, step = 4, cap = 24): number => Math.min(Math.max(0, finite(i)) * Math.max(0, finite(step)), Math.max(0, finite(cap)));
export const readFrames = (words: number | string): number => {
  const count = typeof words === 'number' ? Math.max(0, finite(words)) : words.trim() ? words.trim().split(/\s+/).length : 0;
  return Math.max(24, Math.ceil(count * 6.5));
};
const ambientAt = (seed: string, frame: number, amp: number) => {
  const t = finite(frame) / 80, a = Math.min(6, Math.max(0, Math.abs(finite(amp, 6))));
  return {x: noise2D(`${seed}:x`, t, 0.37) * a, y: noise2D(`${seed}:y`, 0.61, t + 7.3) * a,
    r: noise2D(`${seed}:r`, t * 0.7, 2.9) * 0.45, s: 1 + noise2D(`${seed}:s`, 5.1, t * 0.55) * 0.009};
};
export const useAmbient = (seed: string, amp = 6): {x: number; y: number; r: number; s: number} => ambientAt(seed, useCurrentFrame(), amp);
const useSafeId = (): string => useId().replace(/:/g, '').replace(/[^a-zA-Z0-9_-]/g, '');
const TYPE: CSSProperties = {
  fontFamily: FONT, fontVariantNumeric: 'lining-nums tabular-nums', textRendering: 'geometricPrecision',
  fontKerning: 'normal', WebkitFontSmoothing: 'antialiased',
};

type BackdropTheme = 'ivory' | 'ink' | 'dawn';
type BackdropProps = {theme: BackdropTheme; ghost?: string; ghostSize?: number; ghostY?: number; ghostOpacity?: number};
const BLOBS = ['rgba(200,169,106,0.21)', 'rgba(31,138,112,0.15)', 'rgba(244,239,230,0.09)'] as const;
export const Backdrop = ({theme, ghost, ghostSize = 520, ghostY = 540, ghostOpacity = 0.07}: BackdropProps) => {
  const f = useCurrentFrame(), id = useSafeId(), light = theme === 'ivory';
  const vignette = light ? 'radial-gradient(ellipse, transparent 43%, rgba(60,40,10,0.08) 100%)' : 'radial-gradient(ellipse, transparent 42%, rgba(0,0,0,0.28) 100%)';
  return <AbsoluteFill style={{backgroundColor: light ? C.ivory : C.ink, overflow: 'hidden'}}>
    {theme === 'dawn' && <AbsoluteFill style={{background: 'radial-gradient(ellipse 78% 58% at 50% 105%, rgba(200,169,106,0.35), rgba(200,169,106,0.16) 38%, transparent 76%)'}} />}
    {BLOBS.map((color, i) => {
      const phase = i * 2.1, x = Math.sin(f * Math.PI * 2 / 300 + phase) * 280, y = Math.sin(f * Math.PI * 2 / 390 + phase * 1.37) * 185, size = i === 1 ? 620 : 760;
      return <div key={i} style={{position: 'absolute', left: W / 2, top: H / 2, width: size, height: size, borderRadius: '50%',
        background: `radial-gradient(circle, ${color} 0%, transparent 69%)`, transform: `translate3d(calc(-50% + ${x}px),calc(-50% + ${y}px),0)`,
        filter: 'blur(72px)', opacity: light ? 0.37 : 0.72, mixBlendMode: light ? 'multiply' : 'screen', pointerEvents: 'none'}} />;
    })}
    {Array.from({length: 28}, (_, i) => {
      const seed = `foundersync-dust-${i}`, x0 = random(`${seed}-x`) * W, y0 = random(`${seed}-y`) * (H + 80), r = 2 + random(`${seed}-r`) * 3;
      const speed = 0.16 + random(`${seed}-speed`) * 0.24, phase = random(`${seed}-phase`) * Math.PI * 2, loop = H + 80;
      const y = ((y0 - f * speed) % loop + loop) % loop - 40, x = x0 + Math.sin(f / 71 + phase) * 14;
      const opacity = 0.15 + (0.42 + 0.38 * Math.sin(f / 19 + phase)) * 0.5;
      return <div key={`dust-${i}`} style={{position: 'absolute', left: x, top: y, width: r, height: r, borderRadius: '50%', backgroundColor: C.gold2,
        opacity: clamp01(opacity), boxShadow: `0 0 ${r * 3}px rgba(232,211,162,${light ? 0.22 : 0.48})`, pointerEvents: 'none'}} />;
    })}
    {ghost && <div aria-hidden="true" style={{...TYPE, position: 'absolute', left: W / 2 + Math.sin(f / 220) * 76, top: ghostY,
      transform: 'translate(-50%,-50%)', whiteSpace: 'nowrap', fontSize: ghostSize, lineHeight: 1, fontWeight: 600, fontStyle: 'italic',
      letterSpacing: '-0.04em', color: 'transparent', WebkitTextFillColor: 'transparent',
      WebkitTextStroke: `2px rgba(200,169,106,${clamp01(ghostOpacity)})`, opacity: 0.9, userSelect: 'none', pointerEvents: 'none'}}>{ghost}</div>}
    <AbsoluteFill style={{background: vignette, pointerEvents: 'none'}} />
    <svg aria-hidden="true" width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none'}}>
      <defs><filter id={`${id}-grain`}><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={Math.floor(f / 2) % 12} stitchTiles="stitch" /></filter></defs>
      <rect width={W} height={H} filter={`url(#${id}-grain)`} opacity={light ? 0.035 : 0.05} style={{mixBlendMode: 'overlay'}} />
    </svg>
  </AbsoluteFill>;
};

type Pose = {x: number; y: number; s: number; r: number; o: number};
type PosePatch = Partial<Pose>;
type MoveExit = {start: number; dur: number; to: PosePatch; ease?: Curve};
type MoveProps = {from?: PosePatch; to?: PosePatch; start?: number; dur?: number; ease?: Curve; exit?: MoveExit;
  blurK?: number; maxBlur?: number; origin?: string; style?: CSSProperties; children: ReactNode};
const BASE_POSE: Pose = {x: 0, y: 0, s: 1, r: 0, o: 1};
const patchPose = (base: Pose, patch?: PosePatch): Pose => {
  const next = {...base};
  for (const key of ['x', 'y', 's', 'r', 'o'] as const) if (typeof patch?.[key] === 'number' && Number.isFinite(patch[key])) next[key] = patch[key] as number;
  next.o = clamp01(next.o); return next;
};
const mixPose = (a: Pose, b: Pose, p: number): Pose => ({x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p), s: lerp(a.s, b.s, p), r: lerp(a.r, b.r, p), o: clamp01(lerp(a.o, b.o, p))});
export const Move = ({from, to, start = 0, dur = 1, ease: curve, exit, blurK = 0.9, maxBlur = 32, origin = '50% 50%', style, children}: MoveProps) => {
  const f = useCurrentFrame(), id = useSafeId(), drift = useAmbient(`move-${id}`, 1.4), a = patchPose(BASE_POSE, from), b = patchPose(BASE_POSE, to);
  const baseAt = (frame: number) => mixPose(a, b, prog(frame, start, Math.max(0, finite(dur)), curve ?? ease.expoOut));
  const poseAt = (frame: number): Pose => {
    if (!exit || frame < exit.start) return baseAt(frame);
    const fromExit = baseAt(finite(exit.start)), toExit = patchPose(fromExit, exit.to);
    return mixPose(fromExit, toExit, prog(frame, exit.start, Math.max(0, finite(exit.dur)), exit.ease ?? ease.expoIn));
  };
  const p = poseAt(f), old = poseAt(f - 1), max = Math.min(32, Math.max(0, finite(maxBlur, 32))), k = Math.max(0, finite(blurK, 0.9));
  const scaleBlur = Math.abs(p.s - old.s) * 60, bx = Math.min(max, Math.abs(p.x - old.x) * k + scaleBlur), by = Math.min(max, Math.abs(p.y - old.y) * k + scaleBlur);
  return <>
    <svg aria-hidden="true" width="0" height="0" style={{position: 'absolute', overflow: 'hidden'}}><defs><filter id={`${id}-motion`} x="-150%" y="-150%" width="400%" height="400%"><feGaussianBlur stdDeviation={`${bx.toFixed(2)} ${by.toFixed(2)}`} /></filter></defs></svg>
    <div style={{...style, transform: `translate3d(${p.x + drift.x}px,${p.y + drift.y}px,0) scale(${p.s * drift.s}) rotate(${p.r}deg)`, transformOrigin: origin,
      opacity: p.o, filter: Math.max(bx, by) >= 0.35 ? `url(#${id}-motion)` : style?.filter}}>{children}</div>
  </>;
};

type TextMode = 'rise' | 'track' | 'wave' | 'blur' | 'roll';
type TextExit = {at: number; dur?: number; dir?: 'up' | 'down' | 'left' | 'right' | 'fade'};
type KTextProps = {text: string; start?: number; step?: number; dur?: number; x: number; y: number; align?: 'center' | 'left';
  size?: number; weight?: number; color?: string; accent?: string; mode?: TextMode; exit?: TextExit; lineGap?: number;
  weightFrom?: number; sweep?: boolean; underline?: boolean; maxWidth?: number; opacityTo?: number; opacityAt?: number};
type TextWord = {text: string; accent: boolean; index: number; letter: number};
type Motion = {x: number; y: number; s: number; spacing: number; opacity: number; p: number; exit: number; bx: number; by: number};
const parseText = (text: string): TextWord[][] => {
  let wi = 0, li = 0;
  return text.split('\n').map((line) => {
    const chunks = line.match(/\*[^*]+\*|\S+/g) ?? [], words: TextWord[] = [];
    for (const chunk of chunks) {
      const marked = chunk.startsWith('*') && chunk.endsWith('*') && chunk.length > 2, body = marked ? chunk.slice(1, -1) : chunk;
      for (const word of body.split(/\s+/).filter(Boolean)) { words.push({text: word, accent: marked, index: wi++, letter: li}); li += Array.from(word).length; }
    }
    return words;
  });
};
const MAX_FILTERS = 24;
export const KText = ({text, start = 0, step = 4, dur = 22, x, y, align = 'center', size = T.h2, weight = 500,
  color = C.ivory, accent = C.champagne, mode = 'rise', exit, lineGap, weightFrom, sweep = false, underline = false,
  maxWidth, opacityTo, opacityAt}: KTextProps) => {
  const frame = useCurrentFrame(), id = useSafeId(), ambient = useAmbient(`text-${id}`, 0.65), lines = parseText(text);
  const words = lines.flat(), wordCount = words.length, letters = words.reduce((sum, word) => sum + Array.from(word.text).length, 0);
  const perLetter = mode === 'track' || mode === 'wave', count = perLetter ? letters : wordCount;
  const stepSafe = Math.min(6, Math.max(3, finite(step, 4))), duration = Math.max(0, finite(dur, 22)), fontSize = Math.max(1, finite(size, T.h2));
  const maxDelay = perLetter ? stag(Math.max(0, count - 1), stepSafe, 20) + (mode === 'wave' ? 1.5 : 0) : stag(Math.max(0, wordCount - 1), stepSafe, 24);
  const settledAt = finite(start) + maxDelay + duration;
  const exitAt = exit ? Math.max(finite(exit.at), settledAt + readFrames(wordCount)) : Number.POSITIVE_INFINITY;
  const exitDur = Math.max(0, finite(exit?.dur ?? 14)), dir = exit?.dir ?? 'up', lineHeight = fontSize * 1.15;
  const delay = (index: number) => perLetter ? stag(index, stepSafe, 20) + (mode === 'wave' ? (Math.sin(index * 0.86) + 1) * 0.75 : 0) : stag(index, stepSafe, 24);
  const entryAt = (at: number, index: number) => {
    const begins = finite(start) + delay(index), linear = duration === 0 ? (at < begins ? 0 : 1) : clamp01((at - begins) / duration);
    const eased = mode === 'wave' ? ease.backOut(linear) : prog(at, begins, duration, ease.expoOut), p = clamp01(eased);
    if (mode === 'track') return {x: 0, y: 0, s: 1, spacing: lerp(0.45, -0.01, p), opacity: p, p};
    if (mode === 'wave') return {x: 0, y: (1 - eased) * fontSize * 0.72, s: 1, spacing: 0, opacity: p, p};
    if (mode === 'blur') return {x: 0, y: 0, s: lerp(0.94, 1, p), spacing: 0, opacity: p, p};
    if (mode === 'roll') return {x: 0, y: (1 - p) * fontSize * 1.05, s: 1, spacing: 0, opacity: p, p};
    return {x: 0, y: (1 - p) * fontSize * 1.15, s: 1, spacing: 0, opacity: p, p};
  };
  const exitAtFrame = (at: number, index: number) => exit ? prog(at, exitAt + stag(Math.max(0, count - 1 - index), stepSafe, 24), exitDur, ease.expoIn) : 0;
  const poseAt = (at: number, index: number) => {
    const e = entryAt(at, index), out = exitAtFrame(at, index), d = fontSize * 0.34;
    return {x: e.x + (dir === 'left' ? -d * out : dir === 'right' ? d * out : 0),
      y: e.y + (dir === 'up' ? -d * out : dir === 'down' ? d * out : 0), s: e.s, spacing: e.spacing,
      opacity: e.opacity * (1 - out), p: e.p, exit: out};
  };
  const motionAt = (at: number, index: number): Motion => {
    const m = poseAt(at, index), old = poseAt(at - 1, index), scaleBlur = Math.abs(m.s - old.s) * 60;
    const bx = Math.min(mode === 'blur' ? 14 : 32, Math.abs(m.x - old.x) * 0.9 + (perLetter ? Math.abs(m.spacing - old.spacing) * fontSize * 0.9 : 0) + scaleBlur);
    const by = Math.min(mode === 'blur' ? 14 : 32, Math.abs(m.y - old.y) * 0.9 + scaleBlur);
    return {...m, bx, by};
  };
  const filterCount = Math.min(count, MAX_FILTERS), filters = Array.from({length: filterCount}, (_, i) => ({i, m: motionAt(frame, i)})).filter(({m}) => Math.max(m.bx, m.by) >= 0.35);
  const layers = (content: string, p: number): ReactNode => weightFrom === undefined || weightFrom === weight
    ? <span style={{fontWeight: weight}}>{content}</span>
    : <span style={{display: 'inline-grid', gridTemplateAreas: '"glyph"', verticalAlign: 'baseline'}}>
      <span style={{gridArea: 'glyph', fontWeight: weightFrom, opacity: 1 - clamp01(p)}}>{content}</span>
      <span style={{gridArea: 'glyph', fontWeight: weight, opacity: clamp01(p)}}>{content}</span>
    </span>;
  const renderUnit = (content: string, index: number, marked: boolean): ReactNode => {
    const m = motionAt(frame, index), slot = Math.min(index, MAX_FILTERS - 1);
    const fade = marked && opacityTo !== undefined ? lerp(1, clamp01(opacityTo), prog(frame, opacityAt ?? settledAt, 12, ease.softOut)) : 1;
    return <span key={`u${index}`} style={{display: 'inline-block', position: 'relative', transform: `translate3d(${m.x}px,${m.y}px,0) scale(${m.s})`,
      transformOrigin: '50% 50%', opacity: clamp01(m.opacity * fade), letterSpacing: mode === 'track' ? `${m.spacing}em` : undefined,
      color: marked ? accent : color, fontStyle: marked ? 'italic' : 'normal', filter: Math.max(m.bx, m.by) >= 0.35 ? `url(#${id}-f${slot})` : undefined, whiteSpace: 'pre'}}>{layers(content, m.p)}</span>;
  };
  const renderWord = (word: TextWord, lineLength: number, localIndex: number): ReactNode => {
    const index = perLetter ? word.letter : word.index, m = motionAt(frame, index), chars = Array.from(word.text);
    const content = perLetter ? chars.map((ch, i) => renderUnit(ch, word.letter + i, word.accent)) : renderUnit(word.text, word.index, word.accent);
    const sweepP = clamp01((frame - settledAt) / 24), shine = sweep && word.accent && frame >= settledAt && frame <= settledAt + 24 ? Math.sin(sweepP * Math.PI) * 0.88 : 0;
    const underlineP = underline && word.accent ? prog(frame, settledAt + 8, 12, ease.expoOut) : 0, out = exitAtFrame(frame, index);
    const inner = mode === 'rise' ? <span style={{display: 'inline-block', overflow: 'hidden', padding: '0.2em 0', margin: '-0.2em 0', verticalAlign: 'baseline'}}>{content}</span>
      : mode === 'roll' ? <span style={{display: 'inline-block', position: 'relative', overflow: 'hidden', padding: '0.17em 0', margin: '-0.17em 0', verticalAlign: 'baseline'}}>
        <span aria-hidden="true" style={{position: 'absolute', left: 0, top: 0, display: 'inline-block', whiteSpace: 'nowrap', color: word.accent ? accent : color,
          fontStyle: word.accent ? 'italic' : 'normal', opacity: clamp01((1 - m.p) * 0.22 * (1 - out)), transform: `translate3d(0,${m.y - fontSize * 1.05}px,0)`,
          filter: Math.max(m.bx, m.by) >= 0.35 ? `url(#${id}-f${Math.min(index, MAX_FILTERS - 1)})` : undefined}}>{layers(word.text, m.p)}</span>{content}</span> : content;
    return <span key={`w${word.index}`} style={{display: 'inline-block', position: 'relative', marginRight: localIndex === lineLength - 1 ? 0 : '0.26em', whiteSpace: 'nowrap'}}>
      {inner}
      {shine > 0 && <span aria-hidden="true" style={{position: 'absolute', inset: 0, color: 'transparent', WebkitTextFillColor: 'transparent', WebkitBackgroundClip: 'text', backgroundClip: 'text',
        backgroundImage: 'linear-gradient(105deg,transparent 0%,transparent 44%,rgba(244,239,230,.15) 47%,rgba(232,211,162,.98) 50%,rgba(244,239,230,.15) 53%,transparent 56%,transparent 100%)',
        backgroundSize: '240% 100%', backgroundPosition: `${240 * (1 - sweepP)}% 0`, opacity: shine, mixBlendMode: 'screen', whiteSpace: 'nowrap', pointerEvents: 'none'}}>{word.text}</span>}
      {underline && word.accent && <span aria-hidden="true" style={{position: 'absolute', left: 0, right: 0, bottom: '-0.06em', height: 3, borderRadius: 3,
        backgroundColor: C.champagne, transform: `scaleX(${underlineP})`, transformOrigin: 'left center', opacity: clamp01(1 - out), boxShadow: '0 0 12px rgba(200,169,106,.34)', pointerEvents: 'none'}} />}
    </span>;
  };
  const rootStyle: CSSProperties = {...TYPE, position: 'absolute', left: x, top: y, transform: align === 'center'
    ? `translate(-50%,-50%) translate3d(${ambient.x}px,${ambient.y}px,0) scale(${ambient.s})`
    : `translateY(-50%) translate3d(${ambient.x}px,${ambient.y}px,0) scale(${ambient.s})`,
    display: 'flex', flexDirection: 'column', alignItems: align === 'center' ? 'center' : 'flex-start', width: 'max-content', maxWidth, fontSize, fontWeight: weight,
    lineHeight: `${lineHeight}px`, color, textAlign: align, whiteSpace: 'nowrap', zIndex: 2};
  return <div style={rootStyle} aria-label={text.replace(/\*/g, '')}>
    <svg aria-hidden="true" width="0" height="0" style={{position: 'absolute', overflow: 'hidden'}}><defs>{filters.map(({i, m}) => <filter key={i} id={`${id}-f${i}`} x="-150%" y="-150%" width="400%" height="400%"><feGaussianBlur stdDeviation={`${m.bx.toFixed(2)} ${m.by.toFixed(2)}`} /></filter>)}</defs></svg>
    {lines.map((line, i) => <div key={i} style={{display: 'flex', alignItems: 'baseline', justifyContent: align === 'center' ? 'center' : 'flex-start', width: 'max-content', minHeight: lineHeight,
      marginTop: i ? Math.max(0, finite(lineGap ?? fontSize * 0.12)) : 0, whiteSpace: 'nowrap'}}>{line.map((word, j) => renderWord(word, line.length, j))}</div>)}
  </div>;
};

export const Type = ({text, start = 0, cps = 1.2, size = T.body, color = C.ivory, caret = true}: {text: string; start?: number; cps?: number; size?: number; color?: string; caret?: boolean}) => {
  const f = useCurrentFrame(), chars = Array.from(text), count = Math.min(chars.length, Math.max(0, Math.floor(Math.max(0, f - start) * Math.max(0, finite(cps, 1.2)))));
  const cursor = caret && Math.floor(Math.max(0, f - start) / 12) % 2 === 0;
  return <span style={{...TYPE, fontSize: size, color, whiteSpace: 'pre-wrap', lineHeight: 1.4}}>{chars.slice(0, count).join('')}{cursor && <span style={{color: C.champagne, marginLeft: 2, opacity: 0.95}}>|</span>}</span>;
};
export const press = (frame: number, clickFrame: number, dur = 14): number => {
  const start = finite(clickFrame), length = Math.max(3, finite(dur, 14));
  if (frame < start) return 0;
  return frame < start + 3 ? prog(frame, start, 3, ease.expoOut) : 1 - prog(frame, start + 3, length - 3, ease.softOut);
};

type CursorKey = {f: number; x: number; y: number; click?: boolean; grab?: boolean};
type CursorPose = {x: number; y: number; grab: boolean} | null;
const cursorPoseAt = (frame: number, keys: CursorKey[]): CursorPose => {
  if (!keys.length || frame < keys[0].f) return null;
  if (keys.length === 1 || frame >= keys[keys.length - 1].f) { const last = keys[keys.length - 1]; return {x: last.x, y: last.y, grab: last.grab === true}; }
  let i = 0; while (i < keys.length - 2 && frame > keys[i + 1].f) i++;
  const a = keys[i], b = keys[i + 1], p = prog(frame, a.f, Math.max(0, b.f - a.f), ease.inOut), dx = b.x - a.x, dy = b.y - a.y, length = Math.hypot(dx, dy), side = i % 2 ? -1 : 1;
  const cx = (a.x + b.x) / 2 + (length ? -dy / length * length * 0.18 * side : 0), cy = (a.y + b.y) / 2 + (length ? dx / length * length * 0.18 * side : 0), q = 1 - p;
  return {x: q * q * a.x + 2 * q * p * cx + p * p * b.x, y: q * q * a.y + 2 * q * p * cy + p * p * b.y, grab: a.grab === true};
};
type CursorProps = {name?: string; color?: string; keys: CursorKey[]; scale?: number};
export const Cursor = ({name = 'Founder', color = C.champagne, keys, scale = 1}: CursorProps) => {
  const f = useCurrentFrame(), id = useSafeId(), idle = useAmbient(`cursor-${name}`, 5);
  const list = keys.filter((k) => Number.isFinite(k.f) && Number.isFinite(k.x) && Number.isFinite(k.y)).slice().sort((a, b) => a.f - b.f);
  if (!list.length || f < list[0].f) return null;
  const pose = cursorPoseAt(f, list); if (!pose) return null;
  const poseBefore = cursorPoseAt(Math.max(f - 1, list[0].f), list) ?? pose;
  const wiggleAt = (at: number) => {
    const upcoming = list.find((k) => k.click && k.f >= at && k.f - at <= 8);
    if (!upcoming) return {x: 0, y: 0};
    const p = clamp01(1 - (upcoming.f - at) / 8), env = Math.sin(p * Math.PI);
    return {x: Math.sin(p * Math.PI * 2) * 2.4 * env, y: Math.cos(p * Math.PI * 2) * 1.2 * env};
  };
  const wiggle = wiggleAt(f), oldWiggle = wiggleAt(f - 1), oldIdle = ambientAt(`cursor-${name}`, f - 1, 5);
  const px = pose.x + wiggle.x + idle.x, py = pose.y + wiggle.y + idle.y;
  const bx = Math.min(32, Math.abs(px - poseBefore.x - oldWiggle.x - oldIdle.x) * 0.9), by = Math.min(32, Math.abs(py - poseBefore.y - oldWiggle.y - oldIdle.y) * 0.9);
  const last = list[list.length - 1].f, alpha = f >= last + 30 ? 1 - prog(f, last + 30, 8, ease.expoOut) : 1;
  const clicks = list.filter((k) => k.click), pulse = clicks.reduce((best, k) => Math.max(best, press(f, k.f, 10)), 0);
  const actualScale = Math.max(0, finite(scale, 1)) * (pose.grab ? 0.9 : 1) * (1 - pulse * 0.16), rotate = idle.r * (2 / 0.45);
  const tagW = Math.max(62, Array.from(name).length * 10 + 22), ripples = clicks.filter((k) => f >= k.f && f <= k.f + 20);
  return <div style={{position: 'absolute', left: px, top: py, opacity: clamp01(alpha), transform: `rotate(${rotate}deg) scale(${actualScale})`, transformOrigin: '3px 3px',
    pointerEvents: 'none', zIndex: 100, filter: Math.max(bx, by) >= 0.35 ? `url(#${id}-motion)` : undefined}}>
    <svg aria-hidden="true" width="0" height="0" style={{position: 'absolute', overflow: 'hidden'}}><defs>
      <filter id={`${id}-motion`} x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation={`${bx.toFixed(2)} ${by.toFixed(2)}`} /></filter>
      <filter id={`${id}-shadow`} x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.34" /></filter>
    </defs></svg>
    <svg width={tagW + 38} height="62" viewBox={`0 0 ${tagW + 38} 62`} style={{overflow: 'visible', display: 'block'}}>
      {ripples.map((k, i) => { const p = prog(f, k.f, 20, ease.softOut); return <circle key={i} cx="5" cy="5" r={54 * p} fill="none" stroke={color} strokeWidth="2" opacity={0.5 * (1 - p)} />; })}
      <g filter={`url(#${id}-shadow)`}>
        <path d="M3 2 L3 27 L10.1 20.2 L15.2 31 L19.8 28.8 L14.6 18.1 L24.6 18.1 Z" fill="#FFF" stroke={C.champagne} strokeWidth="1.5" strokeLinejoin="round" />
        <rect x="20" y="25" width={tagW} height="30" rx="12" fill={color} />
        <text x="31" y="45" fill={C.paper} fontFamily={FONT} fontSize="18" fontWeight="600" style={{fontKerning: 'normal', fontVariantNumeric: 'lining-nums tabular-nums'}}>{name}</text>
      </g>
    </svg>
  </div>;
};

type CardProps = {x: number; y: number; w: number; h: number; theme?: 'dark' | 'light'; radius?: number; children?: ReactNode; style?: CSSProperties};
export const Card = ({x, y, w, h, theme = 'dark', radius = 28, children, style}: CardProps) => {
  const dark = theme === 'dark';
  return <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: radius, border: `1px solid ${dark ? C.lineDark : C.lineLight}`,
    background: dark ? 'linear-gradient(138deg,rgba(255,255,255,.075),rgba(255,255,255,.028) 48%,rgba(255,255,255,.012))' : 'linear-gradient(138deg,rgba(255,255,255,.95),rgba(251,248,242,.79) 52%,rgba(244,239,230,.68))',
    boxShadow: dark ? '0 60px 140px rgba(0,0,0,.45)' : '0 40px 100px rgba(60,40,10,.14)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', overflow: 'hidden', ...style}}>
    <div aria-hidden="true" style={{position: 'absolute', left: 1, right: 1, top: 1, height: 1, background: dark ? 'linear-gradient(90deg,transparent,rgba(255,255,255,.34),transparent)' : 'linear-gradient(90deg,transparent,rgba(255,255,255,.92),transparent)', zIndex: 0, pointerEvents: 'none'}} />
    <div style={{position: 'relative', zIndex: 1, width: '100%', height: '100%'}}>{children}</div>
  </div>;
};

type Tone = 'champagne' | 'emerald' | 'ember' | 'mist' | 'ink';
const TONES: Record<Tone, {bg: string; border: string; color: string}> = {
  champagne: {bg: 'rgba(200,169,106,.16)', border: 'rgba(200,169,106,.42)', color: C.gold2},
  emerald: {bg: 'rgba(31,138,112,.16)', border: 'rgba(31,138,112,.42)', color: '#74C9AE'},
  ember: {bg: 'rgba(228,87,46,.14)', border: 'rgba(228,87,46,.40)', color: '#F08A6D'},
  mist: {bg: 'rgba(138,134,125,.14)', border: 'rgba(138,134,125,.34)', color: C.ivory},
  ink: {bg: 'rgba(11,12,14,.08)', border: 'rgba(11,12,14,.15)', color: C.ink2},
};
export const Chip = ({label, tone = 'champagne', icon, style}: {label: string; tone?: Tone; icon?: ReactNode; style?: CSSProperties}) => {
  const t = TONES[tone];
  return <span style={{...TYPE, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 999, border: `1px solid ${t.border}`, background: t.bg, color: t.color, fontSize: 18, fontWeight: 600, lineHeight: 1, whiteSpace: 'nowrap', ...style}}>
    {icon && <span style={{display: 'inline-flex', alignItems: 'center'}}>{icon}</span>}{label}
  </span>;
};
export const Avatar = ({name, tone = 'champagne', size = 48, style}: {name: string; tone?: Tone; size?: number; style?: CSSProperties}) => {
  const t = TONES[tone], initials = name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => Array.from(part)[0] ?? '').join('').toUpperCase();
  return <div aria-label={name} style={{...TYPE, width: size, height: size, display: 'inline-flex', flex: '0 0 auto', alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
    border: '1px solid rgba(255,255,255,.28)', background: `radial-gradient(circle at 32% 24%,${t.color},${t.bg} 76%)`, color: tone === 'ink' ? C.ink : C.paper,
    boxShadow: '0 8px 22px rgba(0,0,0,.18),inset 0 1px rgba(255,255,255,.28)', fontSize: size * 0.31, fontWeight: 600, lineHeight: 1, ...style}}>{initials}</div>;
};
export const Label = ({text, color = C.mist, style}: {text: string; color?: string; style?: CSSProperties}) =>
  <span style={{...TYPE, display: 'inline-block', color, fontSize: T.label, fontWeight: 600, letterSpacing: '0.22em', lineHeight: 1.2, textTransform: 'uppercase', whiteSpace: 'nowrap', ...style}}>{text}</span>;
export const Counter = ({from, to, start, dur, decimals = 0, suffix = '', style}: {from: number; to: number; start: number; dur: number; decimals?: number; suffix?: string; style?: CSSProperties}) => {
  const f = useCurrentFrame(), places = Math.min(6, Math.max(0, Math.floor(finite(decimals))));
  const value = lerp(finite(from), finite(to), prog(f, start, dur, ease.expoOut));
  return <span style={{...TYPE, fontFeatureSettings: '"lnum" 1,"tnum" 1', ...style}}>{finite(value).toLocaleString('en-US', {minimumFractionDigits: places, maximumFractionDigits: places})}{suffix}</span>;
};
export const Ring = ({size, stroke, value, color, track, style}: {size: number; stroke: number; value: number; color: string; track: string; style?: CSSProperties}) => {
  const f = useCurrentFrame(), s = Math.max(1, finite(size, 1)), sw = Math.max(0.5, finite(stroke, 1)), r = Math.max(0, (s - sw) / 2), p = clamp01(value) * prog(f, 0, 24, ease.expoOut);
  return <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{display: 'block', overflow: 'visible', ...style}} aria-hidden="true">
    <circle cx={s / 2} cy={s / 2} r={r} fill="none" stroke={track} strokeWidth={sw} />
    <circle cx={s / 2} cy={s / 2} r={r} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" pathLength="100" strokeDasharray="100 100" strokeDashoffset={100 - p * 100} transform={`rotate(-90 ${s / 2} ${s / 2})`} />
  </svg>;
};
export const Spark = ({w, h, points, progress, color, style}: {w: number; h: number; points: number[]; progress: number; color: string; style?: CSSProperties}) => {
  const width = Math.max(1, finite(w, 1)), height = Math.max(1, finite(h, 1)), data = points.map((n) => finite(n));
  const min = data.length ? Math.min(...data) : 0, max = data.length ? Math.max(...data) : 1, range = max - min || 1, inset = height * 0.12;
  let path = data.map((n, i) => `${i ? 'L' : 'M'} ${(data.length === 1 ? 0 : i / (data.length - 1) * width).toFixed(2)} ${(height - inset - (n - min) / range * (height - 2 * inset)).toFixed(2)}`).join(' ');
  if (data.length === 1) path += ` L ${width} ${height - inset - (data[0] - min) / range * (height - 2 * inset)}`;
  const drawn = path ? evolvePath(clamp01(progress), path) : null;
  return <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{display: 'block', overflow: 'visible', ...style}} aria-hidden="true">{drawn && <path d={path} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={drawn.strokeDasharray} strokeDashoffset={drawn.strokeDashoffset} />}</svg>;
};
export const Tick = ({progress, size, color, style}: {progress: number; size: number; color: string; style?: CSSProperties}) => {
  const path = 'M4 12.5 L9.5 18 L20 6', drawn = evolvePath(clamp01(progress), path);
  return <svg width={Math.max(1, finite(size, 1))} height={Math.max(1, finite(size, 1))} viewBox="0 0 24 24" style={{display: 'block', overflow: 'visible', ...style}} aria-hidden="true">
    <path d={path} fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={drawn.strokeDasharray} strokeDashoffset={drawn.strokeDashoffset} />
  </svg>;
};
