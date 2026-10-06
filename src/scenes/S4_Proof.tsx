// src/scenes/S4_Proof.tsx
import {useId} from 'react';
import {useCurrentFrame} from 'remotion';
import type * as React from 'react';
import {
  Avatar, Backdrop, C, Card, Chip, Counter, Cursor, KText, Label, Move, Ring, Spark, Tick,
  ease, prog, press, useAmbient,
} from '../lib/kit';
import {FlipCard, PanelSwap} from '../lib/Transitions';

const POS = {
  captionOne: {x: 120, y: 340}, captionTwo: {x: 120, y: 440}, body: {x: 120, y: 550},
  card: {x: 900, y: 170, w: 900, h: 740}, investorButton: {x: 1620, y: 860},
  launchCheckOne: {x: 976, y: 378}, launchCheckTwo: {x: 976, y: 462}, launchCheckThree: {x: 976, y: 546},
  investorStart: {x: 1800, y: 1000}, investorAway: {x: 1780, y: 970},
  mayaStart: {x: 1780, y: 980}, mayaAway: {x: 1780, y: 950},
} as const;

const BODY = '#5E5A52';
const TYPE: React.CSSProperties = {
  fontFamily: 'Lora', fontVariantNumeric: 'lining-nums tabular-nums', textRendering: 'geometricPrecision',
  fontKerning: 'normal', WebkitFontSmoothing: 'antialiased',
};
const SAFE_ID = (id: string): string => id.replace(/:/g, '').replace(/[^a-zA-Z0-9_-]/g, '');
const WAITLIST_POINTS: number[] = [5, 8, 11, 13, 15, 18, 22, 25, 30, 33, 38, 42, 47, 53, 58, 61, 66, 72, 78, 83, 88, 92, 96, 100];
const ROW_LABELS = ['Launch checklist', 'Directory submissions', 'Community playbook', 'Investor CRM', 'Waitlist embed'] as const;
const ROW_DONE_AT = [200, 216, 232, 244, 252] as const;

const ActionPill: React.FC<{label: string; pressAt: number; left: number; top: number; width: number; height: number; tone: 'ink' | 'champagne' | 'emerald'}> = ({
  label, pressAt, left, top, width, height, tone,
}) => {
  const frame = useCurrentFrame(), id = SAFE_ID(useId()), amount = press(frame, pressAt, 16);
  const scaleAt = (at: number) => 1 - 0.03 * press(at, pressAt, 16);
  const blur = Math.min(24, Math.abs(scaleAt(frame) - scaleAt(frame - 1)) * 60);
  const fill = tone === 'ink' ? C.ink2 : tone === 'emerald' ? C.emerald : C.champagne;
  const text = tone === 'champagne' ? C.ink : C.ivory;
  return <>
    <svg aria-hidden="true" width="0" height="0" style={{position: 'absolute', overflow: 'hidden'}}><defs>
      <filter id={`${id}-press-blur`} x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation={`${blur.toFixed(2)} ${blur.toFixed(2)}`} /></filter>
    </defs></svg>
    <div role="button" aria-label={label} style={{...TYPE, position: 'absolute', left, top, width, height, display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxSizing: 'border-box', borderRadius: 999, border: `1px solid ${tone === 'ink' ? 'rgba(255,255,255,.22)' : C.champagne}`,
      background: fill, color: text, fontSize: 17, fontWeight: 600, whiteSpace: 'nowrap', transform: `scale(${scaleAt(frame)})`,
      boxShadow: `0 0 ${10 + 24 * amount}px rgba(200,169,106,${0.12 + 0.42 * amount})`,
      filter: blur >= 0.35 ? `url(#${id}-press-blur)` : undefined}}>{label}</div>
  </>;
};

