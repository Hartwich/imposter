import type { GameManifest } from "@open-party-lab/game-core";

export const imposterManifest = {
  id: "imposter",
  displayName: "Imposter",
  description: "Finde den Bluffenden durch Hinweise und Abstimmung.",
  minPlayers: 3,
  maxPlayers: 20,
  hostView: "ImposterHostScene",
  controllerView: "imposter",
  controllerLayout: "choice",
  supportsTeams: false,
  estimatedRoundDurationMs: 120_000,
  roundCompletionMode: "wait_for_ready",
  phaseDurations: {
    roundIntroMs: 1_600,
    countdownMs: 2_200,
    resultMs: 6_000,
    scoreboardMs: 5_000
  },

  ownsScreens: ["round_intro", "result"],
  visual: { accent: "#8a7aa8", icon: "mask", eyebrow: "Bluff" },
  audio: { track: { profile: "mystery", bpm: 98, rootMidi: 46, masterGain: 0.11 } },
} as const satisfies GameManifest;

export const manifest = imposterManifest;

