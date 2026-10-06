// src/lib/Transitions.tsx
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {useId} from 'react';
import type {ReactNode} from 'react';
import {C, H, W, clamp01, ease, lerp, prog} from './kit';

type TransitionInKind = 'iris' | 'pushzoom' | 'slices' | 'diagonal';
type TransitionOutKind = 'pushzoom' | 'none';
type Origin = {x: number; y: number};
type TransitionInProps = {kind: TransitionInKind; dur?: number; origin?: Origin; children: ReactNode};
type TransitionOutProps = {kind: TransitionOutKind; total: number; dur?: number; children: ReactNode};
const idFor = (id: string): string => id.replace(/:/g, '').replace(/[^a-zA-Z0-9_-]/g, '');
const finite = (value: number, fallback = 0): number => Number.isFinite(value) ? value : fallback;
const safeDuration = (duration: number | undefined, fallback: number): number => Math.max(1, Number.isFinite(duration) ? duration as number : fallback);
const clipWrap = (clipPath: string, children: ReactNode) => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <div style={{position: 'absolute', inset: 0, clipPath}}>{children}</div>
  </AbsoluteFill>
);

type SliceState = {index: number; progress: number; y: number; height: number};
const sliceState = (frame: number): SliceState[] => Array.from({length: 8}, (_, index) => {
  const p = prog(frame, index * 2, 16, ease.expoOut), height = H * p;
  return {index, progress: p, y: index % 2 === 0 ? 0 : H - height, height};
});

