import { Buffer } from "node:buffer";
import { createBaseRoundState, type ServerGame, type ServerGameContext, type ScoreEntry } from "@open-party-lab/game-core";
import { pickOne, shuffle } from "@open-party-lab/utils";
import { imposterManifest } from "../manifest.js";
import type { ImposterControllerState, ImposterInput, ImposterPublicState, ImposterState } from "../protocol.js";
import { getWords } from "./words.js";

const clueRounds = 2;
const voteRevealMs = 5_000;
const guessMs = 30_000;
const resultMs = 8_000;
const disconnectGraceMs = 30_000;
const text = {
  de: {
    tied: "Gleichstand: Niemand wird entlarvt. Der Imposter entkommt.",
    escaped: "Die Gruppe hat die falsche Person verdächtigt. Der Imposter entkommt.",
    guessed: "Der Imposter hat den Begriff erraten und stiehlt den Sieg.",
    caught: "Die Crew hat den Imposter entlarvt. Sein Worttipp war falsch.",
    timeout: "Der Imposter hat keinen Worttipp abgegeben. Die Crew gewinnt.",
    left: "Der Imposter hat die Runde verlassen. Die Crew gewinnt.",
    noVotes: "Keine gültige Stimme. Der Imposter entkommt."
  },
  en: {
    tied: "A tie: nobody is exposed. The Imposter escapes.",
    escaped: "The group accused the wrong person. The Imposter escapes.",
    guessed: "The Imposter guessed the word and steals the win.",
    caught: "The crew exposed the Imposter. Their word guess was wrong.",
    timeout: "The Imposter did not guess the word. The crew wins.",
    left: "The Imposter left the round. The crew wins.",
    noVotes: "No valid votes. The Imposter escapes."
  }
};
export function normalizeGuess(value: string): string {
  return value.trim().toLocaleLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue")
    .replace(/ß/g, "ss").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
}
function validPhoto(media: unknown): media is string {
  if (typeof media !== "string" || media.length > 35_000 || !/^data:image\/jpeg;base64,\/9j\/[A-Za-z0-9+/]*={0,2}$/.test(media)) return false;
  const bytes = Buffer.from(media.slice("data:image/jpeg;base64,".length), "base64");
  return bytes.length >= 200 && bytes[0] === 255 && bytes[1] === 216 && bytes.at(-2) === 255 && bytes.at(-1) === 217;
}
function eligible(state: ImposterState, context: ServerGameContext): string[] {
  return state.clueOrder.filter((id) => context.players.some((player) => player.id === id && player.connected));
}
function tally(state: ImposterState): Array<{ playerId: string; votes: number }> {
  const counts = new Map<string, number>();
  for (const id of Object.values(state.votesByPlayer)) counts.set(id, (counts.get(id) ?? 0) + 1);
  return [...counts].map(([playerId, votes]) => ({ playerId, votes })).sort((a, b) => b.votes - a.votes);
}
function currentTurn(state: ImposterState): string | undefined {
  return state.stage === "clues" ? state.clueOrder[state.currentTurnIndex % state.clueOrder.length] : undefined;
}
function settle(state: ImposterState, context: ServerGameContext, imposterWon: boolean, reason: string): ImposterState {
  return { ...state, stage: "resolved", imposterWon, resolvedReason: reason,
    finishAt: context.now + resultMs, updatedAt: context.now };
}
function score(state: ImposterState): ScoreEntry[] {
  if (state.stage !== "resolved") return [];
  return state.imposterWon ? [{ playerId: state.imposterPlayerId, delta: 2, reason: "Imposter" }]
    : state.clueOrder.filter((id) => id !== state.imposterPlayerId).map((playerId) => ({ playerId, delta: 1, reason: "Crew" }));
}
function closeVote(state: ImposterState, context: ServerGameContext): ImposterState {
  const counts = tally(state);
  const tied = counts.length > 1 && counts[0].votes === counts[1].votes;
  return { ...state, stage: "vote_reveal", voteTied: tied,
    voteResultPlayerId: tied ? undefined : counts[0]?.playerId,
    finishAt: context.now + voteRevealMs, updatedAt: context.now };
}
function afterPhotos(state: ImposterState): "clues" | "voting" {
  return state.confirmClues === false ? "voting" : "clues";
}
function nextTurn(state: ImposterState, context: ServerGameContext): ImposterState {
  const currentTurnIndex = state.currentTurnIndex + 1;
  return { ...state, currentTurnIndex, stage: currentTurnIndex >= state.clueOrder.length * clueRounds ? "voting" : "clues", updatedAt: context.now };
}
function publicState(state: ImposterState, context: ServerGameContext): ImposterPublicState {
  const revealed = ["vote_reveal", "imposter_guess", "resolved"].includes(state.stage);
  // Project this round's points before the platform's one-time score commit.
  const deltas = Object.fromEntries(score(state).map((entry) => [entry.playerId, entry.delta]));
  const pending = state.phase === "playing";
  const ids = eligible(state, context);
  return {
    roundId: state.roundId, stage: state.stage, confirmClues: state.confirmClues !== false,
    players: state.players.map((player) => ({ ...player,
      name: context.players.find(({ id }) => id === player.id)?.name ?? player.name,
      avatar: state.avatars[player.id], points: (state.gameScores[player.id] ?? 0) + (pending ? deltas[player.id] ?? 0 : 0), delta: deltas[player.id] ?? 0 })),
    category: state.stage === "resolved" ? state.category : undefined,
    clueOrder: state.clueOrder, currentTurnIndex: state.currentTurnIndex, currentTurnPlayerId: currentTurn(state),
    clueTurnsTotal: state.clueOrder.length * clueRounds,
    submittedCount: state.stage === "avatar" ? ids.filter((id) => state.avatarDone[id]).length : ids.filter((id) => state.votesByPlayer[id]).length,
    playerCount: ids.length, finishAt: state.finishAt, remainingMs: state.finishAt === null ? null : Math.max(0, state.finishAt - context.now),
    voteCounts: revealed ? tally(state) : [], voteResultPlayerId: revealed ? state.voteResultPlayerId : undefined,
    voteTied: revealed && state.voteTied,
    imposterRevealId: state.stage === "imposter_guess" || state.stage === "resolved" ? state.imposterPlayerId : undefined,
    secretWord: state.stage === "resolved" ? state.secretWord : undefined,
    imposterGuess: state.stage === "resolved" ? state.imposterGuess : undefined,
    imposterWon: state.stage === "resolved" && state.imposterWon, resolvedReason: state.resolvedReason
  };
}
export const serverGame: ServerGame<ImposterState, ImposterInput, ImposterPublicState | ImposterControllerState> = {
  manifest: imposterManifest,
  createInitialState(context) {
    const previous = context.previousRound?.gameId === "imposter" && context.previousRound.phase === "finished"
      ? context.previousRound.state as ImposterState : undefined;
    const players = context.players.filter((player) => player.connected);
    const words = getWords(context.language, context.roomSettings.imposterWordCategory);
    const unused = words.filter((word) => !(previous?.usedWordIds ?? []).includes(word.id));
    const candidates = unused.length ? unused : words.filter((word) => word.id !== previous?.wordId);
    const word = pickOne(candidates.length ? candidates : words);
    const confirmClues = context.roomSettings.imposterConfirmClues !== "off";
    const hint = context.roomSettings.imposterGiveHint === "on" ? word.hints[0] : undefined;
    const avatars = previous?.avatars ?? {};
    const avatarDone = Object.fromEntries(players.filter(({ id }) => previous?.avatarDone[id]).map(({ id }) => [id, true]));
    return {
      ...createBaseRoundState("round_intro", context.now, { durationMs: 1_600 }),
      roundId: `${context.roundNumber}:${context.now}`, stage: players.every(({ id }) => avatarDone[id]) ? (confirmClues ? "clues" : "voting") : "avatar",
      players: players.map(({ id, name }) => ({ id, name, points: 0, delta: 0 })),
      secretWord: word.word, wordId: word.id, usedWordIds: [...(unused.length ? previous?.usedWordIds ?? [] : []), word.id],
      category: word.category, hint: hint?.label,
      confirmClues,
      imposterPlayerId: pickOne(players).id, clueOrder: shuffle(players.map(({ id }) => id)),
      avatars: { ...avatars }, avatarDone, autoContinueByPlayer: { ...previous?.autoContinueByPlayer },
      gameScores: { ...previous?.gameScores }, currentTurnIndex: 0, votesByPlayer: {},
      voteTied: false, imposterWon: false, finishAt: null, disconnectedAt: {}
    };
  },
  startRound(state, context) {
    return { ...state, phase: "playing", startedAt: context.now, phaseStartedAt: context.now,
      phaseEndsAt: null, updatedAt: context.now };
  },
  handleHostAction(state, action) {
    if (state && state.phase !== "finished") return null;
    if (!action || typeof action !== "object") return null;
    const options = action as { type?: unknown; category?: unknown; hint?: unknown; confirmClues?: unknown };
    if (options.type !== "configure-lobby") return null;
    const roomSettings: Record<string, unknown> = {};
    if (typeof options.category === "string" && ["standard", "adult", "all"].includes(options.category)) roomSettings.imposterWordCategory = options.category;
    if (options.hint === "on" || options.hint === "off") roomSettings.imposterGiveHint = options.hint;
    if (options.confirmClues === "on" || options.confirmClues === "off") roomSettings.imposterConfirmClues = options.confirmClues;
    return Object.keys(roomSettings).length ? { roomSettings } : null;
  },
  handleInput(state, input, context) {
    if (input.roundId !== state.roundId || !eligible(state, context).includes(input.playerId)) return state;
    if (input.type === "set_auto_continue" && typeof input.enabled === "boolean") {
      return { ...state, autoContinueByPlayer: { ...state.autoContinueByPlayer, [input.playerId]: input.enabled }, updatedAt: context.now };
    }
    if (state.phase !== "playing") return state;
    if (state.stage === "avatar" && (input.type === "imposter:avatar" || input.type === "imposter:skip_avatar")) {
      if (state.avatarDone[input.playerId] || (input.type === "imposter:avatar" && !validPhoto(input.media))) return state;
      const next = { ...state, avatars: { ...state.avatars, ...(input.type === "imposter:avatar" ? { [input.playerId]: input.media } : {}) },
        avatarDone: { ...state.avatarDone, [input.playerId]: true }, updatedAt: context.now };
      return state.clueOrder.every((id) => next.avatarDone[id]) ? { ...next, stage: afterPhotos(state) } : next;
    }
    if (state.stage === "clues" && input.type === "submit_clue" && input.playerId === currentTurn(state) && input.turnIndex === state.currentTurnIndex) {
      return nextTurn(state, context);
    }
    if (state.stage === "voting" && input.type === "vote_player") {
      if (state.votesByPlayer[input.playerId] || input.playerId === input.suspectPlayerId || !state.clueOrder.includes(input.suspectPlayerId)) return state;
      const next = { ...state, votesByPlayer: { ...state.votesByPlayer, [input.playerId]: input.suspectPlayerId }, updatedAt: context.now };
      return state.clueOrder.every((id) => next.votesByPlayer[id]) ? closeVote(next, context) : next;
    }
    if (state.stage === "imposter_guess" && input.type === "guess_word" && input.playerId === state.imposterPlayerId && typeof input.guessWord === "string") {
      if (state.finishAt !== null && context.now >= state.finishAt) return settle(state, context, false, text[context.language].timeout);
      const guess = input.guessWord.trim();
      if (!guess || guess.length > 100) return state;
      const won = normalizeGuess(guess) === normalizeGuess(state.secretWord);
      return settle({ ...state, imposterGuess: guess }, context, won, won ? text[context.language].guessed : text[context.language].caught);
    }
    return state;
  },
  tick(state, _deltaMs, context) {
    if (state.stage === "resolved") return state;
    let next = state;
    const connected = eligible(state, context);
    const disconnectedAt = { ...state.disconnectedAt };
    for (const id of state.clueOrder) {
      if (connected.includes(id)) delete disconnectedAt[id];
      else disconnectedAt[id] ??= context.now;
    }
    if (JSON.stringify(disconnectedAt) !== JSON.stringify(state.disconnectedAt)) next = { ...state, disconnectedAt, updatedAt: context.now };
    const imposterLeftAt = disconnectedAt[state.imposterPlayerId];
    if (imposterLeftAt !== undefined && context.now - imposterLeftAt >= disconnectGraceMs) return settle(next, context, false, text[context.language].left);
    if (state.stage === "avatar" && connected.length && connected.every((id) => state.avatarDone[id]) && !Object.keys(disconnectedAt).length) return { ...next, stage: afterPhotos(state), updatedAt: context.now };
    if (state.stage === "clues") {
      const id = currentTurn(state);
      if (id && disconnectedAt[id] !== undefined && context.now - disconnectedAt[id] >= disconnectGraceMs) return nextTurn(next, context);
    }
    if (state.stage === "avatar" && connected.length && connected.every((id) => state.avatarDone[id]) && Object.values(disconnectedAt).every((at) => context.now - at >= disconnectGraceMs)) return { ...next, stage: afterPhotos(state), updatedAt: context.now };
    if (state.stage === "voting" && connected.length && connected.every((id) => state.votesByPlayer[id]) && Object.values(disconnectedAt).every((at) => context.now - at >= disconnectGraceMs)) return closeVote(next, context);
    if (state.stage === "vote_reveal" && state.finishAt !== null && context.now >= state.finishAt) {
      if (state.voteTied) return settle(next, context, true, text[context.language].tied);
      if (!state.voteResultPlayerId) return settle(next, context, true, text[context.language].noVotes);
      if (state.voteResultPlayerId !== state.imposterPlayerId) return settle(next, context, true, text[context.language].escaped);
      return { ...next, stage: "imposter_guess", finishAt: context.now + guessMs, updatedAt: context.now };
    }
    if (state.stage === "imposter_guess" && state.finishAt !== null && context.now >= state.finishAt) return settle(next, context, false, text[context.language].timeout);
    return next;
  },
  isRoundFinished: (state, context) => state.stage === "resolved" && state.finishAt !== null && context.now >= state.finishAt,
  buildScore: score,
  toPublicState: publicState,
  toControllerStateForPlayer(state, context, playerId) {
    const role = !state.clueOrder.includes(playerId) ? "spectator" : playerId === state.imposterPlayerId ? "imposter" : "crew";
    return {
      ...publicState(state, context), role,
      // Only the crew gets the word before resolution. Never send answer choices.
      secretWord: state.stage === "resolved" || (role === "crew" && state.stage !== "avatar") ? state.secretWord : undefined,
      hint: role === "imposter" && state.stage !== "avatar" && state.stage !== "resolved" ? state.hint : undefined,
      hasVoted: Boolean(state.votesByPlayer[playerId]), ownVote: state.votesByPlayer[playerId],
      avatarSubmitted: Boolean(state.avatarDone[playerId]), autoContinue: Boolean(state.autoContinueByPlayer[playerId]),
      voteOptions: state.stage === "voting" && role !== "spectator" ? state.clueOrder.filter((id) => id !== playerId) : []
    };
  }
};
