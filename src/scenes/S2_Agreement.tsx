// src/scenes/S2_Agreement.tsx
import {evolvePath} from '@remotion/paths';
import {spring, useCurrentFrame} from 'remotion';
import {useId} from 'react';
import type * as React from 'react';
import {
  Avatar, Backdrop, C, Card, Chip, Counter, Cursor, FPS, KText, Label, Move, Tick,
  clamp01, ease, prog, press, useAmbient,
} from '../lib/kit';
import {PanelSwap} from '../lib/Transitions';
import {LogoMark} from '../components/Logo';

const POS = {
  logoMark: {x: 960, y: 380}, logoWord: {x: 960, y: 590}, logoTagline: {x: 960, y: 700},
  badgeMark: {x: 160, y: 100}, badgeWord: {x: 290, y: 100},
  card: {x: 860, y: 170, w: 940, h: 740},
  tabs: {roles: {x: 966, y: 286}, equity: {x: 1090, y: 286}, vesting: {x: 1214, y: 286}, exit: {x: 1318, y: 286}, ip: {x: 1419, y: 286}},
  mayaStart: {x: 1780, y: 980}, sliderStart: {x: 1330, y: 792.5}, sliderOver: {x: 1367, y: 792.5}, sliderEnd: {x: 1363, y: 792.5},
  accept: {x: 1620, y: 830}, mayaSign: {x: 1100, y: 784}, devStart: {x: 1800, y: 200}, devSign: {x: 1475, y: 784},
  cursorAwayMaya: {x: 1780, y: 960}, cursorAwayDev: {x: 1840, y: 940},
} as const;
const BODY = '#CFC8B8';
const TYPE: React.CSSProperties = {fontFamily: 'Lora', fontVariantNumeric: 'lining-nums tabular-nums', textRendering: 'geometricPrecision', fontKerning: 'normal', WebkitFontSmoothing: 'antialiased'};
const ID = (id: string): string => id.replace(/:/g, '').replace(/[^a-zA-Z0-9_-]/g, '');

const BrandWordmark: React.FC<{size: number; start: number}> = ({size, start}) => {
  const frame = useCurrentFrame(), id = ID(useId()), letters = Array.from('FounderSync');
  const motion = (f: number, index: number) => {
    const t = prog(f, start + index * 2, 12, ease.expoOut), before = prog(f - 1, start + index * 2, 12, ease.expoOut);
    return {p: t, x: 9 * (1 - t), blur: Math.min(32, Math.abs(t - before) * 9 * 0.9)};
  };
  const sweepP = prog(frame, 84, 26, ease.inOut), sweepOpacity = frame >= 84 && frame <= 110 ? Math.sin(sweepP * Math.PI) * 0.84 : 0;
  return <span style={{...TYPE, display: 'inline-flex', position: 'relative', whiteSpace: 'nowrap', fontSize: size, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1}} aria-label="FounderSync">
    <svg aria-hidden="true" width="0" height="0" style={{position: 'absolute', overflow: 'hidden'}}><defs>
      {letters.map((_, i) => { const m = motion(frame, i); return m.blur >= 0.35 ? <filter key={i} id={`${id}-${i}`} x="-150%" y="-100%" width="400%" height="300%"><feGaussianBlur stdDeviation={`${m.blur.toFixed(2)} 0`} /></filter> : null; })}
    </defs></svg>
    {letters.map((letter, i) => {
      const m = motion(frame, i), sync = i >= 7;
      return <span key={`${i}-${letter}`} style={{display: 'inline-block', color: sync ? C.champagne : C.ivory, fontStyle: sync ? 'italic' : 'normal',
        transform: `translate3d(${m.x}px,0,0)`, opacity: m.p, filter: m.blur >= 0.35 ? `url(#${id}-${i})` : undefined, marginLeft: i === 7 ? '0.035em' : 0}}>{letter}</span>;
    })}
    {sweepOpacity > 0 && <span aria-hidden="true" style={{position: 'absolute', inset: 0, display: 'inline-flex', whiteSpace: 'nowrap', fontSize: size, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1, pointerEvents: 'none'}}>
      <span style={{color: 'transparent', WebkitTextFillColor: 'transparent', WebkitBackgroundClip: 'text', backgroundClip: 'text', backgroundImage: 'linear-gradient(105deg,transparent 0%,transparent 43%,rgba(244,239,230,.12) 47%,rgba(232,211,162,.98) 50%,rgba(244,239,230,.12) 53%,transparent 57%,transparent 100%)', backgroundSize: '240% 100%', backgroundPosition: `${240 * (1 - sweepP)}% 0`, opacity: sweepOpacity}}>Founder</span>
      <span style={{color: 'transparent', WebkitTextFillColor: 'transparent', WebkitBackgroundClip: 'text', backgroundClip: 'text', backgroundImage: 'linear-gradient(105deg,transparent 0%,transparent 43%,rgba(244,239,230,.12) 47%,rgba(232,211,162,.98) 50%,rgba(244,239,230,.12) 53%,transparent 57%,transparent 100%)', backgroundSize: '240% 100%', backgroundPosition: `${240 * (1 - sweepP)}% 0`, opacity: sweepOpacity, fontStyle: 'italic', marginLeft: '0.035em'}}>Sync</span>
    </span>}
  </span>;
};

