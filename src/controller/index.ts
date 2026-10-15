import type { ControllerLayoutKey } from "@open-party-lab/game-core";
import { imposterManifest } from "../manifest.js";
import type { ImposterControllerState } from "../protocol.js";
interface ControllerContext {
  state: {
    preferredLanguage?: "de" | "en";
    room?: { language?: "de" | "en"; players?: Array<{ id: string; name: string; isReady?: boolean; connected?: boolean }> } | null;
    player?: { id: string; isReady?: boolean } | null;
    game?: { phase?: string; roundNumber?: number; state?: unknown } | null;
  };
  onInput(input: unknown): void;
  onSetReady?: (ready: boolean) => void;
}
export function buildImposterControllerModel({ state, onInput, onSetReady }: ControllerContext) {
  const game = state.game?.state as ImposterControllerState | undefined;
  const language = state.room?.language ?? state.preferredLanguage ?? "de";
  const en = language === "en";
  const playerId = state.player?.id ?? "";
  const inPlay = state.game?.phase === "playing";
  const isImposter = game?.role === "imposter";
  const spectator = game?.role === "spectator";
  const turn = game?.currentTurnPlayerId === playerId;
  const players = game?.players ?? [];
  const stage = inPlay && !spectator
    ? game?.stage === "avatar" ? "avatar"
      : game?.stage === "voting" ? "vote"
      : game?.stage === "imposter_guess" && isImposter ? "submit" : "waiting"
    : "waiting";
  const send = (input: Record<string, unknown>) => {
    if (!playerId || !game?.roundId || spectator) return;
    onInput({ ...input, playerId, roundId: game.roundId, sentAt: Date.now() });
  };
  const labels = {
    avatar: en ? "Your player photo" : "Dein Spielerfoto",
    clues: isImposter ? (en ? "You are the Imposter" : "Du bist der Imposter") : (en ? "You are crew" : "Du gehörst zur Crew"),
    voting: en ? "Who is bluffing?" : "Wer blufft?",
    vote_reveal: en ? "The votes are in" : "Die Stimmen sind da",
    imposter_guess: isImposter ? (en ? "Your last chance" : "Deine letzte Chance") : (en ? "One last guess" : "Ein letzter Worttipp"),
    resolved: en ? "Round resolved" : "Runde aufgelöst"
  };
  const currentName = players.find(({ id }) => id === game?.currentTurnPlayerId)?.name ?? "…";
  const helperText = spectator ? (en ? "You can join in with the next word." : "Du spielst beim nächsten Begriff mit.")
    : game?.stage === "avatar" ? (en ? "Take a selfie or continue without a photo. Your picture appears on the shared screen." : "Mach ein Selfie oder spiele ohne Foto. Dein Bild erscheint auf dem Hauptbildschirm.")
    : game?.stage === "clues" ? turn
      ? (en ? "Say one related word out loud. Do not say the secret word. Then confirm below." : "Nenne laut ein passendes Wort. Verrate den Begriff nicht. Bestätige danach unten.")
      : (en ? `${currentName} is speaking. Listen closely.` : `${currentName} ist dran. Hör gut zu.`)
    : game?.stage === "voting" ? game.hasVoted
      ? (en ? "Vote submitted. You can change your choice until everyone has voted." : "Stimme abgegeben. Du kannst deine Auswahl ändern, bis alle abgestimmt haben.")
      : (en ? "Share clues and discuss. Then tap the player you suspect. One secret vote; no self-votes." : "Nennt eure Hinweise und diskutiert. Tippe dann auf deinen Verdacht. Eine geheime Stimme; keine Selbstwahl.")
    : game?.stage === "imposter_guess" ? isImposter
      ? (en ? "Type the secret word. You have one guess and 30 seconds." : "Gib den geheimen Begriff ein. Du hast einen Versuch und 30 Sekunden.")
      : (en ? "The Imposter has one chance to guess. Keep the word to yourself." : "Der Imposter darf einmal raten. Verrate den Begriff noch nicht.")
    : game?.resolvedReason ?? (en ? "Watch the shared screen." : "Schaut auf den Hauptbildschirm.");
  const connected = (state.room?.players ?? []).filter((player) => player.connected !== false);
  const ready = state.game?.phase === "finished" && onSetReady ? {
    currentPlayerReady: Boolean(connected.find(({ id }) => id === playerId)?.isReady ?? state.player?.isReady),
    readyCount: connected.filter(({ isReady }) => isReady).length, playerCount: connected.length,
    label: en ? "Ready for the next word" : "Bereit für den nächsten Begriff", language,
    onToggleReady: () => onSetReady(!Boolean(connected.find(({ id }) => id === playerId)?.isReady))
  } : undefined;
  return {
    kind: "social_party" as const, title: "Imposter", language, stage: stage as "avatar" | "vote" | "submit" | "waiting",
    statusLabel: spectator ? (en ? "Next round" : "Nächste Runde") : labels[game?.stage ?? "avatar"], helperText,
    secret: game?.secretWord ? { label: en ? "Secret word" : "Geheimer Begriff", term: game.secretWord }
      : game?.hint ? { label: en ? "Your hint" : "Dein Hinweis", term: game.hint } : undefined,
    score: players.find(({ id }) => id === playerId)?.points ?? 0,
    taskKind: "text" as const, maxTextLength: 100, resetKey: `${game?.roundId ?? ""}:${stage}`,
    hasSubmitted: stage === "avatar" ? Boolean(game?.avatarSubmitted) : false,
    disabled: !inPlay || spectator, selectedId: game?.ownVote,
    choices: (game?.voteOptions ?? []).map((id) => ({ id, label: players.find((player) => player.id === id)?.name ?? id, avatar: players.find((player) => player.id === id)?.avatar })),
    actions: inPlay && game?.stage === "avatar" && !game.avatarSubmitted && !spectator
      ? [{ id: "skip", label: en ? "Continue without photo" : "Ohne Foto weiterspielen", onPress: () => send({ type: "imposter:skip_avatar" }) }]
      : inPlay && game?.stage === "clues" && turn
        ? [{ id: "clue", label: en ? "Clue given →" : "Hinweis gegeben →", onPress: () => send({ type: "submit_clue", turnIndex: game.currentTurnIndex }) }] : [],
    autoReady: !spectator && game ? { enabled: game.autoContinue, onChange: (enabled: boolean) => send({ type: "set_auto_continue", enabled }), onReady: () => onSetReady?.(true) } : undefined,
    ready,
    onSubmitAvatar: (media: string) => send({ type: "imposter:avatar", media }),
    onVote: (suspectPlayerId: string) => send({ type: "vote_player", suspectPlayerId }),
    onSubmitText: (guessWord: string) => send({ type: "guess_word", guessWord }),
    onSubmitPick: () => {}, onSubmitMedia: () => {}
  };
}
export const controllerGame = {
  id: imposterManifest.id, layoutKey: "social_party" as ControllerLayoutKey, buildLayout: buildImposterControllerModel
} as const;
