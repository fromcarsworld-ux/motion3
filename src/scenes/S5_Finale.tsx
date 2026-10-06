// src/scenes/S5_Finale.tsx
import {useId} from 'react';
import {useCurrentFrame} from 'remotion';
import type * as React from 'react';
import {
  Backdrop, C, Cursor, KText, Move, W, H, ease, prog, press, useAmbient,
} from '../lib/kit';
import {LogoMark, Wordmark} from '../components/Logo';

export const BRAND = {url: 'foundersync.com', cta: 'Join the waitlist'} as const;

const POS = {
  firstBeat: {x: 960, y: 500}, secondBeat: {x: 960, y: 500},
  thirdFirst: {x: 960, y: 450}, thirdSecond: {x: 960, y: 570},
  logoMark: {x: 960, y: 350}, wordmark: {x: 960, y: 560}, tagline: {x: 960, y: 660},
  cta: {x: 960, y: 800, w: 520, h: 92}, url: {x: 960, y: 900},
  cursorStart: {x: 1700, y: 1000}, cursorPill: {x: 960, y: 800},
} as const;

const TYPE: React.CSSProperties = {
  fontFamily: 'Lora', fontVariantNumeric: 'lining-nums tabular-nums', textRendering: 'geometricPrecision',
  fontKerning: 'normal', WebkitFontSmoothing: 'antialiased',
};
const SAFE_ID = (id: string): string => id.replace(/:/g, '').replace(/[^a-zA-Z0-9_-]/g, '');

const WaitlistPill: React.FC = () => {
  const frame = useCurrentFrame(), id = SAFE_ID(useId()), amount = press(frame, 304, 18);
  const scaleAt = (at: number) => 1 - 0.035 * press(at, 304, 18);
  const blur = Math.min(24, Math.abs(scaleAt(frame) - scaleAt(frame - 1)) * 60);
  const breathing = 0.55 + 0.45 * Math.sin(frame * Math.PI / 24);
  const ripple = prog(frame, 304, 26, ease.expoOut);
  return <>
    <svg aria-hidden="true" width="0" height="0" style={{position: 'absolute', overflow: 'hidden'}}><defs>
      <filter id={`${id}-press-motion`} x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation={`${blur.toFixed(2)} ${blur.toFixed(2)}`} /></filter>
    </defs></svg>
    <div role="button" aria-label={BRAND.cta} style={{...TYPE, position: 'absolute', inset: 0, width: POS.cta.w, height: POS.cta.h,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, borderRadius: 999, boxSizing: 'border-box',
      border: '1px solid rgba(255,255,255,.38)', background: `linear-gradient(135deg,${C.gold2},${C.champagne})`, color: C.ink,
      fontSize: 34, fontWeight: 600, whiteSpace: 'nowrap', transform: `scale(${scaleAt(frame)})`,
      boxShadow: `0 14px 42px rgba(11,12,14,.18),0 0 ${22 + 22 * breathing + 28 * amount}px rgba(200,169,106,${0.22 + 0.42 * breathing + 0.22 * amount})`,
      filter: blur >= 0.35 ? `url(#${id}-press-motion)` : undefined}}>
      <span>{BRAND.cta}</span>
      <span aria-hidden="true" style={{fontSize: 38, lineHeight: 1, transform: `translateX(${2 * breathing}px)`}}>→</span>
      {frame >= 304 && <span aria-hidden="true" style={{position: 'absolute', inset: -8, borderRadius: 999, border: `2px solid rgba(200,169,106,${0.42 * (1 - ripple)})`,
        transform: `scale(${1 + 0.12 * ripple})`, opacity: 1 - ripple, pointerEvents: 'none'}} />}
    </div>
  </>;
};

const FinaleBurst: React.FC<{frame: number}> = ({frame}) => {
  if (frame < 304 || frame > 340) return null;
  return <>
    {Array.from({length: 24}, (_, index) => {
      const angle = index * (Math.PI * 2 / 24) + (index % 4) * 0.055;
      const distance = 42 + (index % 6) * 12, rise = 14 + (index % 5) * 5;
      const dx = Math.cos(angle) * distance, dy = Math.sin(angle) * distance - rise, size = 3 + (index % 4);
      return <Move key={index} from={{x: 0, y: 0, s: 0.55, o: 1}} to={{x: dx, y: dy, s: 0.14, o: 0}}
        start={304} dur={36} ease={ease.expoOut} style={{position: 'absolute', left: POS.cta.x, top: POS.cta.y}}>
        <div style={{width: size, height: size, borderRadius: '50%', background: index % 3 === 0 ? C.gold2 : C.champagne,
          boxShadow: '0 0 13px rgba(232,211,162,.82)'}} />
      </Move>;
    })}
  </>;
};