export const TransitionIn = ({kind, dur = 24, origin = {x: W / 2, y: H / 2}, children}: TransitionInProps) => {
  const frame = useCurrentFrame(), id = idFor(useId()), duration = safeDuration(dur, 24);

  if (kind === 'iris') {
    const p = prog(frame, 0, duration, ease.inOut), radius = 2300 * p;
    const edgeOpacity = 1 - prog(frame, duration * 0.55, duration * 0.45, ease.expoIn);
    return <>
      {clipWrap(`circle(${radius}px at ${origin.x}px ${origin.y}px)`, children)}
      <AbsoluteFill style={{pointerEvents: 'none'}}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          <defs><filter id={`${id}-iris-glow`} x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="6" /></filter></defs>
          <circle cx={origin.x} cy={origin.y} r={radius} fill="none" stroke={C.gold2} strokeWidth="5" opacity={edgeOpacity * 0.72} filter={`url(#${id}-iris-glow)`} />
          <circle cx={origin.x} cy={origin.y} r={radius} fill="none" stroke={C.gold2} strokeWidth="3" opacity={edgeOpacity} />
        </svg>
      </AbsoluteFill>
    </>;
  }

  if (kind === 'pushzoom') {
    const p = prog(frame, 0, duration * 0.6, ease.expoOut), t = clamp01(frame / duration);
    const flashProgress = t <= 0.45 ? ease.expoOut(clamp01(t / 0.45)) : 1 - ease.expoIn(clamp01((t - 0.45) / 0.55));
    const blur = 20 * (1 - p), flash = 0.22 * clamp01(flashProgress);
    return <>
      <svg aria-hidden="true" width="0" height="0" style={{position: 'absolute', overflow: 'hidden'}}>
        <defs><filter id={`${id}-zoom-blur`} x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation={blur.toFixed(2)} /></filter></defs>
      </svg>
      <AbsoluteFill style={{overflow: 'hidden'}}>
        <div style={{position: 'absolute', inset: 0, transform: `scale(${lerp(0.8, 1, p)})`, opacity: p,
          filter: blur >= 0.35 ? `url(#${id}-zoom-blur)` : undefined}}>{children}</div>
        <AbsoluteFill style={{background: 'linear-gradient(115deg,rgba(232,211,162,0.72),rgba(255,252,242,0.96),rgba(200,169,106,0.62))',
          opacity: flash, mixBlendMode: 'screen', pointerEvents: 'none'}} />
      </AbsoluteFill>
    </>;
  }

  if (kind === 'slices') {
    const slices = sliceState(frame);
    return <>
      <svg aria-hidden="true" width="0" height="0" style={{position: 'absolute', overflow: 'hidden'}}>
        <defs>
          <clipPath id={`${id}-slices`} clipPathUnits="userSpaceOnUse">
            {slices.map(({index, y, height}) => <rect key={index} x={index * 240} y={y} width="240" height={height} />)}
          </clipPath>
          <filter id={`${id}-seam-glow`} x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="2" /></filter>
        </defs>
      </svg>
      <AbsoluteFill style={{overflow: 'hidden'}}>
        <div style={{position: 'absolute', inset: 0, clipPath: `url(#${id}-slices)`}}>{children}</div>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
          {Array.from({length: 9}, (_, boundary) => {
            const left = slices[Math.max(0, boundary - 1)].progress, right = slices[Math.min(7, boundary)].progress;
            const opacity = 0.42 * (1 - Math.max(left, right));
            return <g key={boundary} opacity={opacity}>
              <line x1={boundary * 240} y1="0" x2={boundary * 240} y2={H} stroke={C.gold2} strokeWidth="3" filter={`url(#${id}-seam-glow)`} />
              <line x1={boundary * 240} y1="0" x2={boundary * 240} y2={H} stroke={C.gold2} strokeWidth="1" />
            </g>;
          })}
        </svg>
      </AbsoluteFill>
    </>;
  }

  const p = prog(frame, 0, duration, ease.inOut), slant = H * Math.tan((12 * Math.PI) / 180) / 2;
  const center = lerp(-slant, W + slant, p), topX = center + slant, bottomX = center - slant;
  const edgeOpacity = 1 - prog(frame, Math.max(0, duration - 5), Math.min(5, duration), ease.expoIn);
  const polygon = `polygon(0px 0px,${topX}px 0px,${bottomX}px ${H}px,0px ${H}px)`;
  return <>
    <svg aria-hidden="true" width="0" height="0" style={{position: 'absolute', overflow: 'hidden'}}>
      <defs>
        <linearGradient id={`${id}-streak-gradient`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={C.gold2} stopOpacity="0" /><stop offset="48%" stopColor={C.gold2} stopOpacity="0.02" />
          <stop offset="62%" stopColor={C.gold2} stopOpacity="0.7" /><stop offset="100%" stopColor={C.gold2} stopOpacity="0" />
        </linearGradient>
        <filter id={`${id}-streak-blur`} x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="20 1.5" /></filter>
        <filter id={`${id}-edge-glow`} x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="4" /></filter>
      </defs>
    </svg>
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, clipPath: polygon}}>{children}</div>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none'}}>
        <path d={`M ${topX} 0 L ${bottomX} ${H}`} fill="none" stroke={`url(#${id}-streak-gradient)`} strokeWidth="54" opacity={edgeOpacity * 0.8} filter={`url(#${id}-streak-blur)`} />
        <path d={`M ${topX} 0 L ${bottomX} ${H}`} fill="none" stroke={C.gold2} strokeWidth="10" opacity={edgeOpacity * 0.42} filter={`url(#${id}-edge-glow)`} />
        <path d={`M ${topX} 0 L ${bottomX} ${H}`} fill="none" stroke={C.gold2} strokeWidth="4" opacity={edgeOpacity} />
      </svg>
    </AbsoluteFill>
  </>;
};

export const TransitionOut = ({kind, total, dur = 24, children}: TransitionOutProps) => {
  const frame = useCurrentFrame(), id = idFor(useId()), duration = safeDuration(dur, 24);
  if (kind === 'none') return <>{children}</>;
  const start = Math.max(0, finite(total) - duration), p = prog(frame, start, duration, ease.expoIn), blur = 18 * p;
  return <>
    <svg aria-hidden="true" width="0" height="0" style={{position: 'absolute', overflow: 'hidden'}}>
      <defs><filter id={`${id}-out-blur`} x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation={blur.toFixed(2)} /></filter></defs>
    </svg>
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, transform: `scale(${lerp(1, 1.35, p)})`, opacity: 1 - p,
        filter: blur >= 0.35 ? `url(#${id}-out-blur)` : undefined}}>{children}</div>
    </AbsoluteFill>
  </>;
};