const RoleTile: React.FC<{name: string; role: string; tone: 'champagne' | 'emerald'; left: number}> = ({name, role, tone, left}) => (
  <div style={{position: 'absolute', left, top: 78, width: 395, height: 150, borderRadius: 22, border: '1px solid rgba(255,255,255,0.10)',
    background: 'linear-gradient(140deg,rgba(255,255,255,.055),rgba(255,255,255,.018))', padding: '24px 26px', boxSizing: 'border-box'}}>
    <Avatar name={name} tone={tone} size={52} />
    <div style={{...TYPE, position: 'absolute', left: 96, top: 27, color: C.ivory, fontSize: 30, fontWeight: 600}}>{name}</div>
    <div style={{...TYPE, position: 'absolute', left: 96, top: 68, color: BODY, fontSize: 22}}>{role}</div>
    <div style={{position: 'absolute', left: 26, right: 26, bottom: 22, height: 3, borderRadius: 3, background: tone === 'champagne' ? C.champagne : C.emerald, opacity: 0.66}} />
  </div>
);

const RolesPanel: React.FC = () => <div style={{position: 'absolute', inset: 0, color: C.ivory}}>
  <Label text="FOUNDERS & ROLES" color={C.mist} style={{position: 'absolute', left: 40, top: 18, fontSize: 16}} />
  <RoleTile name="Maya" role="CEO · Direction & strategy" tone="champagne" left={40} />
  <RoleTile name="Dev" role="CTO · Product & engineering" tone="emerald" left={505} />
  <div style={{...TYPE, position: 'absolute', left: 42, top: 260, color: BODY, fontSize: 25}}>Decisions have owners. Promises have a place to live.</div>
  <Chip label="Decision framework set" tone="champagne" style={{position: 'absolute', left: 40, top: 326, fontSize: 18}} />
  <Chip label="IP wizard ready" tone="mist" style={{position: 'absolute', left: 265, top: 326, fontSize: 18}} />
  <div style={{position: 'absolute', left: 550, top: 324, width: 250, height: 40, borderRadius: 20, background: 'rgba(255,255,255,.055)', overflow: 'hidden'}}>
    <div style={{height: '100%', width: `${100 * prog(useCurrentFrame(), 146, 40, ease.expoOut)}%`, background: 'linear-gradient(90deg,rgba(200,169,106,.28),rgba(200,169,106,.74))'}} />
  </div>
  <Label text="AGREEMENT COVERAGE" color={C.mist} style={{position: 'absolute', left: 550, top: 374, fontSize: 14}} />
</div>;

