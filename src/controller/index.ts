import type { ControllerLayoutKey } from "@open-party-lab/game-core";
import { imposterManifest } from "../manifest.js";
import {
  createImposterGuessInput,
  createImposterVoteInput
} from "./imposterBindings.js";

interface ReadyLayoutModel {
  currentPlayerReady: boolean;
  readyCount: number;
  playerCount: number;
  label: string;
  description?: string;
  language?: "de" | "en";
  onToggleReady: () => void;
}

interface ChoiceLayoutModel {
  kind: "choice";
  title: string;
  subtitle?: string;
  helperText?: string;
  disabled: boolean;
  ready?: ReadyLayoutModel;
  choices: Array<{
    id: string;
    label: string;
    description?: string;
    disabled?: boolean;
    onSelect: () => void;
  }>;
  stats?: Array<{ label: string; value: string; highlighted?: boolean }>;
  feed?: string[];
}

interface ControllerGameRenderContext {
  state: {
    preferredLanguage?: "de" | "en";
    room?: {
      language?: "de" | "en";
      selectedGameId?: string;
      availableGames?: Array<{ id: string; displayName?: string; roundCompletionMode?: string }>;
      players?: Array<{ id: string; name: string; isReady?: boolean }>;
    } | null;
    player?: {
      id: string;
      isReady?: boolean;
    } | null;
    game?: {
      phase?: string;
      message?: string;
      state?: unknown;
    } | null;
  };
  onInput(input: unknown): void;
  onSetReady?: (isReady: boolean) => void;
}

interface ImposterControllerState {
  stage?: "clues" | "voting" | "imposter_guess" | "resolved";
  role?: "imposter" | "crew";
  roleLabel?: string;
  category?: string;
  secretWord?: string;
  clueOrder?: string[];
  currentTurnPlayerId?: string;
  clueTurnsCompleted?: number;
  clueTurnsTotal?: number;
  votesByPlayer?: Record<string, string>;
  hasVoted?: boolean;
  voteOptions?: Array<{ id: string; disabled: boolean }>;
  imposterGuessOptions?: string[];
  resolvedReason?: string;
  imposterWon?: boolean;
}

function buildReadyModel(context: ControllerGameRenderContext): ReadyLayoutModel | undefined {
  const { state, onSetReady } = context;
  const gameId = state.room?.selectedGameId;
  const selectedGame = gameId ? state.room?.availableGames?.find((entry) => entry.id === gameId) : undefined;

  if (
    selectedGame?.roundCompletionMode !== "wait_for_ready" ||
    state.game?.phase !== "finished" ||
    !state.room ||
    !state.player ||
    !onSetReady
  ) {
    return undefined;
  }

  const players = state.room.players ?? [];
  const playerId = state.player.id;
  const currentPlayerReady = Boolean(
    players.find((player) => player.id === playerId)?.isReady ?? state.player.isReady
  );
  const readyCount = players.filter((player) => player.isReady).length;
  const playerCount = players.length;
  const en = state.room.language === "en";

  return {
    currentPlayerReady,
    readyCount,
    playerCount,
    label: en ? "Next Round" : "Naechste Runde",
    description: en
      ? `${readyCount}/${playerCount} players are ready.`
      : `${readyCount}/${playerCount} Spieler sind bereit.`,
    language: state.room.language,
    onToggleReady: () => onSetReady(!currentPlayerReady)
  };
}

function getCurrentTurnLabel(imposterState: ImposterControllerState, playerNames: Record<string, string>): string | undefined {
  const currentPlayerId = imposterState.currentTurnPlayerId;
  if (!currentPlayerId) {
    return undefined;
  }

  return playerNames[currentPlayerId] ?? currentPlayerId;
}

function formatStageLabel(stage: NonNullable<ImposterControllerState["stage"]>, en: boolean): string {
  switch (stage) {
    case "clues":
      return en ? "Clues" : "Hinweise";
    case "voting":
      return en ? "Voting" : "Abstimmung";
    case "imposter_guess":
      return en ? "Imposter guess" : "Imposter-Tipp";
    case "resolved":
      return en ? "Resolved" : "Aufgeloest";
    default:
      return stage;
  }
}

