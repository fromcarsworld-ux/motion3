// src/scenes/S3_Signals.tsx
import {useId} from 'react';
import {useCurrentFrame} from 'remotion';
import type * as React from 'react';
import {
  Backdrop, C, Card, Chip, Counter, Cursor, KText, Label, Move, Ring, Spark, Tick,
  clamp01, ease, prog, press, useAmbient,
} from '../lib/kit';
import {PanelSwap} from '../lib/Transitions';

const POS = {
  hero: {x: 120, y: 176}, subtitle: {x: 120, y: 282},
  signalOne: {x: 120, y: 326}, signalTwo: {x: 674, y: 326}, signalThree: {x: 1228, y: 326},
  detail: {x: 100, y: 484, w: 1720, h: 510}, panel: {x: 35, y: 88, w: 1650, h: 400},
  detectorCell: {x: 466, y: 774}, fairnessRadar: {x: 322, y: 760}, fairButton: {x: 1280, y: 829},
  conflictButton: {x: 1385, y: 868}, cursorStart: {x: 1780, y: 970}, cursorAwayMaya: {x: 1780, y: 945},
  cursorAwayDev: {x: 1840, y: 950},
} as const;

const BODY = '#CFC8B8';
const TYPE: React.CSSProperties = {
  fontFamily: 'Lora', fontVariantNumeric: 'lining-nums tabular-nums', textRendering: 'geometricPrecision',
  fontKerning: 'normal', WebkitFontSmoothing: 'antialiased',
};
const SAFE_ID = (id: string): string => id.replace(/:/g, '').replace(/[^a-zA-Z0-9_-]/g, '');
const FORECAST_POINTS: number[] = [14, 16, 15, 19, 20, 22, 23, 22, 26, 29, 31, 32, 38, 41, 40, 47, 52, 55, 59, 57, 66, 72, 75, 82];
const QUIET_POINTS: number[] = [76, 74, 78, 71, 70, 73, 68, 64, 63, 58, 55, 50, 47, 43, 39, 32, 30, 26, 21, 20, 17, 12, 9, 7];
const LEVEL_COLORS = ['rgba(255,255,255,.055)', 'rgba(31,138,112,.27)', 'rgba(31,138,112,.45)', 'rgba(31,138,112,.68)', 'rgba(89,190,155,.92)'] as const;
const SIGNAL_TONES = ['ember', 'champagne', 'emerald'] as const;

const activityAt = (week: number, day: number, weeks: number): number => {
  const raw = (week * 11 + day * 7 + week * day * 3) % 5;
  const age = week / Math.max(1, weeks - 1);
  const decay = age < 0.56 ? 0 : age < 0.72 ? 1 : age < 0.87 ? 2 : 3;
  return Math.max(0, raw - decay);
};

type HeatGridProps = {weeks: number; rows: number; cell: number; gap: number; frame: number; style?: React.CSSProperties};
const HeatGrid: React.FC<HeatGridProps> = ({weeks, rows, cell, gap, frame, style}) => (
  <div aria-hidden="true" style={{display: 'grid', gridAutoFlow: 'column', gridTemplateRows: `repeat(${rows}, ${cell}px)`,
    gridTemplateColumns: `repeat(${weeks}, ${cell}px)`, gap, ...style}}>
    {Array.from({length: weeks * rows}, (_, index) => {
      const week = Math.floor(index / rows), day = index % rows, level = activityAt(week, day, weeks);
      const shimmer = 0.86 + 0.14 * Math.sin((frame + week * 5 + day * 7) * Math.PI / 43);
      return <div key={`${week}-${day}`} style={{width: cell, height: cell, borderRadius: Math.max(3, cell * 0.24),
        background: LEVEL_COLORS[level], opacity: shimmer, boxShadow: level > 2 ? `0 0 ${cell * 0.45}px rgba(31,138,112,.18)` : undefined}} />;
    })}
  </div>
);