const AcceptButton: React.FC = () => {
  const frame = useCurrentFrame(), id = ID(useId()), fill = prog(frame, 262, 8, ease.expoOut), pulse = press(frame, 262, 14);
  const scaleAt = (at: number) => 1 - 0.03 * press(at, 262, 14), blur = Math.min(32, Math.abs(scaleAt(frame) - scaleAt(frame - 1)) * 60);
  return <>
    <svg aria-hidden="true" width="0" height="0" style={{position: 'absolute', overflow: 'hidden'}}><defs>
      <filter id={`${id}-press`} x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation={`${blur.toFixed(2)} ${blur.toFixed(2)}`} /></filter>
    </defs></svg>
    <div style={{position: 'absolute', left: 660, top: 478, width: 200, height: 56, borderRadius: 28, boxSizing: 'border-box',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, border: `1.5px solid ${C.gold2}`,
      background: `rgba(31,138,112,${0.86 * fill})`, boxShadow: `0 0 ${10 + 20 * pulse}px rgba(200,169,106,${0.1 + 0.42 * pulse})`,
      transform: `scale(${scaleAt(frame)})`, filter: blur >= 0.35 ? `url(#${id}-press)` : undefined, color: C.ivory}}>
      <Tick progress={prog(frame, 262, 10, ease.expoOut)} size={22} color={C.ivory} />
      <span style={{...TYPE, fontSize: 21, fontWeight: 600}}>Accept</span>
    </div>
  </>;
};

const EquityPanel: React.FC = () => {
  const frame = useCurrentFrame(), id = ID(useId()), drag = prog(frame, 206, 30, ease.inOut), maya = 50 + 5 * drag, dev = 100 - maya;
  const handleAt = (at: number) => { const p = prog(at, 206, 30, ease.inOut); return 330 + 33 * p + 4 * Math.sin(p * Math.PI); };
  const arc = prog(frame, 200, 22, ease.expoOut), handle = handleAt(frame), handleBlur = Math.min(32, Math.abs(handle - handleAt(frame - 1)) * 0.9);
  return <div style={{position: 'absolute', inset: 0, color: C.ivory}}>
    <svg aria-hidden="true" width="0" height="0" style={{position: 'absolute', overflow: 'hidden'}}><defs>
      <filter id={`${id}-handle-blur`} x="-150%" y="-150%" width="400%" height="400%"><feGaussianBlur stdDeviation={`${handleBlur.toFixed(2)} 0`} /></filter>
    </defs></svg>
    <Label text="EQUITY SPLIT" color={C.mist} style={{position: 'absolute', left: 40, top: 14, fontSize: 16}} />
    <svg width="300" height="300" viewBox="0 0 300 300" style={{position: 'absolute', left: 140, top: 86, overflow: 'visible'}} aria-hidden="true">
      <circle cx="150" cy="150" r="132" fill="none" stroke="rgba(255,255,255,.10)" strokeWidth="28" />
      <g transform="rotate(-90 150 150)">
        <circle cx="150" cy="150" r="132" fill="none" stroke={C.champagne} strokeWidth="28" pathLength="100" strokeDasharray={`${maya * arc} 100`} strokeLinecap="butt" />
        <circle cx="150" cy="150" r="132" fill="none" stroke={C.emerald} strokeWidth="28" pathLength="100" strokeDasharray={`${dev * arc} 100`} strokeDashoffset={`${-maya * arc}`} strokeLinecap="butt" />
      </g>
    </svg>
    <div style={{...TYPE, position: 'absolute', left: 140, top: 193, width: 300, textAlign: 'center', color: C.ivory, fontSize: 64, fontWeight: 600, lineHeight: 1}}>
      <Counter from={50} to={55} start={206} dur={30} /> <span style={{color: C.mist, fontSize: 38}}>/</span> <Counter from={50} to={45} start={206} dur={30} />
    </div>
    <div style={{...TYPE, position: 'absolute', left: 140, top: 263, width: 300, textAlign: 'center', color: BODY, fontSize: 18}}>MAYA <span style={{color: C.champagne}}>●</span> &nbsp; DEV <span style={{color: C.emerald}}>●</span></div>
    <div style={{position: 'absolute', left: 140, top: 466, width: 660, height: 5, borderRadius: 5, background: 'rgba(255,255,255,.14)'}} />
    <div style={{position: 'absolute', left: 140, top: 466, width: `${660 * prog(frame, 206, 30, ease.inOut)}px`, height: 5, borderRadius: 5, background: `linear-gradient(90deg,${C.champagne},${C.gold2})`}} />
    <div style={{position: 'absolute', left: 140 + handle - 12, top: 454, width: 24, height: 29, borderRadius: 12, background: C.gold2,
      border: '3px solid #FFF7E7', boxShadow: '0 0 22px rgba(200,169,106,.56)', filter: handleBlur >= 0.35 ? `url(#${id}-handle-blur)` : undefined}} />
    <div style={{...TYPE, position: 'absolute', left: 140, top: 484, color: BODY, fontSize: 18}}>0%</div>
    <div style={{...TYPE, position: 'absolute', left: 746, top: 484, color: BODY, fontSize: 18}}>100%</div>
    <div style={{...TYPE, position: 'absolute', left: 140, top: 421, color: C.ivory, fontSize: 22, fontStyle: 'italic'}}>Cofounder equity, with vesting</div>
    <AcceptButton />
    {frame >= 262 && <Move from={{y: 10, s: 0.8, o: 0}} to={{y: 0, s: 1, o: 1}} start={262} dur={18} ease={ease.backOut}
      style={{position: 'absolute', left: 692, top: 430}}><Chip label="Dev accepted" tone="emerald" style={{fontSize: 16}} /></Move>}
  </div>;
};