export function buildImposterControllerModel(context: ControllerGameRenderContext): ChoiceLayoutModel {
  const { state, onInput } = context;
  const imposterState = (state.game?.state ?? {}) as ImposterControllerState;
  const en = state.room?.language === "en";
  const playerId = state.player?.id ?? "";
  const phase = state.game?.phase;
  const players = state.room?.players ?? [];
  const playerNames = Object.fromEntries(players.map((player) => [player.id, player.name]));
  const stage = imposterState.stage ?? "clues";
  const title = state.room?.availableGames?.find((game) => game.id === "imposter")?.displayName ?? "Imposter";
  const isImposter = imposterState.role === "imposter";
  const isCurrentTurn = stage === "clues" && imposterState.currentTurnPlayerId === playerId;
  const clueTurnsCompleted = imposterState.clueTurnsCompleted ?? 0;
  const clueTurnsTotal = imposterState.clueTurnsTotal ?? 0;
  const currentTurnLabel = getCurrentTurnLabel(imposterState, playerNames);

  const choices: ChoiceLayoutModel["choices"] = [];

  if (stage === "clues") {
    if (isCurrentTurn) {
      choices.push({
        id: "clue:done",
        label: en ? "Clue given" : "Hinweis abgegeben",
        description: en ? "Once you are done speaking, tap here to continue." : "Wenn du fertig gesprochen hast, tippe hier weiter.",
        disabled: phase !== "playing",
        onSelect: () => onInput({ type: "submit_clue", playerId, clue: "", sentAt: Date.now() })
      });
    }
  }

  if (stage === "voting") {
    for (const voteOption of imposterState.voteOptions ?? []) {
      choices.push({
        id: `vote:${voteOption.id}`,
        label: playerNames[voteOption.id] ?? voteOption.id,
        description: en ? "Suspect as the Imposter" : "Als Imposter verdaechtigen",
        disabled: phase !== "playing" || voteOption.disabled,
        onSelect: () => onInput(createImposterVoteInput(playerId, voteOption.id))
      });
    }
  }

  if (stage === "imposter_guess") {
    for (const guessOption of imposterState.imposterGuessOptions ?? []) {
      choices.push({
        id: `guess:${guessOption}`,
        label: guessOption,
        description: en ? "Guess the word as Imposter" : "Wort als Imposter erraten",
        disabled: phase !== "playing",
        onSelect: () => onInput(createImposterGuessInput(playerId, guessOption))
      });
    }
  }

  const feed = (imposterState.clueOrder ?? []).map((turnPlayerId, index) => {
    const prefix = `${index + 1}. ${playerNames[turnPlayerId] ?? turnPlayerId}`;
    return en ? `${prefix} is up` : `${prefix} ist in der Reihe`;
  });

  return {
    kind: "choice",
    title,
    subtitle: imposterState.roleLabel ?? (en ? "Assigning roles ..." : "Rolle wird verteilt ..."),
    helperText:
      imposterState.resolvedReason ??
      state.game?.message ??
      (stage === "clues"
        ? isCurrentTurn
          ? en
            ? "Say your clue out loud, then tap Clue given."
            : "Sprich deinen Hinweis muendlich und tippe danach auf Hinweis abgegeben."
          : currentTurnLabel
            ? `${en ? "Waiting for" : "Warte auf"} ${currentTurnLabel}.`
            : en ? "Waiting for the next turn." : "Warte auf den naechsten Zug."
        : undefined) ??
      (en ? "Give a clue or find the Imposter." : "Gib einen Hinweis oder finde den Imposter."),
    disabled: phase !== "playing",
    choices:
      choices.length > 0 ? choices : [],
    ready: buildReadyModel(context),
    stats: [
      { label: en ? "Category" : "Kategorie", value: imposterState.category ?? "-" },
      {
        label: en ? "Secret Word" : "Geheimes Wort",
        value: isImposter ? imposterState.secretWord ?? "???" : en ? "hidden" : "verborgen"
      },
      {
        label: en ? "Clue Round" : "Hinweisrunde",
        value: clueTurnsTotal > 0 ? `${clueTurnsCompleted}/${clueTurnsTotal}` : "-"
      },
      { label: "Phase", value: formatStageLabel(stage, en) }
    ],
    feed
  };
}

export const controllerGame = {
  id: imposterManifest.id,
  layoutKey: "choice" as ControllerLayoutKey,
  buildLayout(context: ControllerGameRenderContext) {
    return buildImposterControllerModel(context);
  }
} as const;
