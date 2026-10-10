import type { BaseRoundState, PlayerInput } from "@open-party-lab/game-core";
export type ImposterStage = "avatar" | "clues" | "voting" | "vote_reveal" | "imposter_guess" | "resolved";
export type ImposterInput = PlayerInput & { roundId: string } & (
  | { type: "submit_clue"; turnIndex: number }
  | { type: "vote_player"; suspectPlayerId: string }
  | { type: "guess_word"; guessWord: string }
  | { type: "imposter:avatar"; media: string }
  | { type: "imposter:skip_avatar" }
  | { type: "set_auto_continue"; enabled: boolean }
);
export interface ImposterPlayer { id: string; name: string; avatar?: string; points: number; delta: number }
export interface ImposterState extends BaseRoundState {
  roundId: string;
  stage: ImposterStage;
  secretWord: string;
  wordId: string;
  usedWordIds: string[];
  confirmClues: boolean;
  category: string;
  hint?: string;
  imposterPlayerId: string;
  clueOrder: string[];
  players: ImposterPlayer[];
  avatars: Record<string, string>;
  avatarDone: Record<string, boolean>;
  autoContinueByPlayer: Record<string, boolean>;
  gameScores: Record<string, number>;
  currentTurnIndex: number;
  votesByPlayer: Record<string, string>;
  voteResultPlayerId?: string;
  voteTied: boolean;
  imposterGuess?: string;
  imposterWon: boolean;
  resolvedReason?: string;
  finishAt: number | null;
  disconnectedAt: Record<string, number>;
}
export interface ImposterPublicState {
  confirmClues: boolean;
  roundId: string;
  stage: ImposterStage;
  players: ImposterPlayer[];
  category?: string;
  clueOrder: string[];
  currentTurnIndex: number;
  currentTurnPlayerId?: string;
  clueTurnsTotal: number;
  submittedCount: number;
  playerCount: number;
  finishAt: number | null;
  remainingMs: number | null;
  voteCounts: Array<{ playerId: string; votes: number }>;
  voteResultPlayerId?: string;
  voteTied: boolean;
  imposterRevealId?: string;
  secretWord?: string;
  imposterGuess?: string;
  imposterWon: boolean;
  resolvedReason?: string;
}
export interface ImposterControllerState extends ImposterPublicState {
  role: "imposter" | "crew" | "spectator";
  hint?: string;
  hasVoted: boolean;
  ownVote?: string;
  avatarSubmitted: boolean;
  autoContinue: boolean;
  voteOptions: string[];
}
