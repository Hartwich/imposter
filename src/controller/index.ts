import type { ControllerLayoutKey, SupportedLanguage } from "@open-party-lab/game-core";
import { imposterManifest } from "../manifest.js";
import type { ImposterControllerState } from "../protocol.js";
interface ControllerContext {
  state: {
    preferredLanguage?: SupportedLanguage;
    room?: { language?: SupportedLanguage; players?: Array<{ id: string; name: string; isReady?: boolean; connected?: boolean }> } | null;
    player?: { id: string; isReady?: boolean } | null;
    game?: { phase?: string; roundNumber?: number; state?: unknown } | null;
  };
  onInput(input: unknown): void;
  onSetReady?: (ready: boolean) => void;
}
export function buildImposterControllerModel({ state, onInput, onSetReady }: ControllerContext) {
  const game = state.game?.state as ImposterControllerState | undefined;
  const language = state.room?.language ?? state.preferredLanguage ?? "de";
  const say = (de: string, en: string, es: string, fr: string, pt: string) => ({ de, en, es, fr, "pt-BR": pt })[language];
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
    avatar: say("Dein Spielerfoto", "Your player photo", "Tu foto de jugador", "Votre photo de joueur", "Sua foto de jogador"),
    clues: isImposter ? say("Du bist der Imposter", "You are the Imposter", "Eres el impostor", "Vous êtes l’imposteur", "Você é o impostor") : say("Du gehörst zur Crew", "You are crew", "Eres parte de la tripulación", "Vous faites partie de l’équipage", "Você faz parte da tripulação"),
    voting: say("Wer blufft?", "Who is bluffing?", "¿Quién está mintiendo?", "Qui bluffe ?", "Quem está blefando?"),
    vote_reveal: say("Die Stimmen sind da", "The votes are in", "Ya se votó", "Les votes sont tombés", "Os votos chegaram"),
    imposter_guess: isImposter ? say("Deine letzte Chance", "Your last chance", "Tu última oportunidad", "Votre dernière chance", "Sua última chance") : say("Ein letzter Worttipp", "One last guess", "Un último intento", "Un dernier essai", "Um último palpite"),
    resolved: say("Runde aufgelöst", "Round resolved", "Ronda resuelta", "Manche terminée", "Rodada encerrada")
  };
  const currentName = players.find(({ id }) => id === game?.currentTurnPlayerId)?.name ?? "…";
  const helperText = spectator ? say("Du spielst beim nächsten Begriff mit.", "You can join in with the next word.", "Te unirás con la siguiente palabra.", "Vous pourrez participer au prochain mot.", "Você pode entrar na próxima palavra.")
    : game?.stage === "avatar" ? say("Mach ein Selfie oder spiele ohne Foto. Dein Bild erscheint auf dem Hauptbildschirm.", "Take a selfie or continue without a photo. Your picture appears on the shared screen.", "Tómate una selfi o continúa sin foto. Tu imagen aparecerá en la pantalla compartida.", "Prenez un selfie ou continuez sans photo. Votre image apparaîtra à l’écran partagé.", "Tire uma selfie ou continue sem foto. Sua imagem aparece na tela compartilhada.")
    : game?.stage === "clues" ? turn
      ? say("Nenne laut ein passendes Wort. Verrate den Begriff nicht. Bestätige danach unten.", "Say one related word out loud. Do not say the secret word. Then confirm below.", "Di una palabra relacionada en voz alta. No reveles la palabra secreta y confirma abajo.", "Dites un mot associé à voix haute sans révéler le mot secret, puis confirmez ci-dessous.", "Fale uma palavra relacionada em voz alta. Não revele a palavra secreta; depois confirme abaixo.")
      : say(`${currentName} ist dran. Hör gut zu.`, `${currentName} is speaking. Listen closely.`, `Habla ${currentName}. Escucha con atención.`, `${currentName} parle. Écoutez bien.`, `${currentName} está falando. Escute com atenção.`)
    : game?.stage === "voting" ? game.hasVoted
      ? say("Stimme abgegeben. Du kannst deine Auswahl ändern, bis alle abgestimmt haben.", "Vote submitted. You can change your choice until everyone has voted.", "Voto enviado. Puedes cambiarlo hasta que todos hayan votado.", "Vote envoyé. Vous pouvez changer votre choix jusqu’au vote de tout le monde.", "Voto enviado. Você pode mudar sua escolha até todo mundo votar.")
      : say("Nennt eure Hinweise und diskutiert. Tippe dann auf deinen Verdacht. Eine geheime Stimme; keine Selbstwahl.", "Share clues and discuss. Then tap the player you suspect. One secret vote; no self-votes.", "Compartan pistas y conversen. Luego elige a quién sospechas. Un voto secreto; no puedes votarte.", "Partagez les indices, discutez, puis choisissez votre suspect. Un vote secret, sans vote pour soi.", "Compartilhem pistas e conversem. Depois toque em quem você suspeita. Um voto secreto, sem votar em si.")
    : game?.stage === "imposter_guess" ? isImposter
      ? say("Gib den geheimen Begriff ein. Du hast einen Versuch und 30 Sekunden.", "Type the secret word. You have one guess and 30 seconds.", "Escribe la palabra secreta. Tienes un intento y 30 segundos.", "Saisissez le mot secret. Vous avez une réponse et 30 secondes.", "Digite a palavra secreta. Você tem um palpite e 30 segundos.")
      : say("Der Imposter darf einmal raten. Verrate den Begriff noch nicht.", "The Imposter has one chance to guess. Keep the word to yourself.", "El impostor tiene un intento. No le reveles la palabra.", "L’imposteur n’a qu’un essai. Ne lui révélez pas le mot.", "O impostor tem uma chance. Não revele a palavra.")
    : game?.resolvedReason ?? say("Schaut auf den Hauptbildschirm.", "Watch the shared screen.", "Mira la pantalla compartida.", "Regardez l’écran partagé.", "Acompanhe a tela compartilhada.");
  const connected = (state.room?.players ?? []).filter((player) => player.connected !== false);
  const ready = state.game?.phase === "finished" && onSetReady ? {
    currentPlayerReady: Boolean(connected.find(({ id }) => id === playerId)?.isReady ?? state.player?.isReady),
    readyCount: connected.filter(({ isReady }) => isReady).length, playerCount: connected.length,
    label: say("Bereit für den nächsten Begriff", "Ready for the next word", "Listo para la siguiente palabra", "Prêt pour le prochain mot", "Pronto para a próxima palavra"), language,
    onToggleReady: () => onSetReady(!Boolean(connected.find(({ id }) => id === playerId)?.isReady))
  } : undefined;
  return {
    kind: "social_party" as const, title: "Imposter", language, stage: stage as "avatar" | "vote" | "submit" | "waiting",
    statusLabel: spectator ? say("Nächste Runde", "Next round", "Siguiente ronda", "Manche suivante", "Próxima rodada") : labels[game?.stage ?? "avatar"], helperText,
    secret: game?.secretWord ? { label: say("Geheimer Begriff", "Secret word", "Palabra secreta", "Mot secret", "Palavra secreta"), term: game.secretWord }
      : game?.hint ? { label: say("Dein Hinweis", "Your hint", "Tu pista", "Votre indice", "Sua pista"), term: game.hint } : undefined,
    score: players.find(({ id }) => id === playerId)?.points ?? 0,
    taskKind: "text" as const, maxTextLength: 100, resetKey: `${game?.roundId ?? ""}:${stage}`,
    hasSubmitted: stage === "avatar" ? Boolean(game?.avatarSubmitted) : false,
    disabled: !inPlay || spectator, selectedId: game?.ownVote,
    choices: (game?.voteOptions ?? []).map((id) => ({ id, label: players.find((player) => player.id === id)?.name ?? id, avatar: players.find((player) => player.id === id)?.avatar })),
    actions: inPlay && game?.stage === "avatar" && !game.avatarSubmitted && !spectator
      ? [{ id: "skip", label: say("Ohne Foto weiterspielen", "Continue without photo", "Continuar sin foto", "Continuer sans photo", "Continuar sem foto"), onPress: () => send({ type: "imposter:skip_avatar" }) }]
      : inPlay && game?.stage === "clues" && turn
        ? [{ id: "clue", label: say("Hinweis gegeben →", "Clue given →", "Pista dada →", "Indice donné →", "Pista dada →"), onPress: () => send({ type: "submit_clue", turnIndex: game.currentTurnIndex }) }] : [],
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