const FinaleContent: React.FC = () => {
  const frame = useCurrentFrame(), dawnPulse = 0.19 + 0.07 * Math.sin(frame * Math.PI / 34);
  const camera = useAmbient('s5-content-push', 0.8);
  return <>
    <div aria-hidden="true" style={{position: 'absolute', left: W * 0.16 + camera.x * 2, top: H * 0.53 + camera.y * 2, width: W * 0.68, height: H * 0.62,
      transform: 'translate(-50%,-50%)', borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(200,169,106,.18) 0%,rgba(200,169,106,.08) 48%,transparent 74%)',
      filter: 'blur(54px)', opacity: 0.8 + dawnPulse, mixBlendMode: 'screen', pointerEvents: 'none'}} />

    <KText text="The best cofounders aren't *lucky.*" start={16} step={4} dur={22} x={POS.firstBeat.x} y={POS.firstBeat.y}
      size={92} weight={500} color={C.ivory} mode="rise" exit={{at: 96, dur: 14, dir: 'up'}} />
    <KText text="They're *aligned.*" start={100} step={4} dur={24} x={POS.secondBeat.x} y={POS.secondBeat.y}
      size={140} weight={500} color={C.ivory} mode="wave" sweep exit={{at: 160, dur: 12, dir: 'up'}} />
    <KText text="Build trust with *data.*" start={164} step={4} dur={22} x={POS.thirdFirst.x} y={POS.thirdFirst.y}
      size={100} weight={500} color={C.ivory} accent={C.champagne} mode="rise" underline exit={{at: 238, dur: 14, dir: 'fade'}} />
    <KText text="Not assumptions." start={176} step={4} dur={22} x={POS.thirdSecond.x} y={POS.thirdSecond.y}
      size={100} weight={500} color={C.mist} mode="rise" exit={{at: 238, dur: 14, dir: 'fade'}} />

    <Move from={{y: 16, o: 0, s: 0.94}} to={{y: 0, o: 1, s: 1}} start={236} dur={18} ease={ease.expoOut}
      style={{position: 'absolute', left: 0, top: 0, width: W, height: H}}>
      <div style={{position: 'absolute', left: POS.logoMark.x, top: POS.logoMark.y, transform: 'translate(-50%,-50%)'}}>
        <LogoMark size={200} theme="dark" start={236} glow />
      </div>
    </Move>
    <Move from={{y: 13, o: 0}} to={{y: 0, o: 1}} start={258} dur={16} ease={ease.expoOut}
      style={{position: 'absolute', left: 0, top: 0, width: W, height: H}}>
      <div style={{position: 'absolute', left: POS.wordmark.x, top: POS.wordmark.y, transform: 'translate(-50%,-50%)'}}>
        <Wordmark size={120} theme="dark" start={264} />
      </div>
    </Move>
    <KText text="*Trust, in sync.*" start={262} step={4} dur={22} x={POS.tagline.x} y={POS.tagline.y}
      size={44} weight={500} color={C.champagne} accent={C.champagne} mode="track" />

    <Move from={{y: 18, s: 0.78, o: 0}} to={{y: 0, s: 1, o: 1}} start={270} dur={18} ease={ease.backOut}
      style={{position: 'absolute', left: POS.cta.x - POS.cta.w / 2, top: POS.cta.y - POS.cta.h / 2, width: POS.cta.w, height: POS.cta.h}}>
      <WaitlistPill />
    </Move>
    <KText text={BRAND.url} start={284} step={4} dur={18} x={POS.url.x} y={POS.url.y}
      size={28} weight={400} color={C.mist} mode="blur" />
    <FinaleBurst frame={frame} />
  </>;
};

export const S5Finale: React.FC = () => (
  <>
    <Backdrop theme="dawn" ghost="SYNC" ghostSize={560} ghostY={540} ghostOpacity={0.055} />
    <Move from={{s: 1}} to={{s: 1.03}} start={236} dur={104} ease={ease.inOut} origin="50% 50%"
      style={{position: 'absolute', left: 0, top: 0, width: W, height: H}}>
      <div style={{position: 'absolute', inset: 0}}><FinaleContent /></div>
    </Move>
    <Cursor name="Maya" color={C.champagne} keys={[
      {f: 262, ...POS.cursorStart}, {f: 296, ...POS.cursorPill}, {f: 304, ...POS.cursorPill, click: true},
    ]} />
  </>
);
