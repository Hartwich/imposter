import type { BaseRoundState, PlayerInput } from "@open-party-lab/game-core";

export type ImposterStage = "clues" | "voting" | "imposter_guess" | "resolved";

export interface SubmitClueInput extends PlayerInput {
  type: "submit_clue";
  clue: string;
}

export interface VotePlayerInput extends PlayerInput {
  type: "vote_player";
  suspectPlayerId: string;
}

export interface GuessWordInput extends PlayerInput {
  type: "guess_word";
  guessWord: string;
}

export type ImposterInput = SubmitClueInput | VotePlayerInput | GuessWordInput;

export interface ImposterState extends BaseRoundState {
  stage: ImposterStage;
  secretWord: string;
  category: string;
  imposterPlayerId: string;
  clueOrder: string[];
  currentTurnIndex: number;
  votesByPlayer: Record<string, string>;
  voteResultPlayerId?: string;
  imposterGuessOptions: string[];
  imposterGuess?: string;
  imposterWon: boolean;
  resolvedReason?: string;
}

export interface ImposterPublicState {
  stage: string;
  category: string;
  clueOrder: string[];
  currentTurnIndex: number;
  currentTurnPlayerId?: string;
  clueTurnsTotal: number;
  voteCounts: Array<{ playerId: string; playerName: string; votes: number }>;
  voteResultPlayerId?: string;
  imposterRevealName?: string;
  secretWord?: string;
  imposterGuess?: string;
  imposterWon: boolean;
  resolvedReason?: string;
  message?: string;
}

export interface ImposterControllerState {
  stage: string;
  role: "imposter" | "crew";
  roleLabel: string;
  category: string;
  secretWord?: string;
  currentTurnPlayerId?: string;
  clueTurnsCompleted: number;
  clueTurnsTotal: number;
  votesByPlayer: Record<string, string>;
  hasVoted: boolean;
  voteOptions: Array<{ id: string; disabled: boolean }>;
  imposterGuessOptions: string[];
  voteResultPlayerId?: string;
  imposterGuess?: string;
  imposterWon: boolean;
  resolvedReason?: string;
}