const VestingPanel: React.FC = () => {
  const frame = useCurrentFrame(), id = ID(useId()), barP = prog(frame, 270, 28, ease.expoOut);
  const barBlur = Math.min(32, Math.abs(barP - prog(frame - 1, 270, 28, ease.expoOut)) * 780 * 0.9);
  const cliff = spring({frame: Math.max(0, frame - 276), fps: FPS, config: {damping: 14, stiffness: 120, mass: 0.8}, durationInFrames: 14});
  return <div style={{position: 'absolute', inset: 0, color: C.ivory}}>
    <svg aria-hidden="true" width="0" height="0" style={{position: 'absolute', overflow: 'hidden'}}><defs>
      <filter id={`${id}-bar-blur`} x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation={`${barBlur.toFixed(2)} 0`} /></filter>
    </defs></svg>
    <Label text="FOUR-YEAR VESTING" color={C.mist} style={{position: 'absolute', left: 40, top: 18, fontSize: 16}} />
    <div style={{...TYPE, position: 'absolute', left: 40, top: 55, color: C.ivory, fontSize: 34, fontWeight: 600}}>Built to stay fair over time</div>
    <div style={{position: 'absolute', left: 80, top: 196, width: 780, height: 18, borderRadius: 9, background: 'rgba(255,255,255,.1)'}} />
    <div style={{position: 'absolute', left: 80, top: 196, width: `${780 * barP}px`, height: 18, borderRadius: 9, background: `linear-gradient(90deg,${C.champagne},${C.gold2})`, boxShadow: '0 0 18px rgba(200,169,106,.24)', filter: barBlur >= 0.35 ? `url(#${id}-bar-blur)` : undefined}} />
    {[1, 2, 3, 4].map((year) => <div key={year} style={{position: 'absolute', left: 80 + year * 195, top: 186, width: 2, height: 38, background: 'rgba(255,255,255,.55)'}} />)}
    {[1, 2, 3, 4].map((year) => <span key={year} style={{...TYPE, position: 'absolute', left: 80 + year * 195 - 4, top: 238, color: BODY, fontSize: 20}}>{year}</span>)}
    <div style={{...TYPE, position: 'absolute', left: 80, top: 238, color: C.mist, fontSize: 16}}>YEAR</div>
    <div style={{position: 'absolute', left: 80 + 195 - 2, top: 182, width: 4, height: 45, background: C.gold2, transform: `scaleY(${0.5 + 0.5 * clamp01(cliff)})`, transformOrigin: 'center'}} />
    <Move from={{s: 0.55, o: 0, y: 6}} to={{s: 1, o: 1, y: 0}} start={276} dur={12} ease={ease.backOut}
      style={{position: 'absolute', left: 207, top: 260}}><Chip label="1-year cliff" tone="champagne" style={{fontSize: 17}} /></Move>
    <Move from={{y: 14, o: 0}} to={{y: 0, o: 1}} start={272} dur={12} ease={ease.expoOut}
      style={{position: 'absolute', left: 80, top: 346}}><Chip label="Monthly vesting after cliff" tone="mist" style={{fontSize: 19, padding: '10px 16px'}} /></Move>
    <Move from={{y: 14, o: 0}} to={{y: 0, o: 1}} start={276} dur={12} ease={ease.expoOut}
      style={{position: 'absolute', left: 420, top: 346}}><Chip label="Exit simulator ready" tone="emerald" style={{fontSize: 19, padding: '10px 16px'}} /></Move>
  </div>;
};

