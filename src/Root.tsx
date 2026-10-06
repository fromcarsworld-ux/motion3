// src/Root.tsx
import {
  AbsoluteFill, Audio, Composition, Sequence, interpolate, staticFile, useCurrentFrame,
} from 'remotion';
import type * as React from 'react';
import {TransitionIn, TransitionOut} from './lib/Transitions';
import {C, FPS, H, TOTAL, W} from './lib/kit';
import {S1Handshake} from './scenes/S1_Handshake';
import {S2Agreement} from './scenes/S2_Agreement';
import {S3Signals} from './scenes/S3_Signals';
import {S4Proof} from './scenes/S4_Proof';
import {S5Finale} from './scenes/S5_Finale';

const SCENE = {
  s1: {from: 0, duration: 360},
  s2: {from: 336, duration: 360},
  s3: {from: 672, duration: 420},
  s4: {from: 1068, duration: 330},
  s5: {from: 1374, duration: 340},
} as const;

// Optional files live in public/audio; leave unset when the film is rendered silently.
const MUSIC_FILE: string | null = null;
export const MUSIC: string | undefined = MUSIC_FILE ? staticFile(MUSIC_FILE) : undefined;
const SFX_FILE: string | null = null;
const SFX: string | undefined = SFX_FILE ? staticFile(SFX_FILE) : undefined;

/** Global, zero-based composition frames for the authored cursor-click cues. */
export const SFX_HITS = [
  330, 532, 598, 604, 939, 1038, 1164, 1268, 1284, 1300, 1678,
] as const;

const musicVolume = (frame: number): number => interpolate(
  frame,
  [0, 30, TOTAL - 60, TOTAL],
  [0, 0.54, 0.54, 0],
  {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
);

const hitVolume = (frame: number): number => interpolate(
  frame,
  [0, 2, 5, 18],
  [0, 0.38, 0.28, 0],
  {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
);

const FinalColorGrade: React.FC = () => {
  const frame = useCurrentFrame();
  const reveal = interpolate(frame, [0, 26], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  return <AbsoluteFill aria-hidden="true" style={{
    background: 'linear-gradient(118deg,rgba(232,211,162,.12),transparent 46%,rgba(31,138,112,.035))',
    mixBlendMode: 'soft-light', opacity: 0.3 * reveal, pointerEvents: 'none',
  }} />;
};

export const FounderSyncLaunch: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: C.ink, overflow: 'hidden'}}>
    <Sequence from={SCENE.s1.from} durationInFrames={SCENE.s1.duration}>
      <TransitionOut kind="pushzoom" total={SCENE.s1.duration} dur={24}>
        <S1Handshake />
      </TransitionOut>
    </Sequence>
    <Sequence from={SCENE.s2.from} durationInFrames={SCENE.s2.duration}>
      <TransitionIn kind="iris" dur={24}>
        <S2Agreement />
      </TransitionIn>
    </Sequence>
    <Sequence from={SCENE.s3.from} durationInFrames={SCENE.s3.duration}>
      <TransitionIn kind="pushzoom" dur={24}>
        <S3Signals />
      </TransitionIn>
    </Sequence>
    <Sequence from={SCENE.s4.from} durationInFrames={SCENE.s4.duration}>
      <TransitionIn kind="slices" dur={24}>
        <S4Proof />
      </TransitionIn>
    </Sequence>
    <Sequence from={SCENE.s5.from} durationInFrames={SCENE.s5.duration}>
      <TransitionIn kind="diagonal" dur={24}>
        <S5Finale />
      </TransitionIn>
    </Sequence>

    <Sequence from={SCENE.s5.from} durationInFrames={SCENE.s5.duration}>
      <FinalColorGrade />
    </Sequence>

    {MUSIC && <Sequence from={0} durationInFrames={TOTAL}>
      <Audio src={MUSIC} volume={musicVolume} />
    </Sequence>}
    {SFX && SFX_HITS.map((frame) => <Sequence key={frame} from={frame} durationInFrames={18}>
      <Audio src={SFX} volume={hitVolume} />
    </Sequence>)}
  </AbsoluteFill>
);

export const RemotionRoot: React.FC = () => (
  <Composition
    id="FounderSyncLaunch"
    component={FounderSyncLaunch}
    durationInFrames={TOTAL}
    fps={FPS}
    width={W}
    height={H}
  />
);