type RadarPlotProps = {size: number; frame: number; balance: number; compact?: boolean; style?: React.CSSProperties};
const RadarPlot: React.FC<RadarPlotProps> = ({size, frame, balance, compact = false, style}) => {
  const center = size / 2, radius = size * (compact ? 0.34 : 0.31), labelRadius = size * 0.43;
  const labels = ['LOAD', 'VOICE', 'OWNERSHIP', 'CREDIT', 'FOCUS'] as const;
  const angles = labels.map((_, index) => (-90 + index * 72) * Math.PI / 180);
  const currentMaya = [0.88, 0.54, 0.68, 0.42, 0.76];
  const currentDev = [0.46, 0.82, 0.60, 0.78, 0.52];
  const balancedMaya = [0.66, 0.67, 0.69, 0.65, 0.68];
  const balancedDev = [0.65, 0.66, 0.67, 0.68, 0.66];
  const mix = (from: number[], to: number[]) => from.map((value, index) => value + (to[index] - value) * clamp01(balance));
  const toPoints = (values: number[], scale: number) => values.map((value, index) => {
    const r = radius * value * scale, x = center + Math.cos(angles[index]) * r, y = center + Math.sin(angles[index]) * r;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const maya = mix(currentMaya, balancedMaya), dev = mix(currentDev, balancedDev);
  return <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{display: 'block', overflow: 'visible', ...style}} aria-hidden="true">
    {[0.25, 0.5, 0.75, 1].map((level) => <polygon key={level} points={toPoints([1, 1, 1, 1, 1], level)} fill="none"
      stroke="rgba(255,255,255,.13)" strokeWidth={compact ? 0.8 : 1} />)}
    {angles.map((angle, index) => <line key={index} x1={center} y1={center} x2={center + Math.cos(angle) * radius} y2={center + Math.sin(angle) * radius}
      stroke="rgba(255,255,255,.14)" strokeWidth={compact ? 0.8 : 1} />)}
    <polygon points={toPoints(dev, 1)} fill="rgba(31,138,112,.19)" stroke="#58B89A" strokeWidth={compact ? 1.4 : 2.2} />
    <polygon points={toPoints(maya, 1)} fill="rgba(200,169,106,.19)" stroke={C.gold2} strokeWidth={compact ? 1.4 : 2.2} />
    {angles.map((angle, index) => <circle key={`dot-${index}`} cx={center + Math.cos(angle) * radius * maya[index]}
      cy={center + Math.sin(angle) * radius * maya[index]} r={compact ? 2.4 : 3.8} fill={C.gold2} />)}
    {!compact && labels.map((label, index) => {
      const x = center + Math.cos(angles[index]) * labelRadius, y = center + Math.sin(angles[index]) * labelRadius;
      const anchor: 'start' | 'middle' | 'end' = x < center - 7 ? 'end' : x > center + 7 ? 'start' : 'middle';
      return <text key={label} x={x} y={y} textAnchor={anchor} dominantBaseline="middle" fill={C.mist} fontFamily="Lora" fontSize="12" letterSpacing="1.2">{label}</text>;
    })}
    <circle cx={center} cy={center} r={compact ? 3 : 4} fill={C.ivory} opacity={0.78 + 0.16 * Math.sin(frame * Math.PI / 24)} />
  </svg>;
};

type SignalKind = 'quiet' | 'fairness' | 'forecast';
type SignalTileProps = {left: number; index: number; tag: string; title: string; description: string; metric: string; tone: typeof SIGNAL_TONES[number]; kind: SignalKind; active: boolean; frame: number};
const SignalTile: React.FC<SignalTileProps> = ({left, index, tag, title, description, metric, tone, kind, active, frame}) => {
  const p = 0.55 + 0.18 * Math.sin((frame + index * 13) * Math.PI / 31);
  return <Move from={{y: 20, o: 0}} to={{y: 0, o: 1}} start={10 + index * 5} dur={18} ease={ease.expoOut}
    style={{position: 'absolute', left, top: 0}}>
    <div style={{position: 'relative', width: 536, height: 126, boxSizing: 'border-box', borderRadius: 22,
      border: `1px solid ${active ? `${tone === 'ember' ? C.ember : tone === 'emerald' ? C.emerald : C.gold2}88` : 'rgba(255,255,255,.11)'}`,
      background: active ? 'linear-gradient(138deg,rgba(255,255,255,.085),rgba(255,255,255,.025))' : 'rgba(255,255,255,.027)',
      boxShadow: active ? `0 12px 38px rgba(0,0,0,.18),0 0 28px ${tone === 'ember' ? 'rgba(228,87,46,.08)' : tone === 'emerald' ? 'rgba(31,138,112,.10)' : 'rgba(200,169,106,.08)'}` : '0 10px 28px rgba(0,0,0,.12)',
      padding: '17px 22px'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <Label text={`0${index + 1}  /  ${tag}`} color={tone === 'ember' ? '#F08A6D' : tone === 'emerald' ? '#74C9AE' : C.gold2} style={{fontSize: 13, letterSpacing: '0.17em'}} />
        <Chip label={metric} tone={tone} style={{fontSize: 13, padding: '6px 10px'}} />
      </div>
      <div style={{...TYPE, position: 'absolute', left: 22, top: 50, color: C.ivory, fontSize: 23, fontWeight: 600, whiteSpace: 'nowrap'}}>{title}</div>
      <div style={{...TYPE, position: 'absolute', left: 22, top: 82, color: BODY, fontSize: 16, whiteSpace: 'nowrap'}}>{description}</div>
      <div style={{position: 'absolute', left: 22, right: 22, bottom: 13, height: 2, borderRadius: 2, overflow: 'hidden', background: 'rgba(255,255,255,.08)'}}>
        <div style={{width: `${kind === 'quiet' ? 70 : kind === 'fairness' ? 54 : 82}%`, height: '100%', background: tone === 'ember' ? C.ember : tone === 'emerald' ? C.emerald : C.gold2, opacity: active ? p : 0.32}} />
      </div>
    </div>
  </Move>;
};

type OverviewTileProps = {left: number; kind: SignalKind; frame: number};
const OverviewTile: React.FC<OverviewTileProps> = ({left, kind, frame}) => {
  const quiet = kind === 'quiet', fairness = kind === 'fairness';
  const title = quiet ? 'Silent Founder Detector' : fairness ? 'Fairness radar' : 'Conflict forecast';
  const caption = quiet ? 'A check-in rhythm has dropped.' : fairness ? 'Effort and recognition are drifting.' : 'Tension is rising across decisions.';
  return <div style={{position: 'absolute', left, top: 60, width: 520, height: 275, borderRadius: 22, border: '1px solid rgba(255,255,255,.10)',
    background: 'linear-gradient(135deg,rgba(255,255,255,.055),rgba(255,255,255,.018))', overflow: 'hidden'}}>
    <div style={{...TYPE, position: 'absolute', left: 24, top: 18, color: C.ivory, fontSize: 22, fontWeight: 600, whiteSpace: 'nowrap'}}>{title}</div>
    <div style={{...TYPE, position: 'absolute', left: 24, top: 51, color: BODY, fontSize: 16, whiteSpace: 'nowrap'}}>{caption}</div>
    {quiet && <>
      <HeatGrid weeks={9} rows={5} cell={11} gap={4} frame={frame} style={{position: 'absolute', left: 25, top: 113}} />
      <div style={{...TYPE, position: 'absolute', left: 244, top: 108, color: C.ember, fontSize: 38, fontWeight: 600}}>9d</div>
      <Label text="QUIET" color={C.mist} style={{position: 'absolute', left: 247, top: 155, fontSize: 12, letterSpacing: '0.16em'}} />
      <Chip label="pattern detected" tone="ember" style={{position: 'absolute', left: 244, top: 194, fontSize: 13, padding: '7px 10px'}} />
    </>}
    {fairness && <>
      <RadarPlot size={154} frame={frame} balance={0.15} compact style={{position: 'absolute', left: 18, top: 91}} />
      <div style={{...TYPE, position: 'absolute', left: 210, top: 111, color: C.gold2, fontSize: 36, fontWeight: 600}}>31<span style={{fontSize: 17, color: C.mist}}> pt gap</span></div>
      <div style={{...TYPE, position: 'absolute', left: 212, top: 157, color: BODY, fontSize: 16}}>Load / credit mismatch</div>
      <Chip label="review balance" tone="champagne" style={{position: 'absolute', left: 210, top: 194, fontSize: 13, padding: '7px 10px'}} />
    </>}
    {!quiet && !fairness && <>
      <Spark w={230} h={94} points={FORECAST_POINTS} progress={prog(frame, 16, 30, ease.expoOut)} color={C.ember} style={{position: 'absolute', left: 23, top: 104}} />
      <div style={{...TYPE, position: 'absolute', left: 284, top: 108, color: C.ember, fontSize: 36, fontWeight: 600}}>82%</div>
      <Label text="FORECAST" color={C.mist} style={{position: 'absolute', left: 288, top: 153, fontSize: 12, letterSpacing: '0.16em'}} />
      <Chip label="12 days ahead" tone="mist" style={{position: 'absolute', left: 282, top: 194, fontSize: 13, padding: '7px 10px'}} />
    </>}
  </div>;
};

const SignalOverview: React.FC = () => {
  const frame = useCurrentFrame(), pulse = 0.55 + 0.16 * Math.sin(frame * Math.PI / 26);
  return <div style={{position: 'absolute', inset: 0, color: C.ivory}}>
    <Label text="LIVE SIGNAL FIELD" color={C.mist} style={{position: 'absolute', left: 28, top: 16, fontSize: 14, letterSpacing: '0.18em'}} />
    <Chip label="3 signals connected" tone="emerald" style={{position: 'absolute', right: 28, top: 7, fontSize: 13, padding: '7px 11px', opacity: pulse}} />
    <OverviewTile left={0} kind="quiet" frame={frame} />
    <OverviewTile left={556} kind="fairness" frame={frame} />
    <OverviewTile left={1112} kind="forecast" frame={frame} />
    <div style={{...TYPE, position: 'absolute', left: 28, top: 354, color: BODY, fontSize: 16, whiteSpace: 'nowrap'}}>
      A pattern is a prompt to ask—not a verdict to assign.
    </div>
    <div style={{position: 'absolute', left: 945, top: 363, width: 650, height: 1, background: 'linear-gradient(90deg,transparent,rgba(200,169,106,.34),transparent)'}} />
  </div>;
};

const DetectorPanel: React.FC = () => {
  const frame = useCurrentFrame(), scoreP = prog(frame, 91, 27, ease.expoOut);
  const frequencyP = prog(frame, 96, 35, ease.expoOut);
  return <div style={{position: 'absolute', inset: 0, color: C.ivory}}>
    <div style={{position: 'absolute', left: 18, top: 13, width: 566, height: 365, borderRadius: 20, border: '1px solid rgba(255,255,255,.09)', background: 'rgba(255,255,255,.025)'}} />
    <Label text="CHECK-IN RHYTHM · LAST 13 WEEKS" color={C.mist} style={{position: 'absolute', left: 40, top: 28, fontSize: 13, letterSpacing: '0.16em'}} />
    <div style={{...TYPE, position: 'absolute', left: 40, top: 55, color: C.ivory, fontSize: 24, fontWeight: 600}}>One founder has gone quiet</div>
    <div style={{position: 'absolute', left: 70, top: 111, width: 330, height: 182, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 14, background: 'rgba(11,12,14,.22)'}}>
      <HeatGrid weeks={13} rows={7} cell={18} gap={6} frame={frame} />
    </div>
    <div style={{...TYPE, position: 'absolute', left: 70, top: 301, color: C.mist, fontSize: 14}}>13 weeks ago</div>
    <div style={{...TYPE, position: 'absolute', left: 327, top: 301, color: C.mist, fontSize: 14}}>this week</div>
    <Chip label="9 days without a check-in" tone="ember" style={{position: 'absolute', left: 40, top: 329, fontSize: 14, padding: '8px 12px'}} />
    <div style={{position: 'absolute', left: 610, top: 29, width: 1, height: 322, background: 'linear-gradient(180deg,transparent,rgba(255,255,255,.14),transparent)'}} />

    <Ring size={132} stroke={11} value={0.78 * scoreP} color={C.ember} track="rgba(255,255,255,.10)" style={{position: 'absolute', left: 662, top: 59}} />
    <div style={{...TYPE, position: 'absolute', left: 662, top: 94, width: 132, textAlign: 'center', color: C.ivory, fontSize: 36, fontWeight: 600, lineHeight: 1}}>
      <Counter from={0} to={78} start={91} dur={27} suffix="%" />
    </div>
    <Label text="SILENCE RISK" color={C.mist} style={{position: 'absolute', left: 835, top: 57, fontSize: 13, letterSpacing: '0.18em'}} />
    <div style={{...TYPE, position: 'absolute', left: 835, top: 84, color: '#F08A6D', fontSize: 32, fontWeight: 600, whiteSpace: 'nowrap'}}>Elevated, not assumed</div>
    <div style={{...TYPE, position: 'absolute', left: 835, top: 129, color: BODY, fontSize: 18, whiteSpace: 'nowrap'}}>Dev's check-ins fell 74% over three weeks.</div>
    <div style={{...TYPE, position: 'absolute', left: 835, top: 159, color: BODY, fontSize: 18, whiteSpace: 'nowrap'}}>Ask what changed before deciding why.</div>
    <Label text="CHECK-IN FREQUENCY" color={C.mist} style={{position: 'absolute', left: 835, top: 210, fontSize: 12, letterSpacing: '0.16em'}} />
    <div style={{position: 'absolute', left: 835, top: 229, width: 690, height: 1, background: 'rgba(255,255,255,.10)'}} />
    <Spark w={680} h={76} points={QUIET_POINTS} progress={frequencyP} color={C.ember} style={{position: 'absolute', left: 835, top: 225}} />
    <div style={{...TYPE, position: 'absolute', left: 835, top: 309, color: C.mist, fontSize: 14, whiteSpace: 'nowrap'}}>A pattern to notice, not a verdict to deliver.</div>
  </div>;
};

type MeterProps = {left: number; top: number; width: number; height: number; value: number; previousValue: number; color: string};
const Meter: React.FC<MeterProps> = ({left, top, width, height, value, previousValue, color}) => {
  const id = SAFE_ID(useId()), blur = Math.min(32, Math.abs(value - previousValue) * width / 100 * 0.9);
  return <>
    <svg aria-hidden="true" width="0" height="0" style={{position: 'absolute', overflow: 'hidden'}}><defs>
      <filter id={`${id}-bar-motion`} x="-100%" y="-150%" width="300%" height="400%"><feGaussianBlur stdDeviation={`${blur.toFixed(2)} 0`} /></filter>
    </defs></svg>
    <div style={{position: 'absolute', left, top, width, height, overflow: 'hidden', borderRadius: height / 2, background: 'rgba(255,255,255,.09)'}}>
      <div style={{position: 'absolute', inset: '0 auto 0 0', width: `${width * clamp01(value / 100)}px`, borderRadius: height / 2,
        background: color, boxShadow: `0 0 14px ${color}44`, filter: blur >= 0.35 ? `url(#${id}-bar-motion)` : undefined}} />
    </div>
  </>;
};

type PressButtonProps = {label: string; clickAt: number; style?: React.CSSProperties; tone?: 'champagne' | 'emerald'};
const PressButton: React.FC<PressButtonProps> = ({label, clickAt, style, tone = 'champagne'}) => {
  const frame = useCurrentFrame(), id = SAFE_ID(useId()), pulse = press(frame, clickAt, 16);
  const scaleAt = (at: number) => 1 - 0.035 * press(at, clickAt, 16), blur = Math.min(24, Math.abs(scaleAt(frame) - scaleAt(frame - 1)) * 60);
  const accent = tone === 'emerald' ? C.emerald : C.champagne;
  return <>
    <svg aria-hidden="true" width="0" height="0" style={{position: 'absolute', overflow: 'hidden'}}><defs>
      <filter id={`${id}-click-motion`} x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation={`${blur.toFixed(2)} ${blur.toFixed(2)}`} /></filter>
    </defs></svg>
    <div role="button" aria-label={label} style={{...TYPE, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: 999, boxSizing: 'border-box', border: `1px solid ${C.gold2}`, background: `linear-gradient(135deg,${accent}88,${accent}3D)`,
      color: C.ivory, fontSize: 18, fontWeight: 600, whiteSpace: 'nowrap', transform: `scale(${scaleAt(frame)})`,
      boxShadow: `0 0 ${12 + 26 * pulse}px rgba(200,169,106,${0.12 + 0.4 * pulse})`, filter: blur >= 0.35 ? `url(#${id}-click-motion)` : undefined, ...style}}>{label}</div>
  </>;
};

const FairnessPanel: React.FC = () => {
  const frame = useCurrentFrame(), rebalance = prog(frame, 267, 28, ease.inOut);
  const mayaLoad = 68 - 16 * rebalance, mayaCredit = 46 + 4 * rebalance;
  const previousLoad = 68 - 16 * prog(frame - 1, 267, 28, ease.inOut), previousCredit = 46 + 4 * prog(frame - 1, 267, 28, ease.inOut);
  const gap = 22 - 20 * rebalance;
  return <div style={{position: 'absolute', inset: 0, color: C.ivory}}>
    <RadarPlot size={350} frame={frame} balance={rebalance} style={{position: 'absolute', left: 12, top: 13}} />
    <div style={{position: 'absolute', left: 388, top: 24, width: 1, height: 324, background: 'linear-gradient(180deg,transparent,rgba(255,255,255,.14),transparent)'}} />
    <Label text="TEAM ALIGNMENT SCORE" color={C.mist} style={{position: 'absolute', left: 430, top: 24, fontSize: 13, letterSpacing: '0.17em'}} />
    <div style={{...TYPE, position: 'absolute', left: 430, top: 55, color: C.ivory, fontSize: 58, fontWeight: 600, lineHeight: 1}}>
      <Counter from={61} to={88} start={267} dur={28} />
      <span style={{color: C.mist, fontSize: 18, marginLeft: 10}}>/ 100</span>
    </div>
    <div style={{...TYPE, position: 'absolute', left: 430, top: 122, color: BODY, fontSize: 17, whiteSpace: 'nowrap'}}>Load and recognition are {Math.round(gap)} points apart.</div>
    <Label text="MAYA · EFFORT / CREDIT" color={C.mist} style={{position: 'absolute', left: 430, top: 176, fontSize: 11, letterSpacing: '0.14em'}} />
    <Meter left={430} top={198} width={424} height={8} value={mayaLoad} previousValue={previousLoad} color={C.champagne} />
    <div style={{...TYPE, position: 'absolute', left: 430, top: 213, color: BODY, fontSize: 14}}>Load <Counter from={68} to={52} start={267} dur={28} suffix="%" /></div>
    <Meter left={430} top={245} width={424} height={8} value={mayaCredit} previousValue={previousCredit} color="#74C9AE" />
    <div style={{...TYPE, position: 'absolute', left: 430, top: 260, color: BODY, fontSize: 14}}>Credit <Counter from={46} to={50} start={267} dur={28} suffix="%" /></div>
    <Chip label={frame >= 295 ? 'balance updated' : 'weekly rebalance suggested'} tone={frame >= 295 ? 'emerald' : 'champagne'}
      style={{position: 'absolute', left: 430, top: 300, fontSize: 13, padding: '7px 10px'}} />

    <div style={{position: 'absolute', left: 910, top: 24, width: 1, height: 324, background: 'linear-gradient(180deg,transparent,rgba(255,255,255,.14),transparent)'}} />
    <Label text="THE FAIRNESS GAP" color={C.mist} style={{position: 'absolute', left: 958, top: 37, fontSize: 13, letterSpacing: '0.17em'}} />
    <div style={{...TYPE, position: 'absolute', left: 958, top: 68, color: C.gold2, fontSize: 46, fontWeight: 600, lineHeight: 1}}>
      <Counter from={22} to={2} start={267} dur={28} suffix=" pts" />
    </div>
    <div style={{...TYPE, position: 'absolute', left: 958, top: 126, width: 260, color: BODY, fontSize: 16, lineHeight: 1.35}}>Bring the week back into view for both founders.</div>
    <PressButton label={frame >= 295 ? 'Rebalanced this week' : 'Rebalance this week'} clickAt={267} tone="emerald"
      style={{left: 958, top: 228, width: 375, height: 58}} />
    <div style={{...TYPE, position: 'absolute', left: 958, top: 310, color: C.mist, fontSize: 13, whiteSpace: 'nowrap'}}>A shared reset. No blame attached.</div>
  </div>;
};

type PlaybookStepProps = {number: string; label: string; detail: string; start: number; frame: number; left: number; top: number};
const PlaybookStep: React.FC<PlaybookStepProps> = ({number, label, detail, start, frame, left, top}) => (
  <Move from={{x: 18, o: 0}} to={{x: 0, o: 1}} start={start} dur={16} ease={ease.expoOut} style={{position: 'absolute', left, top}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: 570, height: 54, borderRadius: 15, background: 'rgba(255,255,255,.035)', border: '1px solid rgba(255,255,255,.07)'}}>
      <div style={{...TYPE, position: 'absolute', left: 17, top: 15, color: C.gold2, fontSize: 16, fontWeight: 600}}>{number}</div>
      <div style={{position: 'absolute', left: 50, top: 15, width: 22, height: 22, borderRadius: '50%', border: '1px solid rgba(116,201,174,.54)', background: 'rgba(31,138,112,.16)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Tick progress={prog(frame, start, 12, ease.expoOut)} size={17} color="#74C9AE" />
      </div>
      <div style={{...TYPE, position: 'absolute', left: 86, top: 8, color: C.ivory, fontSize: 16, fontWeight: 600, whiteSpace: 'nowrap'}}>{label}</div>
      <div style={{...TYPE, position: 'absolute', left: 86, top: 30, color: BODY, fontSize: 13, whiteSpace: 'nowrap'}}>{detail}</div>
    </div>
  </Move>
);

const ConflictPanel: React.FC = () => {
  const frame = useCurrentFrame(), riskP = prog(frame, 329, 22, ease.expoOut), sparkP = prog(frame, 328, 30, ease.expoOut);
  const forecastValue = 46 + 36 * riskP, previousForecast = 46 + 36 * prog(frame - 1, 329, 22, ease.expoOut);
  const markerPulse = 0.68 + 0.32 * Math.sin(frame * Math.PI / 12);
  return <div style={{position: 'absolute', inset: 0, color: C.ivory}}>
    <div style={{position: 'absolute', left: 18, top: 14, width: 650, height: 365, borderRadius: 20, border: '1px solid rgba(255,255,255,.09)', background: 'rgba(255,255,255,.025)'}} />
    <Label text="30-DAY TENSION OUTLOOK" color={C.mist} style={{position: 'absolute', left: 42, top: 29, fontSize: 13, letterSpacing: '0.16em'}} />
    <div style={{...TYPE, position: 'absolute', left: 42, top: 56, color: C.ivory, fontSize: 23, fontWeight: 600}}>A hard conversation is getting closer</div>
    <svg width="600" height="194" viewBox="0 0 600 194" style={{position: 'absolute', left: 40, top: 105, overflow: 'visible'}} aria-hidden="true">
      {[0, 1, 2, 3].map((row) => <line key={row} x1="0" y1={18 + row * 48} x2="590" y2={18 + row * 48} stroke="rgba(255,255,255,.09)" strokeWidth="1" />)}
      <line x1="0" y1="162" x2="590" y2="162" stroke="rgba(228,87,46,.3)" strokeWidth="1" strokeDasharray="5 6" />
    </svg>
    <Spark w={590} h={190} points={FORECAST_POINTS} progress={sparkP} color={C.ember} style={{position: 'absolute', left: 42, top: 106}} />
    <Move from={{x: 0, y: 157}} to={{x: 577, y: 28}} start={328} dur={30} ease={ease.inOut} style={{position: 'absolute', left: 42, top: 106}}>
      <div style={{width: 14, height: 14, borderRadius: '50%', background: '#F08A6D', opacity: markerPulse, boxShadow: '0 0 0 6px rgba(228,87,46,.12),0 0 23px rgba(228,87,46,.75)'}} />
    </Move>
    <div style={{...TYPE, position: 'absolute', left: 42, top: 315, color: C.mist, fontSize: 13}}>TODAY</div>
    <div style={{...TYPE, position: 'absolute', left: 540, top: 315, color: C.mist, fontSize: 13}}>DAY 30</div>
    <div style={{...TYPE, position: 'absolute', left: 42, top: 345, color: BODY, fontSize: 13, whiteSpace: 'nowrap'}}>Forecast blends response time, workload, and unresolved decisions.</div>

    <div style={{position: 'absolute', left: 690, top: 30, width: 1, height: 320, background: 'linear-gradient(180deg,transparent,rgba(255,255,255,.15),transparent)'}} />
    <Ring size={112} stroke={10} value={0.82 * riskP} color={C.ember} track="rgba(255,255,255,.10)" style={{position: 'absolute', left: 710, top: 70}} />
    <div style={{...TYPE, position: 'absolute', left: 710, top: 102, width: 112, textAlign: 'center', color: '#F08A6D', fontSize: 30, fontWeight: 600, lineHeight: 1}}>
      <Counter from={46} to={82} start={329} dur={22} suffix="%" />
    </div>
    <Label text="CONFLICT RISK" color={C.mist} style={{position: 'absolute', left: 842, top: 76, fontSize: 12, letterSpacing: '0.14em'}} />
    <div style={{...TYPE, position: 'absolute', left: 842, top: 103, color: C.ivory, fontSize: 21, fontWeight: 600, whiteSpace: 'nowrap'}}>12 days to intervene</div>
    <div style={{...TYPE, position: 'absolute', left: 842, top: 140, width: 168, color: BODY, fontSize: 14, lineHeight: 1.35}}>A forecast is a chance to choose a better next step.</div>
    <div style={{...TYPE, position: 'absolute', left: 710, top: 224, color: C.mist, fontSize: 13, letterSpacing: '0.1em'}}>CONFIDENCE</div>
    <div style={{...TYPE, position: 'absolute', left: 842, top: 220, color: C.gold2, fontSize: 17, fontWeight: 600}}><Counter from={58} to={76} start={329} dur={22} suffix="%" /></div>
    <Meter left={710} top={250} width={300} height={4} value={forecastValue} previousValue={previousForecast} color={C.ember} />

    <div style={{position: 'absolute', left: 1020, top: 15, width: 1, height: 364, background: 'linear-gradient(180deg,transparent,rgba(255,255,255,.14),transparent)'}} />
    <Label text="MEDIATION PLAYBOOK" color={C.gold2} style={{position: 'absolute', left: 1040, top: 18, fontSize: 13, letterSpacing: '0.16em'}} />
    <div style={{...TYPE, position: 'absolute', left: 1040, top: 43, color: C.ivory, fontSize: 22, fontWeight: 600}}>A calmer next conversation</div>
    <PlaybookStep number="01" label="Name the moment, without blame" detail="Start with what you noticed." start={334} frame={frame} left={1040} top={82} />
    <PlaybookStep number="02" label="Share impact, not intent" detail="Make room for both perspectives." start={338} frame={frame} left={1040} top={140} />
    <PlaybookStep number="03" label="Agree one repair this week" detail="Set a date to check back in." start={342} frame={frame} left={1040} top={198} />
    <Move from={{y: 10, o: 0}} to={{y: 0, o: 1}} start={350} dur={14} ease={ease.expoOut} style={{position: 'absolute', left: 1040, top: 270}}>
      <PressButton label="Start a 15-minute reset" clickAt={366} tone="emerald" style={{position: 'absolute', left: 0, top: 0, width: 420, height: 52, fontSize: 16}} />
    </Move>
    <div style={{...TYPE, position: 'absolute', left: 1040, top: 338, color: C.mist, fontSize: 13, whiteSpace: 'nowrap'}}>A shared plan gives trust somewhere to land.</div>
  </div>;
};

const SignalWindow: React.FC<{frame: number}> = ({frame}) => {
  let content: React.ReactNode;
  if (frame < 72) content = <SignalOverview />;
  else if (frame < 190) content = <PanelSwap at={72} dur={18} dir="left" outChildren={<SignalOverview />} inChildren={<DetectorPanel />} />;
  else if (frame < 310) content = <PanelSwap at={190} dur={20} dir="left" outChildren={<DetectorPanel />} inChildren={<FairnessPanel />} />;
  else if (frame < 330) content = <PanelSwap at={310} dur={18} dir="left" outChildren={<FairnessPanel />} inChildren={<ConflictPanel />} />;
  else content = <ConflictPanel />;
  return <div style={{position: 'absolute', left: POS.panel.x, top: POS.panel.y, width: POS.panel.w, height: POS.panel.h, overflow: 'hidden'}}>{content}</div>;
};

export const S3Signals: React.FC = () => {
  const frame = useCurrentFrame(), atmosphere = useAmbient('s3-emerald-undertone', 22);
  const stage = frame < 190 ? 0 : frame < 310 ? 1 : 2, pulse = 0.18 + 0.06 * Math.sin(frame * Math.PI / 36);
  const title = stage === 0 ? 'Silent Founder Detector' : stage === 1 ? 'Fairness radar' : 'Conflict forecast';
  const stageLabel = stage === 0 ? 'SIGNAL 01 / 03' : stage === 1 ? 'SIGNAL 02 / 03' : 'SIGNAL 03 / 03';
  const detailAmbient = useAmbient('s3-signal-console', 4);

  return <>
    <Backdrop theme="ink" ghost="SIGNALS" ghostSize={510} ghostY={548} ghostOpacity={0.055 + pulse * 0.1} />
    <div aria-hidden="true" style={{position: 'absolute', left: 1120 + atmosphere.x * 1.7, top: 430 + atmosphere.y * 1.4, width: 940, height: 760,
      borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(31,138,112,.22) 0%,rgba(31,138,112,.08) 42%,transparent 72%)',
      filter: 'blur(70px)', opacity: 0.8, mixBlendMode: 'screen', pointerEvents: 'none'}} />
    <div aria-hidden="true" style={{position: 'absolute', left: 92, top: 72, width: 4, height: 4, borderRadius: '50%', background: C.gold2,
      opacity: 0.35 + pulse, boxShadow: '0 0 20px rgba(232,211,162,.48)'}} />

    <Label text="FOUNDER SYNC   /   TEAM SIGNALS" color={C.mist} style={{position: 'absolute', left: 120, top: 57, fontSize: 15, letterSpacing: '0.2em'}} />
    <Chip label="ALWAYS-ON ALIGNMENT" tone="emerald" style={{position: 'absolute', right: 122, top: 46, fontSize: 13, padding: '8px 12px', opacity: 0.82 + 0.12 * Math.sin(frame * Math.PI / 32)}} />
    <KText text="Three signals.\nOne *shared reality.*" start={0} step={5} dur={22} x={POS.hero.x} y={POS.hero.y}
      align="left" size={68} weight={500} color={C.ivory} mode="rise" />
    <KText text="Read the pattern. Name the shift. Choose the next move." start={17} step={3} dur={18} x={POS.subtitle.x} y={POS.subtitle.y}
      align="left" size={22} weight={400} color={BODY} mode="blur" />

    <SignalTile left={POS.signalOne.x} index={0} tag="BEHAVIOR" title="Silent Founder Detector" description="Spot the quiet before it hardens." metric="9 days quiet" tone="ember" kind="quiet" active={stage === 0} frame={frame} />
    <SignalTile left={POS.signalTwo.x} index={1} tag="BALANCE" title="Fairness radar" description="Match effort with recognition." metric="31 pt gap" tone="champagne" kind="fairness" active={stage === 1} frame={frame} />
    <SignalTile left={POS.signalThree.x} index={2} tag="FUTURE" title="Conflict forecast" description="See strain while it is still small." metric="82% forecast" tone="emerald" kind="forecast" active={stage === 2} frame={frame} />

    <Move from={{y: 20, o: 0, s: 0.985}} to={{y: 0, o: 1, s: 1}} start={22} dur={20} ease={ease.expoOut}
      style={{position: 'absolute', left: POS.detail.x, top: POS.detail.y}}>
      <Card x={0} y={0} w={POS.detail.w} h={POS.detail.h} theme="dark" radius={28}
        style={{transform: `translate3d(${detailAmbient.x}px,${detailAmbient.y}px,0) scale(${detailAmbient.s})`}}>
        <Label text={`FOUNDER HEALTH  ·  ${stageLabel}`} color={C.mist} style={{position: 'absolute', left: 35, top: 16, fontSize: 12, letterSpacing: '0.17em'}} />
        <div style={{...TYPE, position: 'absolute', left: 35, top: 39, color: C.ivory, fontSize: 25, fontWeight: 600, whiteSpace: 'nowrap'}}>{title}</div>
        <div style={{position: 'absolute', left: 875, top: 28, display: 'flex', alignItems: 'center', gap: 9}}>
          {['QUIET', 'FAIRNESS', 'FORECAST'].map((label, index) => <div key={label} style={{display: 'flex', alignItems: 'center', gap: 7, padding: '7px 10px', borderRadius: 999,
            border: `1px solid ${stage === index ? 'rgba(200,169,106,.4)' : 'rgba(255,255,255,.08)'}`,
            background: stage === index ? 'rgba(200,169,106,.10)' : 'rgba(255,255,255,.025)', opacity: stage === index ? 1 : 0.62}}>
            <span style={{...TYPE, color: stage === index ? C.gold2 : C.mist, fontSize: 11, fontWeight: 600}}>0{index + 1}</span>
            <span style={{...TYPE, color: C.ivory, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em'}}>{label}</span>
          </div>)}
        </div>
        <SignalWindow frame={frame} />
        <div aria-hidden="true" style={{position: 'absolute', right: 30, bottom: 13, width: 3, height: 3, borderRadius: '50%', background: C.emerald,
          boxShadow: `0 0 ${10 + pulse * 20}px rgba(31,138,112,.8)`, opacity: 0.55 + pulse}} />
      </Card>
    </Move>

    <Cursor name="Maya" color={C.champagne} keys={[
      {f: 80, ...POS.cursorStart}, {f: 116, ...POS.detectorCell}, {f: 174, ...POS.cursorAwayMaya},
      {f: 210, ...POS.fairnessRadar}, {f: 248, ...POS.fairButton}, {f: 267, ...POS.fairButton, click: true},
      {f: 291, ...POS.cursorAwayMaya}, {f: 302, ...POS.cursorAwayMaya},
    ]} />
    <Cursor name="Dev" color={C.emerald} keys={[
      {f: 328, ...POS.cursorAwayDev}, {f: 352, ...POS.conflictButton}, {f: 366, ...POS.conflictButton, click: true},
      {f: 388, ...POS.cursorAwayDev}, {f: 400, ...POS.cursorAwayDev},
    ]} />
  </>;
};