const Signature: React.FC<{name: string; color: string; path: string; start: number; left: number}> = ({name, color, path, start, left}) => {
  const frame = useCurrentFrame(), line = evolvePath(prog(frame, start, 24, ease.expoOut), path);
  return <g>
    <text x={left} y="350" fill={C.mist} fontFamily="Lora" fontSize="19" fontWeight="500">{name}</text>
    <path d={`M ${left} 410 L ${left + 260} 410`} fill="none" stroke="rgba(255,255,255,.24)" strokeWidth="1" />
    <path d={path} fill="none" stroke={color} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"
      strokeDasharray={line.strokeDasharray} strokeDashoffset={line.strokeDashoffset} />
  </g>;
};

const SignPanel: React.FC = () => {
  const frame = useCurrentFrame();
  const stampPop = spring({frame: Math.max(0, frame - 320), fps: FPS, config: {damping: 14, stiffness: 120, mass: 0.8}, durationInFrames: 14});
  const stampProgress = prog(frame, 320, 8, ease.expoOut);
  const mayaPath = 'M 75 410 C 88 387 91 380 97 405 C 102 428 115 367 124 383 C 132 397 111 419 129 411 C 145 402 151 386 160 397 C 170 409 176 385 185 392 C 196 400 203 415 217 405 C 230 396 239 393 255 402';
  const devPath = 'M 450 410 C 459 396 465 376 472 389 C 480 404 468 427 486 407 C 500 391 502 386 509 398 C 515 411 498 421 516 410 C 534 399 538 383 547 392 C 556 402 563 415 574 403 C 587 389 596 395 606 404 C 620 416 629 397 648 400';
  return <div style={{position: 'absolute', inset: 0, color: C.ivory}}>
    <Label text="SIGNED, NOT FROZEN" color={C.mist} style={{position: 'absolute', left: 40, top: 18, fontSize: 16}} />
    <div style={{...TYPE, position: 'absolute', left: 40, top: 54, color: C.ivory, fontSize: 34, fontWeight: 600}}>The agreement is alive</div>
    <svg width="850" height="470" viewBox="0 0 850 470" style={{position: 'absolute', left: 35, top: 50, overflow: 'visible'}} aria-hidden="true">
      <Signature name="Maya · CEO" color={C.gold2} path={mayaPath} start={296} left={75} />
      <Signature name="Dev · CTO" color="#64B89E" path={devPath} start={306} left={450} />
    </svg>
    {frame >= 320 && <div style={{position: 'absolute', left: 714, top: 444, width: 120, height: 120, border: `2px solid ${C.gold2}`, borderRadius: '50%',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: C.gold2,
      background: 'rgba(200,169,106,.08)', transform: `rotate(-8deg) scale(${0.58 + 0.42 * stampPop})`, opacity: stampProgress,
      boxShadow: '0 0 32px rgba(200,169,106,.22)'}}>
      <span style={{...TYPE, fontSize: 14, fontWeight: 600, letterSpacing: '0.1em'}}>LIVING</span>
      <span style={{...TYPE, fontSize: 18, fontWeight: 600}}>AGREEMENT</span>
      <span style={{...TYPE, fontSize: 13, letterSpacing: '0.12em'}}>V1.0</span>
    </div>}
  </div>;
};

const PanelWindow: React.FC<{frame: number}> = ({frame}) => {
  let content: React.ReactNode;
  if (frame < 196) content = <RolesPanel />;
  else if (frame < 270) content = <PanelSwap at={196} dur={18} dir="left" outChildren={<RolesPanel />} inChildren={<EquityPanel />} />;
  else if (frame < 296) content = <PanelSwap at={270} dur={18} dir="left" outChildren={<EquityPanel />} inChildren={<VestingPanel />} />;
  else if (frame < 326) content = <PanelSwap at={296} dur={18} dir="left" outChildren={<VestingPanel />} inChildren={<SignPanel />} />;
  else content = <SignPanel />;
  return <div style={{position: 'absolute', left: 0, top: 154, width: 940, height: 565, overflow: 'hidden'}}>{content}</div>;
};

