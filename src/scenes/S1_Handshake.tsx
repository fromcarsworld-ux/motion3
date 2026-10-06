// src/scenes/S1_Handshake.tsx
import {evolvePath} from '@remotion/paths';
import {AbsoluteFill, spring, useCurrentFrame} from 'remotion';
import {useId} from 'react';
import type * as React from 'react';
import {Backdrop, C, Chip, Cursor, FPS, KText, Move, ease, prog, press} from '../lib/kit';

const POS = {
  ringAStart: {x: -240, y: 300}, ringAJoin: {x: 880, y: 300}, ringAHigh: {x: 900, y: 170}, ringALate: {x: 800, y: 170},
  ringBStart: {x: 2160, y: 300}, ringBJoin: {x: 1040, y: 300}, ringBHigh: {x: 1020, y: 170}, ringBLate: {x: 1120, y: 170},
  lensJoin: {x: 960, y: 300}, shock: {x: 960, y: 300}, cursorStart: {x: 1760, y: 980}, cursorRing: {x: 1180, y: 300},
  cursorHover: {x: 1126, y: 178}, ringBClick: {x: 1120, y: 170}, lastActive: {x: 1120, y: 250},
} as const;

const LENS_PATH = 'M 0 -89 C 24 -89 40 -49 40 0 C 40 49 24 89 0 89 C -24 89 -40 49 -40 0 C -40 -49 -24 -89 0 -89 Z';
const SAFE_ID = (id: string): string => id.replace(/:/g, '').replace(/[^a-zA-Z0-9_-]/g, '');

const HandshakeRing: React.FC<{stroke: string; frame: number; side: 'maya' | 'dev'; scale?: number; previousScale?: number; opacity?: number; glow?: number}> = ({
  stroke, frame, side, scale = 1, previousScale = scale, opacity = 1, glow = 0,
}) => {
  const id = SAFE_ID(useId());
  const breathingAt = (at: number) => at < 50 ? 0 : Math.sin((at - 50) * Math.PI * 2 / 92) * 8 * (side === 'maya' ? 1 : -1);
  const breathing = breathingAt(frame), oldBreathing = breathingAt(frame - 1);
  const scaleBlur = Math.abs(scale - previousScale) * 60;
  const blurX = Math.min(32, Math.abs(breathing - oldBreathing) * 0.9 + scaleBlur);
  return <svg width="240" height="240" viewBox="-120 -120 240 240" style={{position: 'absolute', left: -120, top: -120, overflow: 'visible'}} aria-hidden="true">
    <defs>
      <filter id={`${id}-ring-glow`} x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="7" /></filter>
      <filter id={`${id}-ring-motion`} x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation={`${blurX.toFixed(2)} ${scaleBlur.toFixed(2)}`} /></filter>
    </defs>
    <g transform={`translate(${breathing} 0) scale(${scale})`} opacity={opacity}
      filter={blurX >= 0.35 || scaleBlur >= 0.35 ? `url(#${id}-ring-motion)` : undefined}>
      {glow > 0 && <circle cx="0" cy="0" r="120" fill="none" stroke={C.champagne} strokeWidth="9" opacity={glow * 0.5} filter={`url(#${id}-ring-glow)`} />}
      <circle cx="0" cy="0" r="120" fill="none" stroke={stroke} strokeWidth="3" />
    </g>
  </svg>;
};

const DrawUnderline: React.FC<{path: string; start: number; end?: number}> = ({path, start, end}) => {
  const frame = useCurrentFrame(), draw = evolvePath(prog(frame, start, 12, ease.expoOut), path);
  const opacity = end === undefined ? 1 : 1 - prog(frame, end, 8, ease.expoIn);
  return <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none'}} aria-hidden="true">
    <path d={path} fill="none" stroke={C.champagne} strokeWidth="3" strokeLinecap="round" opacity={opacity}
      strokeDasharray={draw.strokeDasharray} strokeDashoffset={draw.strokeDashoffset} />
  </svg>;
};

const ClockGlyph: React.FC = () => <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
  <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
  <path d="M12 7v5l3.3 2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
</svg>;