type PanelDirection = 'left' | 'right' | 'up' | 'down';
type PanelSwapProps = {at: number; dur?: number; dir?: PanelDirection; outChildren: ReactNode; inChildren: ReactNode};
export const PanelSwap = ({at, dur = 18, dir = 'left', outChildren, inChildren}: PanelSwapProps) => {
  const frame = useCurrentFrame(), id = idFor(useId()), duration = safeDuration(dur, 18);
  const outP = prog(frame, at, duration, ease.expoIn), inP = prog(frame, at, duration, ease.expoOut);
  const dx = dir === 'left' ? -1 : dir === 'right' ? 1 : 0, dy = dir === 'up' ? -1 : dir === 'down' ? 1 : 0;
  const outX = dx * 70 * outP, outY = dy * 70 * outP, inX = -dx * 70 * (1 - inP), inY = -dy * 70 * (1 - inP);
  const oldOut = prog(frame - 1, at, duration, ease.expoIn), oldIn = prog(frame - 1, at, duration, ease.expoOut);
  const outBlurX = Math.min(32, Math.abs(dx * 70 * (outP - oldOut)) * 0.9), outBlurY = Math.min(32, Math.abs(dy * 70 * (outP - oldOut)) * 0.9);
  const inBlurX = Math.min(32, Math.abs(dx * 70 * (inP - oldIn)) * 0.9), inBlurY = Math.min(32, Math.abs(dy * 70 * (inP - oldIn)) * 0.9);
  return <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
    <svg aria-hidden="true" width="0" height="0" style={{position: 'absolute', overflow: 'hidden'}}><defs>
      <filter id={`${id}-out`} x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation={`${outBlurX.toFixed(2)} ${outBlurY.toFixed(2)}`} /></filter>
      <filter id={`${id}-in`} x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation={`${inBlurX.toFixed(2)} ${inBlurY.toFixed(2)}`} /></filter>
    </defs></svg>
    <div style={{position: 'absolute', inset: 0, transform: `translate3d(${outX}px,${outY}px,0)`, opacity: 1 - outP,
      filter: Math.max(outBlurX, outBlurY) >= 0.35 ? `url(#${id}-out)` : undefined}}>{outChildren}</div>
    <div style={{position: 'absolute', inset: 0, transform: `translate3d(${inX}px,${inY}px,0)`, opacity: inP,
      filter: Math.max(inBlurX, inBlurY) >= 0.35 ? `url(#${id}-in)` : undefined}}>{inChildren}</div>
  </div>;
};

type FlipCardProps = {at: number; dur?: number; front: ReactNode; back: ReactNode; w: number; h: number};
export const FlipCard = ({at, dur = 28, front, back, w, h}: FlipCardProps) => {
  const frame = useCurrentFrame(), id = idFor(useId()), duration = safeDuration(dur, 28);
  const progress = clamp01((frame - at) / duration), oldProgress = clamp01((frame - 1 - at) / duration);
  const angle = 180 * ease.backOut(progress), oldAngle = 180 * ease.backOut(oldProgress), blurX = Math.min(32, Math.abs(angle - oldAngle) * 0.18);
  const shineProgress = prog(frame, at, duration, ease.inOut), shineOpacity = Math.sin(shineProgress * Math.PI) * 0.28;
  const shineX = lerp(-115, 115, shineProgress);
  return <div style={{position: 'relative', width: w, height: h, perspective: 1800, transformStyle: 'preserve-3d'}}>
    <svg aria-hidden="true" width="0" height="0" style={{position: 'absolute', overflow: 'hidden'}}>
      <defs><filter id={`${id}-flip-blur`} x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation={`${blurX.toFixed(2)} 0`} /></filter></defs>
    </svg>
    <div style={{position: 'absolute', inset: 0, transform: `rotateY(${angle}deg)`, transformStyle: 'preserve-3d',
      filter: blurX >= 0.35 ? `url(#${id}-flip-blur)` : undefined}}>
      <div style={{position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden'}}>{front}</div>
      <div style={{position: 'absolute', inset: 0, transform: 'rotateY(180deg)', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden'}}>{back}</div>
    </div>
    {shineOpacity > 0 && <div aria-hidden="true" style={{position: 'absolute', inset: '-4% -35%', transform: `translateX(${shineX}%)`, opacity: shineOpacity,
      background: 'linear-gradient(90deg,transparent 35%,rgba(255,255,255,.48) 50%,transparent 65%)', mixBlendMode: 'screen', pointerEvents: 'none', backfaceVisibility: 'hidden'}} />}
  </div>;
};