export const S2Agreement: React.FC = () => {
  const frame = useCurrentFrame(), cardAmbient = useAmbient('s2-agreement-card', 6);
  const ghostOpacity = 0.07 * prog(frame, 118, 18, ease.expoOut);
  const activeTabX = frame < 196 ? 40 : frame < 270 ? 40 + 120 * prog(frame, 196, 14, ease.expoOut) : 160 + 120 * prog(frame, 270, 14, ease.expoOut);
  const sweepFrame = frame % 120, sweepP = prog(sweepFrame, 0, 22, ease.inOut);
  const sweepOpacity = sweepFrame <= 22 ? Math.sin(sweepP * Math.PI) * 0.13 : 0;
  const stampChipVisible = frame >= 320;

  return <>
    <Backdrop theme="ink" ghost="SYNC" ghostOpacity={ghostOpacity} ghostSize={500} ghostY={540} />

    <Move from={{x: POS.logoMark.x, y: POS.logoMark.y, s: 1}} to={{x: POS.logoMark.x, y: POS.logoMark.y, s: 1}} start={0} dur={1}
      exit={{start: 118, dur: 30, to: {x: POS.badgeMark.x, y: POS.badgeMark.y, s: 64 / 220}, ease: ease.inOut}} origin="0 0" style={{position: 'absolute', left: 0, top: 0}}>
      <div style={{position: 'absolute', left: 0, top: 0, transform: 'translate(-50%,-50%)'}}><LogoMark size={220} theme="dark" start={6} glow /></div>
    </Move>
    <Move from={{x: POS.logoWord.x, y: POS.logoWord.y, s: 1}} to={{x: POS.logoWord.x, y: POS.logoWord.y, s: 1}} start={0} dur={1}
      exit={{start: 118, dur: 30, to: {x: POS.badgeWord.x, y: POS.badgeWord.y, s: 34 / 124}, ease: ease.inOut}} origin="0 0" style={{position: 'absolute', left: 0, top: 0}}>
      <div style={{position: 'absolute', left: 0, top: 0, transform: 'translate(-50%,-50%)'}}><BrandWordmark size={124} start={6} /></div>
    </Move>
    <KText text="*Where handshakes become agreements.*" start={58} step={4} dur={22} x={POS.logoTagline.x} y={POS.logoTagline.y}
      size={40} weight={400} color={BODY} accent={BODY} mode="blur" exit={{at: 118, dur: 14, dir: 'fade'}} />

    <KText text="Say it once." start={128} step={5} dur={22} x={120} y={400} align="left" size={96} weight={500} color={C.ivory} mode="rise" />
    <KText text="Keep it *alive.*" start={140} step={5} dur={22} x={120} y={510} align="left" size={96} weight={500} color={C.ivory} mode="rise" />
    <KText text="Roles, equity, vesting\nand exit. Signed once,\ntracked forever." start={172} step={4} dur={18} x={120} y={650}
      align="left" size={32} weight={400} color={BODY} mode="blur" maxWidth={620} />

    <Move from={{y: 140, o: 0}} to={{y: 0, o: 1}} start={126} dur={26} ease={ease.expoOut}
      style={{position: 'absolute', left: POS.card.x, top: POS.card.y}}>
      <Card x={0} y={0} w={POS.card.w} h={POS.card.h} theme="dark" radius={28}
        style={{transform: `translate3d(${cardAmbient.x}px,${cardAmbient.y}px,0) scale(${cardAmbient.s})`}}>
        <Move from={{y: 12, o: 0}} to={{y: 0, o: 1}} start={132} dur={18} ease={ease.expoOut}
          style={{position: 'absolute', left: 38, top: 24}}>
          <div style={{...TYPE, color: C.ivory, fontSize: 34, fontWeight: 600, whiteSpace: 'nowrap'}}>Cofounder Agreement</div>
        </Move>
        <Move from={{y: 10, o: 0}} to={{y: 0, o: 1}} start={136} dur={16} ease={ease.expoOut}
          style={{position: 'absolute', left: 665, top: 27}}>
          <div style={{position: 'absolute', left: 0, top: 0}}><Avatar name="Maya" tone="champagne" size={44} /></div>
          <div style={{position: 'absolute', left: 34, top: 0}}><Avatar name="Dev" tone="emerald" size={44} /></div>
          {!stampChipVisible ? <Chip label="Draft v0.9" tone="mist" style={{position: 'absolute', left: 92, top: 5, fontSize: 16, padding: '8px 11px'}} /> : null}
        </Move>
        {stampChipVisible && <Move from={{s: 0.75, o: 0, y: -8}} to={{s: 1, o: 1, y: 0}} start={320} dur={16} ease={ease.backOut}
          style={{position: 'absolute', left: 794, top: 31}}><Chip label="Living v1.0" tone="emerald" style={{fontSize: 16, padding: '8px 11px'}} /></Move>}

    <Move from={{y: 8, o: 0}} to={{y: 0, o: 1}} start={136} dur={18} ease={ease.expoOut}
      style={{position: 'absolute', left: 38, top: 105}}>
          {(['Roles', 'Equity', 'Vesting', 'Exit', 'IP'] as const).map((tab, index) => {
            const left = [40, 160, 280, 400, 510][index];
            return <span key={tab} style={{...TYPE, position: 'absolute', left, top: 0, color: C.ivory, opacity: frame >= 196 && index === 0 ? 0.62 : 0.94,
              fontSize: 22, fontWeight: 600, whiteSpace: 'nowrap'}}>{tab}</span>;
          })}
          <div style={{position: 'absolute', left: activeTabX, top: 42, width: 78, height: 3, borderRadius: 3, background: C.champagne,
            boxShadow: '0 0 12px rgba(200,169,106,.34)'}} />
        </Move>

        <Move from={{y: 12, o: 0}} to={{y: 0, o: 1}} start={140} dur={18} ease={ease.expoOut}
          style={{position: 'absolute', left: 0, top: 0}}><PanelWindow frame={frame} /></Move>
        {frame >= 328 && <Move from={{x: 34, o: 0}} to={{x: 0, o: 1}} start={328} dur={16} ease={ease.expoOut}
          style={{position: 'absolute', left: 30, top: 684}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 15, whiteSpace: 'nowrap'}}>
            <span style={{...TYPE, color: C.gold2, fontSize: 18, fontWeight: 600}}>v1.0</span>
            <span style={{...TYPE, color: BODY, fontSize: 18}}>Signed by Maya and Dev</span>
            <span style={{...TYPE, color: C.mist, fontSize: 17}}>Today</span>
            <Chip label="Next review in 90 days" tone="champagne" style={{fontSize: 15, padding: '7px 10px'}} />
          </div>
        </Move>}
        {sweepOpacity > 0 && <div aria-hidden="true" style={{position: 'absolute', zIndex: 4, left: -500 + sweepP * 1900, top: 0, width: 340, height: '100%',
          transform: 'skewX(-18deg)', opacity: sweepOpacity, background: 'linear-gradient(90deg,transparent,rgba(232,211,162,.28),transparent)', pointerEvents: 'none'}} />}
      </Card>
    </Move>

    <Cursor name="Maya" color={C.champagne} keys={[
      {f: 150, ...POS.mayaStart}, {f: 188, ...POS.tabs.equity}, {f: 196, ...POS.tabs.equity, click: true},
      {f: 206, ...POS.sliderStart, grab: true}, {f: 234, ...POS.sliderOver, grab: true}, {f: 236, ...POS.sliderEnd, grab: false},
      {f: 296, ...POS.mayaSign}, {f: 320, ...POS.cursorAwayMaya}, {f: 328, ...POS.cursorAwayMaya},
    ]} />
    <Cursor name="Dev" color={C.emerald} keys={[
      {f: 236, ...POS.devStart}, {f: 252, ...POS.accept}, {f: 258, ...POS.accept}, {f: 262, ...POS.accept, click: true},
      {f: 268, ...POS.tabs.vesting, click: true}, {f: 296, ...POS.devSign}, {f: 318, ...POS.cursorAwayDev}, {f: 328, ...POS.cursorAwayDev},
    ]} />
  </>;
};