type ProofBadgeProps = {left: number; top: number; index: number; title: string; detail: string; verified: boolean};
const ProofBadge: React.FC<ProofBadgeProps> = ({left, top, index, title, detail, verified}) => {
  const start = 36 + index * 5;
  return <Move from={{y: 12, o: 0}} to={{y: 0, o: 1}} start={start} dur={12} ease={ease.expoOut} style={{position: 'absolute', left, top}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: 385, height: 76, borderRadius: 18, border: '1px solid rgba(11,12,14,.09)',
      background: 'linear-gradient(135deg,rgba(255,255,255,.88),rgba(244,239,230,.56))', boxShadow: '0 10px 24px rgba(60,40,10,.06)'}}>
      <div style={{position: 'absolute', left: 20, top: 23, width: 28, height: 28, borderRadius: '50%', border: `1px solid ${verified ? 'rgba(31,138,112,.45)' : 'rgba(200,169,106,.5)'}`,
        background: verified ? 'rgba(31,138,112,.10)' : 'rgba(200,169,106,.10)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        {verified && <Tick progress={prog(useCurrentFrame(), start + 2, 12, ease.expoOut)} size={19} color={C.emerald} />}
      </div>
      <div style={{...TYPE, position: 'absolute', left: 62, top: 17, color: C.ink2, fontSize: 18, fontWeight: 600, whiteSpace: 'nowrap'}}>{title}</div>
      <div style={{...TYPE, position: 'absolute', left: 62, top: 43, color: BODY, fontSize: 14, whiteSpace: 'nowrap'}}>{detail}</div>
    </div>
  </Move>;
};

const ReputationFront: React.FC = () => {
  const frame = useCurrentFrame();
  return <Card x={0} y={0} w={POS.card.w} h={POS.card.h} theme="light" radius={28}>
    <Label text="FOUNDER REPUTATION" color={C.mistDark} style={{position: 'absolute', left: 42, top: 34, fontSize: 14, letterSpacing: '0.19em'}} />
    <div style={{position: 'absolute', left: 728, top: 25, display: 'flex', alignItems: 'center'}}>
      <Avatar name="Maya" tone="champagne" size={46} />
      <Avatar name="Dev" tone="emerald" size={46} style={{marginLeft: -14}} />
    </div>
    <Chip label="Two founders · one record" tone="ink" style={{position: 'absolute', left: 588, top: 82, fontSize: 13, padding: '7px 11px'}} />
    <Ring size={240} stroke={18} value={0.87} color={C.champagne} track="rgba(11,12,14,.09)" style={{position: 'absolute', left: 330, top: 130}} />
    <div style={{...TYPE, position: 'absolute', left: 330, top: 198, width: 240, textAlign: 'center', color: C.ink, fontSize: 96, fontWeight: 600, lineHeight: 1}}>
      <Counter from={0} to={87} start={24} dur={42} />
    </div>
    <div style={{...TYPE, position: 'absolute', left: 330, top: 294, width: 240, textAlign: 'center', color: C.mistDark, fontSize: 21, fontWeight: 600}}>/100</div>
    <div style={{...TYPE, position: 'absolute', left: 230, top: 397, width: 440, textAlign: 'center', color: C.mistDark, fontSize: 19, fontStyle: 'italic'}}>Public credibility score</div>
    <ProofBadge left={45} top={450} index={0} title="Agreement signed" detail="Terms made visible to both founders" verified />
    <ProofBadge left={470} top={450} index={1} title="Contribution balance" detail="94% · checked across the quarter" verified={false} />
    <ProofBadge left={45} top={540} index={2} title="Vault audit trail" detail="Every change is timestamped" verified />
    <ProofBadge left={470} top={540} index={3} title="Verified exit" detail="One clean handoff on record" verified={false} />
    <ActionPill label="View as investor" pressAt={96} left={610} top={664} width={220} height={52} tone="ink" />
    {frame >= 96 && <div aria-hidden="true" style={{position: 'absolute', left: 720, top: 690, width: 220, height: 52, borderRadius: 999,
      border: `1px solid rgba(200,169,106,${0.34 * (1 - prog(frame, 96, 22, ease.expoOut))})`, opacity: 1 - prog(frame, 96, 22, ease.expoOut), pointerEvents: 'none'}} />}
  </Card>;
};

type InvestorRowProps = {index: number; label: string; value: string; start: number};
const InvestorRow: React.FC<InvestorRowProps> = ({index, label, value, start}) => (
  <Move from={{x: 18, o: 0}} to={{x: 0, o: 1}} start={start} dur={6} ease={ease.expoOut}
    style={{position: 'absolute', left: 60, top: 160 + index * 74}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: 780, height: 60, borderRadius: 15, border: '1px solid rgba(11,12,14,.08)', background: 'rgba(255,255,255,.56)'}}>
      <div style={{position: 'absolute', left: 18, top: 16, width: 27, height: 27, borderRadius: '50%', background: 'rgba(31,138,112,.10)', border: '1px solid rgba(31,138,112,.28)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Tick progress={prog(useCurrentFrame(), start + 1, 8, ease.expoOut)} size={18} color={C.emerald} />
      </div>
      <div style={{...TYPE, position: 'absolute', left: 62, top: 17, color: C.ink2, fontSize: 19, fontWeight: 600, whiteSpace: 'nowrap'}}>{label}</div>
      <div style={{...TYPE, position: 'absolute', right: 20, top: 17, color: C.mistDark, fontSize: 18, fontWeight: 600, whiteSpace: 'nowrap'}}>{value}</div>
    </div>
  </Move>
);

const InvestorBack: React.FC = () => {
  const frame = useCurrentFrame(), quotePulse = 0.88 + 0.12 * Math.sin(frame * Math.PI / 36);
  return <Card x={0} y={0} w={POS.card.w} h={POS.card.h} theme="light" radius={28}>
    <Label text="FOUNDER REPUTATION" color={C.mistDark} style={{position: 'absolute', left: 42, top: 34, fontSize: 14, letterSpacing: '0.19em'}} />
    <div style={{...TYPE, position: 'absolute', left: 42, top: 70, color: C.ink, fontSize: 31, fontWeight: 600}}>Investor view</div>
    <Chip label="Verified" tone="emerald" style={{position: 'absolute', right: 48, top: 38, fontSize: 15, padding: '9px 14px'}} />
    <InvestorRow index={0} label="Team trust" value="91" start={124} />
    <InvestorRow index={1} label="Alignment" value="96%" start={130} />
    <InvestorRow index={2} label="Open conflicts" value="0" start={136} />
    <InvestorRow index={3} label="Quarterly reviews" value="On" start={142} />
    <Move from={{y: 9, o: 0}} to={{y: 0, o: 1}} start={140} dur={8} ease={ease.expoOut} style={{position: 'absolute', left: 66, top: 488}}>
      <div style={{...TYPE, color: C.champagne, fontSize: 40, fontStyle: 'italic', whiteSpace: 'nowrap', opacity: quotePulse}}>“Data, not assumptions.”</div>
    </Move>
  </Card>;
};

const InvestorCard: React.FC = () => <FlipCard at={96} dur={28} w={POS.card.w} h={POS.card.h} front={<ReputationFront />} back={<InvestorBack />} />;

type LaunchCheckProps = {left: number; top: number; doneAt: number; clickable: boolean; frame: number};
const LaunchCheck: React.FC<LaunchCheckProps> = ({left, top, doneAt, clickable, frame}) => {
  const id = SAFE_ID(useId()), done = prog(frame, doneAt, 12, ease.expoOut), amount = clickable ? press(frame, doneAt, 14) : 0;
  const scaleAt = (at: number) => 1 - (clickable ? 0.035 * press(at, doneAt, 14) : 0);
  const blur = Math.min(18, Math.abs(scaleAt(frame) - scaleAt(frame - 1)) * 60);
  return <>
    <svg aria-hidden="true" width="0" height="0" style={{position: 'absolute', overflow: 'hidden'}}><defs>
      <filter id={`${id}-check-motion`} x="-120%" y="-120%" width="340%" height="340%"><feGaussianBlur stdDeviation={`${blur.toFixed(2)} ${blur.toFixed(2)}`} /></filter>
    </defs></svg>
    <div style={{position: 'absolute', left, top, width: 28, height: 28, borderRadius: 8, boxSizing: 'border-box',
      border: `1.5px solid ${done > 0.1 ? C.champagne : 'rgba(11,12,14,.24)'}`,
      background: `rgba(200,169,106,${0.12 + 0.88 * done})`, display: 'flex', alignItems: 'center', justifyContent: 'center',
      transform: `scale(${scaleAt(frame)})`, boxShadow: `0 0 ${5 + amount * 17}px rgba(200,169,106,${0.08 + amount * 0.46})`,
      filter: blur >= 0.35 ? `url(#${id}-check-motion)` : undefined}}>
      <Tick progress={prog(frame, doneAt + 2, 10, ease.expoOut)} size={21} color={C.ink2} />
    </div>
  </>;
};

type LaunchRowProps = {index: number; label: string; doneAt: number};
const LaunchRow: React.FC<LaunchRowProps> = ({index, label, doneAt}) => {
  const frame = useCurrentFrame(), completed = frame >= doneAt + 9;
  const checkboxY = 24, rowTop = 170 + index * 84;
  return <Move from={{x: 12, o: 0}} to={{x: 0, o: 1}} start={182 + index * 3} dur={14} ease={ease.expoOut}
    style={{position: 'absolute', left: 40, top: rowTop}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: 820, height: 76, borderRadius: 17,
      border: '1px solid rgba(11,12,14,.08)', background: 'linear-gradient(135deg,rgba(255,255,255,.88),rgba(244,239,230,.60))'}}>
      <LaunchCheck left={22} top={checkboxY} doneAt={doneAt} clickable={index < 3} frame={frame} />
      <div style={{...TYPE, position: 'absolute', left: 68, top: 26, color: C.ink2, fontSize: 19, fontWeight: 600, whiteSpace: 'nowrap'}}>{label}</div>
      <Chip label={completed ? 'Done' : 'To do'} tone={completed ? 'emerald' : 'mist'} style={{position: 'absolute', right: 18, top: 19, fontSize: 14, padding: '8px 12px'}} />
    </div>
  </Move>;
};

const LaunchBurst: React.FC<{frame: number}> = ({frame}) => {
  if (frame < 270 || frame > 300) return null;
  return <>
    {Array.from({length: 40}, (_, index) => {
      const angle = index * 2.399963 + (index % 3) * 0.07, distance = 28 + (index % 7) * 11;
      const dx = Math.cos(angle) * distance, dy = Math.sin(angle) * distance, size = 2.5 + (index % 4) * 0.8;
      return <Move key={index} from={{x: 0, y: 0, s: 0.45, o: 0.95}} to={{x: dx, y: dy, s: 0.18, o: 0}}
        start={270} dur={30} ease={ease.expoOut} style={{position: 'absolute', left: 820, top: 61}}>
        <div style={{width: size, height: size, borderRadius: '50%', background: C.gold2, boxShadow: '0 0 12px rgba(232,211,162,.78)'}} />
      </Move>;
    })}
  </>;
};

const LaunchBoard: React.FC = () => {
  const frame = useCurrentFrame(), ambient = useAmbient('s4-launch-board', 2), pulse = 0.55 + 0.45 * Math.sin(frame * Math.PI / 30);
  const completion = prog(frame, 200, 70, ease.expoOut), glow = frame >= 270 ? 18 + 22 * pulse : 0;
  return <Card x={0} y={0} w={POS.card.w} h={POS.card.h} theme="light" radius={28}
    style={{transform: `translate3d(${ambient.x}px,${ambient.y}px,0) scale(${ambient.s})`, boxShadow: `0 40px 100px rgba(60,40,10,.14),0 0 ${glow}px rgba(200,169,106,${frame >= 270 ? 0.17 : 0})`}}>
    <Label text="FOUNDER OPERATIONS" color={C.mistDark} style={{position: 'absolute', left: 42, top: 29, fontSize: 14, letterSpacing: '0.19em'}} />
    <div style={{...TYPE, position: 'absolute', left: 42, top: 57, color: C.ink, fontSize: 32, fontWeight: 600}}>Launch Board</div>
    <Ring size={90} stroke={9} value={completion} color={C.champagne} track="rgba(11,12,14,.09)" style={{position: 'absolute', left: 770, top: 18}} />
    <div style={{...TYPE, position: 'absolute', left: 770, top: 51, width: 90, textAlign: 'center', color: C.ink2, fontSize: 17, fontWeight: 600}}>{Math.round(completion * 100)}%</div>
    {ROW_LABELS.map((label, index) => <LaunchRow key={label} index={index} label={label} doneAt={ROW_DONE_AT[index]} />)}
    <div style={{...TYPE, position: 'absolute', left: 43, top: 592, color: C.ink, fontSize: 64, fontWeight: 600, lineHeight: 1}}>
      <Counter from={0} to={2481} start={236} dur={34} />
    </div>
    <div style={{...TYPE, position: 'absolute', left: 50, top: 660, color: C.mistDark, fontSize: 17, fontStyle: 'italic'}}>on the waitlist</div>
    <Label text="SIGN-UPS · FIRST 24 HOURS" color={C.mistDark} style={{position: 'absolute', left: 340, top: 600, fontSize: 12, letterSpacing: '0.13em'}} />
    <Spark w={260} h={72} points={WAITLIST_POINTS} progress={prog(frame, 236, 34, ease.expoOut)} color={C.emerald} style={{position: 'absolute', left: 340, top: 626}} />
    {frame >= 270 && <Move from={{y: 10, s: 0.7, o: 0}} to={{y: 0, s: 1, o: 1}} start={270} dur={16} ease={ease.backOut}
      style={{position: 'absolute', left: 650, top: 624}}><Chip label="Launch ready" tone="emerald" style={{fontSize: 17, padding: '10px 15px'}} /></Move>}
    <LaunchBurst frame={frame} />
  </Card>;
};

export const S4Proof: React.FC = () => {
  const frame = useCurrentFrame();
  const investorCard = <InvestorCard />;
  const cardContent = frame < 172 ? investorCard : <PanelSwap at={172} dur={18} dir="left" outChildren={investorCard} inChildren={<LaunchBoard />} />;

  return <>
    <Backdrop theme="ivory" ghost="PROOF" ghostSize={520} ghostY={540} ghostOpacity={0.055} />
    <KText text="Investors back" start={0} step={5} dur={22} x={POS.captionOne.x} y={POS.captionOne.y}
      align="left" size={84} weight={500} color={C.ink} mode="rise" exit={{at: 168, dur: 14, dir: 'up'}} />
    <KText text="teams that *hold.*" start={8} step={5} dur={22} x={POS.captionTwo.x} y={POS.captionTwo.y}
      align="left" size={84} weight={500} color={C.ink} mode="rise" exit={{at: 168, dur: 14, dir: 'up'}} />
    <KText text="A portable reputation, built on proof, not pitch." start={40} step={4} dur={18} x={POS.body.x} y={POS.body.y}
      align="left" size={32} weight={400} color={BODY} mode="blur" maxWidth={740} exit={{at: 168, dur: 14, dir: 'up'}} />

    <Move from={{y: 28, o: 0}} to={{y: 0, o: 1}} start={0} dur={22} ease={ease.expoOut}
      style={{position: 'absolute', left: POS.card.x, top: POS.card.y}}>
      <div style={{position: 'relative', width: POS.card.w, height: POS.card.h}}>{cardContent}</div>
    </Move>

    <KText text="Then ship it." start={176} step={5} dur={22} x={POS.captionOne.x} y={POS.captionOne.y}
      align="left" size={100} weight={500} color={C.ink} mode="rise" />
    <KText text="*Together.*" start={184} step={5} dur={22} x={POS.captionTwo.x} y={POS.captionTwo.y}
      align="left" size={100} weight={500} color={C.ink} mode="rise" />
    {['Launch checklist', 'Directory submission hub', 'Community playbook'].map((text, index) => <Move key={text}
      from={{y: 12, o: 0}} to={{y: 0, o: 1}} start={196 + index * 5} dur={14} ease={ease.expoOut}
      style={{position: 'absolute', left: 120, top: 544 + index * 50}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 30, height: 30, borderRadius: '50%', border: '1px solid rgba(200,169,106,.55)', background: 'rgba(200,169,106,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Tick progress={prog(frame, 198 + index * 5, 12, ease.expoOut)} size={19} color={C.champagne} />
      </div>
      <div style={{...TYPE, position: 'absolute', left: 46, top: 2, color: BODY, fontSize: 28, whiteSpace: 'nowrap'}}>{text}</div>
    </Move>)}

    <Cursor name="Investor" color="#14161A" keys={[
      {f: 60, ...POS.investorStart}, {f: 88, ...POS.investorButton}, {f: 96, ...POS.investorButton, click: true},
      {f: 124, ...POS.investorAway}, {f: 136, ...POS.investorAway},
    ]} />
    <Cursor name="Maya" color={C.champagne} keys={[
      {f: 176, ...POS.mayaStart}, {f: 200, ...POS.launchCheckOne, click: true},
      {f: 216, ...POS.launchCheckTwo, click: true}, {f: 232, ...POS.launchCheckThree, click: true},
      {f: 244, ...POS.mayaAway}, {f: 258, ...POS.mayaAway},
    ]} />
  </>;
};