export const S1Handshake: React.FC = () => {
  const frame = useCurrentFrame(), id = SAFE_ID(useId());
  const lensFill = prog(frame, 50, 5, ease.expoOut), lensPop = spring({
    frame: Math.max(0, frame - 50), fps: FPS, config: {damping: 14, stiffness: 120, mass: 0.8}, durationInFrames: 18,
  });
  const lensFade = 1 - prog(frame, 262, 38, ease.expoIn);
  const lensGlow = 0.2 + 0.08 * Math.sin(frame * Math.PI * 2 / 76);
  const shockProgress = prog(frame, 50, 24, ease.expoOut);
  const shockOpacity = 0.4 * (1 - shockProgress);
  const clickPulse = press(frame, 330, 10);
  const swellAt = (at: number) => ease.backOut(prog(at, 333, 18, (value) => value));
  const ringBScale = 1 - 0.06 * clickPulse + 0.12 * swellAt(frame);
  const previousRingBScale = 1 - 0.06 * press(frame - 1, 330, 10) + 0.12 * swellAt(frame - 1);
  const ringBGlow = 0.16 + clickPulse * 0.72 + 0.08 * (0.5 + 0.5 * Math.sin(frame * Math.PI * 2 / 82));
  const lateDriftA = POS.ringALate.x - POS.ringAHigh.x;
  const lateDriftB = POS.ringBLate.x - POS.ringBHigh.x;
  const overlay = prog(frame, 258, 78, ease.inOut);

  return <>
    <Backdrop theme="ivory" ghost="TRUST" ghostSize={560} ghostY={540} />
    <div style={{position: 'absolute', inset: 0, backgroundColor: '#E9E3D6', opacity: overlay, pointerEvents: 'none'}} />

    <Move from={{x: POS.lensJoin.x, y: POS.lensJoin.y}} to={{x: POS.lensJoin.x, y: POS.lensJoin.y}} start={0} dur={1}
      exit={{start: 150, dur: 35, to: {x: 960, y: 170, s: 0.55}}} style={{position: 'absolute', left: 0, top: 0}}>
      <svg width="240" height="240" viewBox="-120 -120 240 240" style={{position: 'absolute', left: -120, top: -120, overflow: 'visible', opacity: 0.85 * lensFill * lensFade}} aria-hidden="true">
        <defs>
          <linearGradient id={`${id}-lens`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={C.gold2} stopOpacity="0.98" /><stop offset="100%" stopColor={C.champagne} stopOpacity="0.84" />
          </linearGradient>
          <filter id={`${id}-lens-glow`} x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="8" /></filter>
        </defs>
        <g transform={`scale(${0.82 + 0.18 * lensPop})`}>
          <path d={LENS_PATH} fill={C.champagne} opacity={lensGlow * lensFill * 0.42} filter={`url(#${id}-lens-glow)`} />
          <path d={LENS_PATH} fill={`url(#${id}-lens)`} />
        </g>
      </svg>
    </Move>

    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <defs><filter id={`${id}-shock-glow`} x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="5" /></filter></defs>
        <circle cx={POS.shock.x} cy={POS.shock.y} r={120 + 340 * shockProgress} fill="none" stroke={C.gold2} strokeWidth="3"
          opacity={shockOpacity} filter={`url(#${id}-shock-glow)`} />
        {frame >= 330 && <circle cx={POS.ringBClick.x} cy={POS.ringBClick.y} r={110 * prog(frame, 330, 20, ease.expoOut)} fill="none"
          stroke={C.champagne} strokeWidth="2.5" opacity={0.42 * (1 - prog(frame, 330, 20, ease.expoOut))} />}
      </svg>
    </AbsoluteFill>

    <Move from={POS.ringAStart} to={POS.ringAJoin} start={0} dur={50} ease={ease.expoOut}
      exit={{start: 150, dur: 35, to: {x: POS.ringAHigh.x, y: POS.ringAHigh.y, s: 0.55}}} style={{position: 'absolute', left: 0, top: 0}}>
      <Move from={{x: 0, y: 0}} to={{x: lateDriftA}} start={258} dur={42} ease={ease.inOut}
        style={{position: 'absolute', left: 0, top: 0}}>
        <HandshakeRing stroke={C.ink2} frame={frame} side="maya" />
      </Move>
    </Move>
    <Move from={POS.ringBStart} to={POS.ringBJoin} start={0} dur={50} ease={ease.expoOut}
      exit={{start: 150, dur: 35, to: {x: POS.ringBHigh.x, y: POS.ringBHigh.y, s: 0.55}}} style={{position: 'absolute', left: 0, top: 0}}>
      <Move from={{x: 0, y: 0, o: 1}} to={{x: lateDriftB, o: 0.3}} start={258} dur={42} ease={ease.inOut}
        style={{position: 'absolute', left: 0, top: 0}}>
        <HandshakeRing stroke={C.champagne} frame={frame} side="dev" scale={ringBScale} previousScale={previousRingBScale} glow={ringBGlow} />
      </Move>
    </Move>

    <KText text="Every great company" start={56} step={5} dur={22} x={960} y={640} size={96} weight={500} color={C.ink} mode="rise"
      exit={{at: 150, dur: 14, dir: 'up'}} />
    <KText text="starts with a *handshake.*" start={68} step={5} dur={22} x={960} y={752} size={96} weight={500} color={C.ink} mode="rise"
      exit={{at: 150, dur: 14, dir: 'up'}} />
    <DrawUnderline path="M 900 817 C 1015 821 1170 821 1325 817" start={128} end={150} />

    <KText text="No contract." start={160} dur={20} x={960} y={470} size={120} weight={500} color={C.ink} mode="track"
      exit={{at: 252, dur: 14, dir: 'left'}} />
    <KText text="No numbers." start={176} dur={20} x={960} y={610} size={120} weight={500} color={C.ink} mode="track"
      exit={{at: 252, dur: 14, dir: 'left'}} />
    <KText text="Just *trust.*" start={192} dur={20} x={960} y={750} size={120} weight={500} color={C.ink} mode="track"
      exit={{at: 252, dur: 14, dir: 'left'}} />
    <DrawUnderline path="M 922 818 C 1014 822 1120 822 1214 818" start={220} end={256} />

    <KText text="Then, one of you goes *quiet.*" start={270} step={4} dur={22} x={960} y={540} size={88} weight={400} weightFrom={600}
      color={C.ink} accent={C.champagne} mode="rise" opacityTo={0.55} opacityAt={332} />
    <KText text="*And nobody says a word.*" start={296} step={4} dur={18} x={960} y={640} size={36} weight={400}
      color={C.mistDark} accent={C.mistDark} mode="blur" />

    <Move from={{y: 12, o: 0}} to={{y: 0, o: 1}} start={284} dur={14} ease={ease.expoOut}
      style={{position: 'absolute', left: POS.lastActive.x, top: POS.lastActive.y}}>
      <Chip label="Last active  9 days ago" tone="ember" icon={<ClockGlyph />} style={{fontSize: 17, padding: '7px 11px'}} />
    </Move>

    <Cursor name="Maya" color={C.champagne} keys={[
      {f: 268, ...POS.cursorStart},
      {f: 300, ...POS.cursorRing},
      {f: 322, ...POS.cursorHover},
      {f: 330, ...POS.ringBClick, click: true},
    ]} />
  </>;
};
