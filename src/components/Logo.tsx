// src/components/Logo.tsx
import {evolvePath} from '@remotion/paths';
import {spring, useCurrentFrame} from 'remotion';
import {useId} from 'react';
import type {CSSProperties} from 'react';
import {C, FPS, FONT, clamp01, ease, prog, useAmbient} from '../lib/kit';

type LogoTheme = 'dark' | 'light';
type LogoMarkProps = {size: number; theme: LogoTheme; start?: number; glow?: boolean};
type WordmarkProps = {size: number; theme: LogoTheme; start?: number};
type LogoLockupProps = {layout: 'stack' | 'row'; size: number; theme: LogoTheme; start?: number; tagline?: string};

const safeId = (id: string): string => id.replace(/:/g, '').replace(/[^a-zA-Z0-9_-]/g, '');
const safeFrame = (frame: number, fallback = 0): number => Number.isFinite(frame) ? frame : fallback;
const circleA = 'M 92 59 C 125.69 59 153 86.31 153 120 C 153 153.69 125.69 181 92 181 C 58.31 181 31 153.69 31 120 C 31 86.31 58.31 59 92 59 Z';
const circleB = 'M 148 59 C 181.69 59 209 86.31 209 120 C 209 153.69 181.69 181 148 181 C 114.31 181 87 153.69 87 120 C 87 86.31 114.31 59 148 59 Z';
const lens = 'M 120 65 C 139 65 153 90 153 120 C 153 150 139 175 120 175 C 101 175 87 150 87 120 C 87 90 101 65 120 65 Z';
const fStem = 'M 113 91 L 113 149 M 113 92 L 136 92 M 113 115 L 131 115';
const TYPE: CSSProperties = {
  fontFamily: FONT,
  fontVariantNumeric: 'lining-nums tabular-nums',
  textRendering: 'geometricPrecision',
  fontKerning: 'normal',
  WebkitFontSmoothing: 'antialiased',
};

