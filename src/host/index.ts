import type { HostGame, HostGameStateSource, SupportedLanguage } from "@open-party-lab/game-core";
import { imposterManifest } from "../manifest.js";
import type { ImposterPublicState } from "../protocol.js";
import { hostStyles } from "./styles.js";
interface HostState {
  game?: { phase?: string; roundNumber?: number; state?: unknown } | null;
  room?: { language?: SupportedLanguage; pausedBy?: unknown; players?: Array<{ id: string; isReady?: boolean; connected?: boolean }> } | null;
}
const el = (tag: string, className?: string, value?: string): HTMLElement => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (value !== undefined) node.textContent = value;
  return node;
};
export function mountImposterHost(input: unknown, source: HostGameStateSource): () => void {
  const root = input as HTMLElement;
  const style = el("style"); style.textContent = hostStyles;
  root.classList.add("imposter-mount");
  let lastKey = "";
  let latest: HostState | null = null;
  let timerMs: number | null = null;
  let timerAt = performance.now();
  let previousGame: HostState["game"];
  let paused = false;
  const updateTimer = () => {
    const clock = root.querySelector<HTMLElement>(".imp-timer");
    if (!clock || timerMs === null) return;
    const left = Math.max(0, timerMs - (paused ? 0 : performance.now() - timerAt));
    clock.textContent = `${Math.ceil(left / 1000)} s`;
  };
  const draw = (app: HostState) => {
    latest = app;
    const game = app.game?.state as ImposterPublicState | undefined;
    const nextPaused = Boolean(app.room?.pausedBy);
    if (app.game !== previousGame) {
      timerMs = game?.remainingMs ?? null;
      timerAt = performance.now(); previousGame = app.game;
    } else if (paused !== nextPaused) {
      if (!paused && timerMs !== null) timerMs = Math.max(0, timerMs - (performance.now() - timerAt));
      timerAt = performance.now();
    }
    paused = nextPaused;
    const phase = app.game?.phase;
    const language = app.room?.language ?? "de";
    const t = (de: string, en: string, es: string, fr: string, pt: string) => ({ de, en, es, fr, "pt-BR": pt })[language];
    const connected = (app.room?.players ?? []).filter(({ connected }) => connected !== false);
    const ready = connected.filter(({ isReady }) => isReady).length;
    const key = JSON.stringify([game, phase, language, ready]);
    if (key === lastKey) { updateTimer(); return; }
    lastKey = key;
    const shell = el("main", `imp-host${game?.stage === "resolved" ? " is-result" : ""}`);
    const top = el("header", "imp-top");
    top.append(el("strong", "imp-brand", "Imposter"), el("span", undefined, `${t("RUNDE", "ROUND", "RONDA", "MANCHE", "RODADA")} ${app.game?.roundNumber ?? 1}`));
    const body = el("section", "imp-body");
    const heading = el("div", "imp-heading");
    const intro = phase === "round_intro" || phase === "countdown";
    let kicker = t("EINER VON EUCH BLUFFT", "ONE OF YOU IS BLUFFING", "ALGUIEN ESTÁ FAROLEANDO", "L’UN DE VOUS BLUFFE", "ALGUÉM ESTÁ BLEFANDO");
    let title = t("Vertrau deinem Gefühl.", "Trust your instinct.", "Confía en tu intuición.", "Faites confiance à votre instinct.", "Confie na sua intuição.");
    let helper = t("Schau auf dein Handy. Halte deine Rolle geheim.", "Watch your phone. Keep your role secret.", "Mira tu celular. Mantén tu rol en secreto.", "Regardez votre téléphone. Gardez votre rôle secret.", "Olhe para o celular. Mantenha seu papel em segredo.");
    if (intro) {
      title = t("Wer ist der Imposter?", "Who is the Imposter?", "¿Quién es el impostor?", "Qui est l’imposteur ?", "Quem é o impostor?");
      helper = game?.confirmClues === false
        ? t("Nennt Hinweise, diskutiert und stimmt auf dem Handy ab.", "Share clues, discuss and vote on your phone.", "Compartan pistas, conversen y voten en el celular.", "Partagez des indices, discutez et votez sur votre téléphone.", "Compartilhem pistas, conversem e votem no celular.")
        : t("Zwei Hinweisrunden. Eine geheime Stimme. Findet den Bluff.", "Two clue rounds. One secret vote. Find the bluff.", "Dos rondas de pistas. Un voto secreto. Descubran el farol.", "Deux tours d’indices. Un vote secret. Démasquez le bluff.", "Duas rodadas de pistas. Um voto secreto. Descubram o blefe.");
    } else if (game?.stage === "avatar") {
      kicker = t("EURE SPIELERFOTOS", "YOUR PLAYER PHOTOS", "FOTOS DEL GRUPO", "VOS PHOTOS", "FOTOS DA GALERA");
      title = t("Gebt dem Bluff ein Gesicht.", "Give the bluff a face.", "Pónganle cara al farol.", "Donnez un visage au bluff.", "Deem um rosto ao blefe.");
      helper = t("Macht auf dem Handy ein Selfie oder spielt ohne Foto weiter.", "Take a selfie on your phone or continue without a photo.", "Tómate una selfi o continúa sin foto.", "Prenez un selfie ou continuez sans photo.", "Tire uma selfie ou continue sem foto.");
    } else if (game?.stage === "clues") {
      kicker = `${t("HINWEISRUNDE", "CLUE ROUND", "RONDA DE PISTAS", "TOUR D’INDICES", "RODADA DE PISTAS")} ${Math.floor(game.currentTurnIndex / game.clueOrder.length) + 1} / 2`;
      const name = game.players.find(({ id }) => id === game.currentTurnPlayerId)?.name ?? "…";
      title = t(`${name}, du bist dran.`, `${name}, your turn.`, `${name}, te toca.`, `${name}, à vous.`, `${name}, é sua vez.`);
      helper = t("Nennt ein passendes Wort, ohne den Begriff zu verraten. Bestätigt danach auf dem Handy.", "Say one related word. Do not reveal the secret word. Confirm on your phone.", "Di una palabra relacionada sin revelar la secreta. Confirma en tu celular.", "Dites un mot associé sans révéler le mot secret. Confirmez sur votre téléphone.", "Fale uma palavra relacionada sem revelar a secreta. Confirme no celular.");
    } else if (game?.stage === "voting") {
      kicker = t("GEHEIME ABSTIMMUNG", "SECRET VOTE", "VOTO SECRETO", "VOTE SECRET", "VOTO SECRETO");
      title = t("Wer blufft?", "Who is bluffing?", "¿Quién está faroleando?", "Qui bluffe ?", "Quem está blefando?");
      helper = t("Besprecht euren Verdacht und stimmt auf dem Handy ab. Die Stimmen bleiben bis zur letzten Abgabe geheim.", "Discuss, then vote on your phone. The results stay hidden until everyone has voted.", "Conversen y voten en el celular. El resultado queda oculto hasta que todos voten.", "Discutez puis votez sur votre téléphone. Les résultats restent cachés jusqu’au dernier vote.", "Conversem e votem no celular. O resultado fica oculto até todo mundo votar.");
    } else if (game?.stage === "vote_reveal") {
      kicker = t("EURE ABSTIMMUNG", "THE VOTE", "VOTACIÓN", "LE VOTE", "VOTAÇÃO");
      const suspected = game.players.find(({ id }) => id === game.voteResultPlayerId)?.name ?? "…";
      title = game.voteTied ? t("Gleichstand.", "A tie.", "Empate.", "Égalité.", "Empate.")
        : t(`${suspected} steht unter Verdacht.`, `${suspected} is suspected.`, `Se sospecha de ${suspected}.`, `${suspected} est soupçonné·e.`, `${suspected} está sob suspeita.`);
      helper = game.voteTied ? t("Niemand wird entlarvt. Der Imposter entkommt.", "Nobody is exposed. The Imposter escapes.", "Nadie queda expuesto. El impostor escapa.", "Personne n’est démasqué. L’imposteur s’échappe.", "Ninguém foi descoberto. O impostor escapa.")
        : t("Alle Stimmen sind gezählt. Lag euer Gefühl richtig?", "Your votes have been counted. Was your instinct right?", "Ya contamos los votos. ¿Tenían razón?", "Les votes sont comptés. Votre intuition était-elle bonne ?", "Os votos foram contados. A intuição estava certa?");
    } else if (game?.stage === "imposter_guess") {
      kicker = t("DIE LETZTE CHANCE", "THE LAST CHANCE", "ÚLTIMA OPORTUNIDAD", "DERNIÈRE CHANCE", "ÚLTIMA CHANCE");
      const name = game.players.find(({ id }) => id === game.imposterRevealId)?.name ?? "…";
      title = t(`${name} ist der Imposter.`, `${name} is the Imposter.`, `${name} es el impostor.`, `${name} est l’imposteur.`, `${name} é o impostor.`);
      helper = t("Ein Worttipp auf dem Handy. Verratet die Lösung noch nicht.", "One word guess on the phone. Keep the answer secret until then.", "Un intento de palabra en el celular. No revelen la respuesta todavía.", "Un seul essai sur le téléphone. Gardez la réponse secrète jusque-là.", "Um palpite no celular. Não revelem a resposta ainda.");
    } else if (game?.stage === "resolved") {
      kicker = game.imposterWon ? t("DER IMPOSTER GEWINNT", "THE IMPOSTER WINS", "GANA EL IMPOSTOR", "L’IMPOSTEUR GAGNE", "O IMPOSTOR VENCE") : t("DIE CREW GEWINNT", "THE CREW WINS", "GANA LA TRIPULACIÓN", "L’ÉQUIPAGE GAGNE", "A TRIPULAÇÃO VENCE");
      title = game.secretWord ?? "";
      const name = game.players.find(({ id }) => id === game.imposterRevealId)?.name ?? "…";
      helper = `${t("Imposter", "Imposter", "Impostor", "Imposteur", "Impostor")}: ${name}. ${game.resolvedReason ?? ""}`;
    }
    heading.append(el("p", "imp-kicker", kicker), el("h1", "imp-title", title), el("p", "imp-helper", helper));
    if (!intro && (game?.stage === "avatar" || game?.stage === "voting")) heading.append(el("p", "imp-progress", `${game.submittedCount} / ${game.playerCount} ${t("abgegeben", "submitted", "enviado", "envoyé", "enviado")}`));
    if (game?.stage === "imposter_guess" || game?.stage === "vote_reveal") heading.append(el("strong", "imp-timer", ""));
    if (game?.stage === "resolved" && game.imposterGuess) heading.append(el("p", "imp-guess", `${t("Worttipp", "Word guess", "Intento", "Réponse", "Palpite")}: ${game.imposterGuess}`));
    body.append(heading);
    const grid = el("section", "imp-board");
    grid.setAttribute("aria-label", t("Spieler und Spielpunkte", "Players and game points", "Jugadores y puntos", "Joueurs et points", "Jogadores e pontos"));
    const players = game?.players ?? [];
    const count = players.length;
    // Fit a bounded grid to the actual host surface instead of a fixed canvas.
    const width = root.clientWidth || 1280;
    const height = root.clientHeight || 720;
    const availableHeight = Math.max(140, height * .59);
    let cols = 1, best = 0;
    for (let candidate = 1; candidate <= Math.min(10, count); candidate++) {
      const rows = Math.ceil(count / candidate);
      const size = Math.min((width - 96 - (candidate - 1) * 18) / candidate, (availableHeight - (rows - 1) * 18) / rows * .8);
      if (size > best) { best = size; cols = candidate; }
    }
    const rows = Math.max(1, Math.ceil(count / cols));
    grid.style.setProperty("--cols", String(cols)); grid.style.setProperty("--rows", String(rows));
    grid.style.setProperty("--card-width", `${Math.max(1, Math.min(290, best))}px`);
    grid.classList.toggle("is-dense", count > 10);
    players.forEach((player, index) => {
      const active = !intro && game?.stage === "clues" && player.id === game.currentTurnPlayerId;
      const exposed = player.id === game?.imposterRevealId;
      const suspect = player.id === game?.voteResultPlayerId;
      const card = el("article", `imp-photo${active ? " is-active" : ""}${exposed ? " is-imposter" : ""}${suspect ? " is-suspect" : ""}`);
      card.style.setProperty("--tilt", `${[-2, 1.5, -.8, 2, -1.4][index % 5]}deg`);
      card.style.setProperty("--i", String(index));
      if (player.avatar) {
        const photo = document.createElement("img"); photo.className = "imp-portrait"; photo.src = player.avatar; photo.alt = player.name;
        card.append(photo);
      } else card.append(el("div", "imp-portrait imp-placeholder", player.name.slice(0, 1).toLocaleUpperCase()));
      const votes = game?.voteCounts.find(({ playerId }) => playerId === player.id)?.votes ?? 0;
      if (game && ["vote_reveal", "imposter_guess", "resolved"].includes(game.stage)) card.append(el("span", "imp-ballot", `${votes} ${t(votes === 1 ? "Stimme" : "Stimmen", votes === 1 ? "vote" : "votes", votes === 1 ? "voto" : "votos", votes === 1 ? "vote" : "votes", votes === 1 ? "voto" : "votos")}`));
      if (active || exposed) card.append(el("span", "imp-role", exposed ? t("Imposter", "Imposter", "Impostor", "Imposteur", "Impostor") : t("Am Zug", "Your turn", "Tu turno", "À vous", "Sua vez")));
      const caption = el("footer", "imp-caption");
      caption.append(el("strong", "imp-name", player.name), el("b", "imp-points", `${player.points} ${t("Pkt", "pt", "pts", "pts", "pts")}`));
      card.append(caption);
      if (game?.stage === "resolved" && player.delta) card.append(el("span", "imp-delta", `+${player.delta}`));
      grid.append(card);
    });
    body.append(grid);
    const bottom = el("footer", "imp-footer");
    bottom.append(el("span", undefined, t("Spielpunkte · Imposter +2 / Crew +1", "Game points · Imposter +2 / Crew +1", "Puntos · Impostor +2 / Tripulación +1", "Points · Imposteur +2 / Équipage +1", "Pontos · Impostor +2 / Tripulação +1")),
      el("span", undefined, phase === "finished" ? t(`${ready} / ${connected.length} bereit für den nächsten Begriff`, `${ready} / ${connected.length} ready for the next word`, `${ready} / ${connected.length} listos para la siguiente palabra`, `${ready} / ${connected.length} prêts pour le prochain mot`, `${ready} / ${connected.length} prontos para a próxima palavra`)
        : game?.stage === "resolved" ? t("Danach: auf dem Handy bereit melden", "Next: ready up on your phone", "Siguiente: confirma desde tu celular", "Ensuite : confirmez sur votre téléphone", "Depois: confirme pelo celular") : t("Haltet eure Rolle geheim.", "Keep your role secret.", "Mantengan su rol en secreto.", "Gardez votre rôle secret.", "Mantenham seu papel em segredo.")));
    shell.append(top, body, bottom); root.replaceChildren(style, shell); updateTimer();
  };
  const unsubscribe = (source as HostGameStateSource<HostState>).subscribe(draw);
  const initial = (source as HostGameStateSource<HostState>).getState(); if (initial) draw(initial);
  const resize = new ResizeObserver(() => { if (latest) { lastKey = ""; draw(latest); } }); resize.observe(root);
  const ticker = window.setInterval(updateTimer, 200);
  return () => { unsubscribe(); resize.disconnect(); window.clearInterval(ticker); root.replaceChildren(); root.classList.remove("imposter-mount"); };
}
export const hostGame = { id: imposterManifest.id, displayName: imposterManifest.displayName, mountDom: mountImposterHost } satisfies HostGame;
