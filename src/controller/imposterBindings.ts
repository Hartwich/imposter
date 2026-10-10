import type { ImposterInput } from "../protocol.js";

export function createImposterClueInput(playerId: string, roundId: string, turnIndex: number): ImposterInput {
  return { type: "submit_clue", playerId, roundId, turnIndex, sentAt: Date.now() };
}
export function createImposterVoteInput(playerId: string, roundId: string, suspectPlayerId: string): ImposterInput {
  return { type: "vote_player", playerId, roundId, suspectPlayerId, sentAt: Date.now() };
}
export function createImposterGuessInput(playerId: string, roundId: string, guessWord: string): ImposterInput {
  return { type: "guess_word", playerId, roundId, guessWord, sentAt: Date.now() };
}