export const LogoMark = ({size, theme, start = 0, glow = true}: LogoMarkProps) => {
  const frame = useCurrentFrame(), id = safeId(useId()), drift = useAmbient(`logo-mark-${id}`, 1.2);
  const startFrame = safeFrame(start), diameter = Math.max(1, safeFrame(size, 1));
  const ringAProgress = prog(frame, startFrame, 22, ease.expoOut);
  const ringBProgress = prog(frame, startFrame + 8, 22, ease.expoOut);
  const lensProgress = prog(frame, startFrame + 24, 16, ease.expoOut);
  const pop = spring({
    frame: Math.max(0, frame - startFrame - 24),
    fps: FPS,
    config: {damping: 14, stiffness: 120, mass: 0.8},
    durationInFrames: 16,
  });
  const revealWidth = 100 * lensProgress;
  const lensScale = 0.86 + 0.14 * safeFrame(pop);
  const ringAProgressPath = evolvePath(ringAProgress, circleA);
  const ringBProgressPath = evolvePath(ringBProgress, circleB);
  const stemProgress = prog(frame, startFrame + 30, 10, ease.expoOut);
  const stemPath = evolvePath(stemProgress, fStem);
  const rotationGate = prog(frame, startFrame + 30, 16, ease.softOut);
  const breath = Math.sin(((frame - startFrame - 30) * Math.PI * 2) / 240) * 6 * rotationGate;
  const pulse = 0.58 + 0.22 * Math.sin((frame - startFrame) * Math.PI * 2 / 92);
  const strokeA = theme === 'dark' ? C.ivory : C.ink;
  const springTransform = `translate(120 120) scale(${lensScale}) translate(-120 -120)`;

  return <svg width={diameter} height={diameter} viewBox="0 0 240 240" role="img" aria-label="FounderSync">
    <defs>
      <linearGradient id={`${id}-lens-fill`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={C.gold2} stopOpacity="0.96" />
        <stop offset="100%" stopColor={C.champagne} stopOpacity="0.78" />
      </linearGradient>
      <clipPath id={`${id}-lens-wipe`} clipPathUnits="userSpaceOnUse">
        <rect x="70" y="55" width={revealWidth} height="130" />
      </clipPath>
      <filter id={`${id}-glow`} x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="6" />
      </filter>
    </defs>
    <g transform={`translate(${drift.x} ${drift.y}) scale(${drift.s})`}>
      {lensProgress > 0 && <g transform={springTransform} clipPath={`url(#${id}-lens-wipe)`}>
        {glow && <path d={lens} fill={C.champagne} opacity={pulse * lensProgress * 0.48} filter={`url(#${id}-glow)`} />}
        <path d={lens} fill={`url(#${id}-lens-fill)`} opacity={lensProgress} />
      </g>}
      <g transform={`rotate(${breath} 92 120)`}>
        <path d={circleA} fill="none" stroke={strokeA} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray={ringAProgressPath.strokeDasharray} strokeDashoffset={ringAProgressPath.strokeDashoffset} />
      </g>
      <g transform={`rotate(${-breath} 148 120)`}>
        {glow && <path d={circleB} fill="none" stroke={C.champagne} strokeWidth="13" strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray={ringBProgressPath.strokeDasharray} strokeDashoffset={ringBProgressPath.strokeDashoffset}
          opacity={pulse * 0.34} filter={`url(#${id}-glow)`} />}
        <path d={circleB} fill="none" stroke={C.champagne} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray={ringBProgressPath.strokeDasharray} strokeDashoffset={ringBProgressPath.strokeDashoffset} />
      </g>
      {stemProgress > 0 && <path d={fStem} fill="none" stroke={C.ink2} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
        opacity={0.72 * lensProgress} strokeDasharray={stemPath.strokeDasharray} strokeDashoffset={stemPath.strokeDashoffset} />}
    </g>
  </svg>;
};

const wordMotion = (frame: number, start: number, index: number) => {
  const localStart = start + index * 2;
  const xAt = (at: number) => 9 * (1 - prog(at, localStart, 14, ease.expoOut));
  const progress = prog(frame, localStart, 14, ease.expoOut);
  const blurX = Math.min(32, Math.abs(xAt(frame) - xAt(frame - 1)) * 0.9);
  return {progress, x: xAt(frame), blurX};
};

export const Wordmark = ({size, theme, start = 0}: WordmarkProps) => {
  const frame = useCurrentFrame(), id = safeId(useId()), drift = useAmbient(`logo-wordmark-${id}`, 0.8);
  const startFrame = safeFrame(start), letters = Array.from('FounderSync'), settleFrame = startFrame + (letters.length - 1) * 2 + 14;
  const sweepProgress = clamp01((frame - settleFrame) / 24);
  const sweepOpacity = frame >= settleFrame && frame <= settleFrame + 24 ? Math.sin(sweepProgress * Math.PI) * 0.85 : 0;
  const baseColor = theme === 'dark' ? C.ivory : C.ink;
  const rootStyle: CSSProperties = {
    ...TYPE, display: 'inline-flex', position: 'relative', alignItems: 'baseline', whiteSpace: 'nowrap',
    fontSize: size, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1,
    transform: `translate3d(${drift.x}px,${drift.y}px,0) scale(${drift.s})`,
  };
  return <span style={rootStyle} aria-label="FounderSync">
    <svg aria-hidden="true" width="0" height="0" style={{position: 'absolute', overflow: 'hidden'}}>
      <defs>{letters.map((_, index) => {
        const {blurX} = wordMotion(frame, startFrame, index);
        return blurX >= 0.35 ? <filter key={index} id={`${id}-letter-${index}`} x="-150%" y="-100%" width="400%" height="300%">
          <feGaussianBlur stdDeviation={`${blurX.toFixed(2)} 0`} />
        </filter> : null;
      })}</defs>
    </svg>
    {letters.map((letter, index) => {
      const motion = wordMotion(frame, startFrame, index), isSync = index >= 7;
      return <span key={`${letter}-${index}`} style={{display: 'inline-block', position: 'relative', color: isSync ? C.champagne : baseColor,
        fontStyle: isSync ? 'italic' : 'normal', transform: `translate3d(${motion.x}px,0,0)`, opacity: motion.progress,
        filter: motion.blurX >= 0.35 ? `url(#${id}-letter-${index})` : undefined,
        marginLeft: index === 7 ? '0.035em' : 0}}>{letter}</span>;
    })}
    {sweepOpacity > 0 && <span aria-hidden="true" style={{position: 'absolute', inset: 0, display: 'inline-flex', alignItems: 'baseline', whiteSpace: 'nowrap',
      fontSize: size, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1, pointerEvents: 'none'}}>
      <span style={{color: 'transparent', WebkitTextFillColor: 'transparent', WebkitBackgroundClip: 'text', backgroundClip: 'text',
        backgroundImage: 'linear-gradient(105deg,transparent 0%,transparent 43%,rgba(244,239,230,.12) 47%,rgba(232,211,162,.98) 50%,rgba(244,239,230,.12) 53%,transparent 57%,transparent 100%)',
        backgroundSize: '240% 100%', backgroundPosition: `${240 * (1 - sweepProgress)}% 0`, opacity: sweepOpacity, fontStyle: 'normal'}}>Founder</span>
      <span style={{color: 'transparent', WebkitTextFillColor: 'transparent', WebkitBackgroundClip: 'text', backgroundClip: 'text',
        backgroundImage: 'linear-gradient(105deg,transparent 0%,transparent 43%,rgba(244,239,230,.12) 47%,rgba(232,211,162,.98) 50%,rgba(244,239,230,.12) 53%,transparent 57%,transparent 100%)',
        backgroundSize: '240% 100%', backgroundPosition: `${240 * (1 - sweepProgress)}% 0`, opacity: sweepOpacity, fontStyle: 'italic', marginLeft: '0.035em'}}>Sync</span>
    </span>}
  </span>;
};

export const LogoLockup = ({layout, size, theme, start = 0, tagline}: LogoLockupProps) => {
  const fontSize = Math.max(1, safeFrame(size, 1)), markSize = fontSize * 1.8;
  const gap = layout === 'stack' ? markSize * 0.45 : markSize * 0.34;
  const textBlock = <div style={{display: 'flex', flexDirection: 'column', alignItems: layout === 'stack' ? 'center' : 'flex-start', gap: tagline ? fontSize * 0.22 : 0}}>
    <Wordmark size={fontSize} theme={theme} start={start} />
    {tagline && <span style={{...TYPE, color: theme === 'dark' ? C.ivory : C.ink, fontSize: fontSize * 0.4, fontWeight: 500,
      fontStyle: 'italic', letterSpacing: '0.015em', whiteSpace: 'nowrap'}}>{tagline}</span>}
  </div>;
  return <div style={{display: 'inline-flex', flexDirection: layout === 'stack' ? 'column' : 'row', alignItems: 'center', gap}}>
    <LogoMark size={markSize} theme={theme} start={start} />
    {textBlock}
  </div>;
};
