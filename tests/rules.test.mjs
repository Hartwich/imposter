import assert from "node:assert/strict";
import { test } from "node:test";
import { serverGame, normalizeGuess } from "../dist/server/index.js";
import { getWords } from "../dist/server/words.js";
import { hintCatalog } from "../dist/server/hintCatalog.js";
import { buildImposterControllerModel } from "../dist/controller/index.js";
const players = ["a", "b", "c", "d"].map((id) => ({ id, name: id.toUpperCase(), connected: true, color: "#fff", score: 999, isReady: false }));
function fixture(settings = {}) {
  const context = { players, now: 1000, roundNumber: 1, language: "de", theme: "light", roomCode: "TEST", deltaMs: 0,
    selectedGame: serverGame.manifest, previousRound: null, roomSettings: settings };
  let state = serverGame.startRound(serverGame.createInitialState(context), context);
  state = { ...state, imposterPlayerId: "a", secretWord: "Regenschirm", clueOrder: ["a", "b", "c", "d"] };
  return { context, state };
}
function input(state, context, playerId, fields) {
  return serverGame.handleInput(state, { playerId, roundId: state.roundId, sentAt: 0, ...fields }, context);
}
function clues(state, context) {
  for (const player of players) state = input(state, context, player.id, { type: "imposter:skip_avatar" });
  assert.equal(state.stage, "clues");
  for (let i = 0; i < 8; i++) state = input(state, context, state.clueOrder[i % 4], { type: "submit_clue", turnIndex: i });
  assert.equal(state.stage, "voting");
  return state;
}
function vote(state, context, targets) {
  players.forEach(({ id }, i) => { state = input(state, context, id, { type: "vote_player", suspectPlayerId: targets[i] }); });
  return state;
}
function afterReveal(state, context) { return serverGame.tick(state, 0, { ...context, now: state.finishAt }); }

test("role privacy: only crew sees the word; host, spectator and Imposter never get it before resolution", () => {
  const { context, state: initial } = fixture({ imposterGiveHint: "on" });
  let state = clues(initial, context);
  for (const stage of ["avatar", "clues", "voting", "vote_reveal", "imposter_guess"]) {
    const candidate = { ...state, stage };
    const host = serverGame.toPublicState(candidate, context);
    assert.equal(host.secretWord, undefined);
    assert.equal(host.category, undefined);
    assert(!JSON.stringify(host).includes("Regenschirm"));
    for (const id of ["a", "outsider"]) {
      const controller = serverGame.toControllerStateForPlayer(candidate, context, id);
      assert.equal(controller.secretWord, undefined);
      assert.equal(controller.imposterGuessOptions, undefined);
      assert(!JSON.stringify(controller).includes("Regenschirm"));
    }
    assert.equal(serverGame.toControllerStateForPlayer(candidate, context, "b").secretWord, stage === "avatar" ? undefined : "Regenschirm");
  }
  assert.equal(serverGame.toControllerStateForPlayer({ ...state, stage: "resolved" }, context, "a").secretWord, "Regenschirm");
});

test("curated word hints are opt-in, private, bilingual and do not leak answers", () => {
  const { context, state: initial } = fixture({ imposterGiveHint: "on" });
  const state = clues(initial, context);
  assert(serverGame.toControllerStateForPlayer(state, context, "a").hint);
  assert.equal(serverGame.toControllerStateForPlayer(state, context, "b").hint, undefined);
  assert.equal(serverGame.toPublicState(state, context).hint, undefined);
  assert.equal(fixture().state.hint, undefined);
  for (const language of ["de", "en"]) for (const pool of ["standard", "adult", "all"]) {
    const words = getWords(language, pool);
    for (const word of words) {
      assert(word.word && word.hints.length === 1, `${word.word}: exactly one curated hint`);
      if (language === "de") assert(!/\s/.test(word.hints[0].label), word.word);
      for (const hint of word.hints) {
        assert(!normalizeGuess(hint.label).includes(normalizeGuess(word.word)), `${word.word}: answer leaked in hint`);
        assert(hint.id && hint.label);
        assert.equal(new Set(word.hints.map(({ id }) => id)).size, word.hints.length);
      }
    }
  }
  assert.equal(serverGame.toPublicState(state, context).recentHintIds, undefined);
  assert.equal(serverGame.toControllerStateForPlayer(state, context, "a").recentHintIds, undefined);
});

test("every source word has one fixed bilingual hint and assignments contain no stale words", () => {
  const words = getWords("de", "all");
  assert.deepEqual(words.find(({ id }) => id === "kamera").hints.map(({ label }) => label), ["Foto"]);
  const ids = new Set(words.map(({ id }) => id));
  for (const id of hintCatalog.keys()) assert(ids.has(id), id);
  assert.equal(hintCatalog.size, words.length);
  for (const word of words) {
    assert.equal(word.hints[0].id, getWords("en", "all").find(({ id }) => id === word.id).hints[0].id);
  }
});

test("448 distinct bilingual words, age-pool separation and valid lobby settings", () => {
  for (const language of ["de", "en"]) {
    const standard = getWords(language, "standard"), adult = getWords(language, "adult"), all = getWords(language, "all");
    assert.equal(standard.length, 288); assert.equal(adult.length, 160); assert.equal(all.length, 448);
    assert.equal(new Set(all.map(({ id }) => id)).size, all.length);
    assert(standard.every((word) => !word.adult)); assert(adult.every((word) => word.adult));
    assert.equal(getWords(language, "bad").length, standard.length);
  }
  assert.deepEqual(serverGame.handleHostAction(null, { type: "configure-lobby", category: "adult", hint: "on" }).roomSettings,
    { imposterWordCategory: "adult", imposterGiveHint: "on" });
  assert.equal(serverGame.handleHostAction(null, { type: "configure-lobby", category: "bad", hint: true }), null);
});

test("explicit adult vocabulary stays out of U18 and uses specific associations", () => {
  for (const language of ["de", "en"]) {
    const standard = getWords(language, "standard"), adult = getWords(language, "adult");
    for (const id of ["orgasmus", "dildo", "kondom", "arschloch", "fickdich", "bdsm"]) {
      assert(!standard.some((word) => word.id === id));
      assert(adult.some((word) => word.id === id));
    }
    const de = getWords("de", "adult");
    assert.deepEqual(de.find(({ id }) => id === "kondom").hints.map(({ label }) => label), ["Sex"]);
    assert.deepEqual(de.find(({ id }) => id === "vibrator").hints.map(({ label }) => label), ["Sexspielzeug"]);
    assert(!getWords(language, "all").some((word) => word.hints.some(({ label }) => ["Umgebung", "Freizeit", "Erwachsenenalltag"].includes(label))));
  }
});

test("direct voting skips clue confirmations independently of the private Imposter hint", () => {
  assert.deepEqual(serverGame.handleHostAction(null, { type: "configure-lobby", confirmClues: "off" }).roomSettings, { imposterConfirmClues: "off" });
  assert.equal(serverGame.handleHostAction(null, { type: "configure-lobby", confirmClues: true }), null);
  const toggle = serverGame.manifest.lobbySetup.fields.find(({ id }) => id === "confirmClues");
  assert.equal(toggle.defaultValue, "on");
  for (const hint of ["off", "on"]) {
    const { context, state: initial } = fixture({ imposterConfirmClues: "off", imposterGiveHint: hint });
    let state = initial;
    assert.equal(state.stage, "avatar");
    assert.equal(input(state, context, "a", { type: "vote_player", suspectPlayerId: "b" }), state);
    for (const { id } of players) state = input(state, context, id, { type: "imposter:skip_avatar" });
    assert.equal(state.stage, "voting"); assert.equal(state.confirmClues, false);
    assert.equal(input(state, context, "a", { type: "submit_clue", turnIndex: 0 }), state);
    assert.equal(serverGame.toControllerStateForPlayer(state, context, "a").secretWord, undefined);
    assert.equal(Boolean(serverGame.toControllerStateForPlayer(state, context, "a").hint), hint === "on");
    assert.equal(serverGame.toControllerStateForPlayer(state, context, "b").secretWord, "Regenschirm");
    const model = buildImposterControllerModel({ state: { room: { language: "de", players }, player: { id: "b" }, game: { phase: "playing", state: serverGame.toControllerStateForPlayer(state, context, "b") } }, onInput() {} });
    assert.equal(model.stage, "vote"); assert.deepEqual(model.actions, []); assert.equal(model.choices.length, 3);
    const partial = input(state, context, "a", { type: "vote_player", suspectPlayerId: "b" });
    assert.deepEqual(serverGame.toPublicState(partial, context).voteCounts, []);
    assert.equal(vote(state, context, ["b", "a", "a", "a"]).stage, "vote_reveal");
    const next = serverGame.createInitialState({ ...context, roundNumber: 2, previousRound: { gameId: "imposter", phase: "finished", state } });
    assert.equal(next.stage, "voting");
    const restored = serverGame.createInitialState({ ...context, roomSettings: { imposterConfirmClues: "on" }, previousRound: { gameId: "imposter", phase: "finished", state } });
    assert.equal(restored.stage, "clues");
    // Both tick-based avatar paths must use the same configured transition.
    const done = { ...initial, avatarDone: Object.fromEntries(players.map(({ id }) => [id, true])) };
    assert.equal(serverGame.tick(done, 0, context).stage, "voting");
    const offline = { ...context, now: 2000, players: players.map(p => ({ ...p, connected: p.id !== "d" })) };
    const waiting = serverGame.tick({ ...done, avatarDone: { a: true, b: true, c: true } }, 0, offline);
    assert.equal(waiting.stage, "avatar");
    assert.equal(serverGame.tick(waiting, 0, { ...offline, now: 32000 }).stage, "voting");
  }
});

test("profile avatars work with both legacy and current player summaries", () => {
  const { context } = fixture();
  const profiles = players.map((player) => ({ ...player, avatar: `photo-${player.id}` }));
  const full = serverGame.createInitialState({ ...context, players: profiles });
  assert.equal(full.stage, "clues");
  assert.deepEqual(full.avatars, { a: "photo-a", b: "photo-b", c: "photo-c", d: "photo-d" });
  const partial = serverGame.createInitialState({ ...context, players: [profiles[0], players[1], { ...players[2], avatar: null }, { ...players[3], avatar: "" }] });
  assert.equal(partial.stage, "avatar");
  assert.deepEqual(partial.avatars, { a: "photo-a" });
  assert.deepEqual(partial.avatarDone, { a: true });
  const legacy = serverGame.createInitialState(context);
  assert.equal(legacy.stage, "avatar"); assert.deepEqual(legacy.avatars, {});
});

test("photos optional, invalid uploads rejected, completed setup carried into next word", () => {
  const { context, state } = fixture();
  assert.equal(input(state, context, "a", { type: "imposter:avatar", media: "javascript:alert(1)" }), state);
  assert.equal(input(state, context, "a", { type: "imposter:avatar", media: "data:image/jpeg;base64," + "a".repeat(36000) }), state);
  const done = clues(state, context);
  const next = serverGame.createInitialState({ ...context, now: 2000, roundNumber: 2, previousRound: { gameId: "imposter", phase: "finished", state: done } });
  assert.equal(next.stage, "clues");
});

test("turn order and round/turn guards reject early, stale and duplicate submissions", () => {
  const { context, state: initial } = fixture();
  let state = initial;
  players.forEach(({ id }) => { state = input(state, context, id, { type: "imposter:skip_avatar" }); });
  assert.equal(input(state, context, "b", { type: "submit_clue", turnIndex: 0 }), state);
  assert.equal(input(state, context, "a", { type: "submit_clue", turnIndex: 0, roundId: "old" }), state);
  const next = input(state, context, "a", { type: "submit_clue", turnIndex: 0 });
  assert.equal(next.currentTurnIndex, 1);
  assert.equal(input(next, context, "a", { type: "submit_clue", turnIndex: 0 }), next);
});

test("votes can change until everyone votes; only the latest choice counts and ballots stay private", () => {
  const { context, state: initial } = fixture();
  let state = clues(initial, context);
  for (const [id, target] of [["a", "a"], ["a", "outsider"], ["outsider", "a"]]) assert.equal(input(state, context, id, { type: "vote_player", suspectPlayerId: target }), state);
  state = input(state, context, "a", { type: "vote_player", suspectPlayerId: "b" });
  assert.equal(input(state, context, "a", { type: "vote_player", suspectPlayerId: "b" }), state);
  state = input(state, context, "a", { type: "vote_player", suspectPlayerId: "c" });
  assert.equal(state.stage, "voting");
  assert.equal(serverGame.toPublicState(state, context).submittedCount, 1);
  assert.equal(input(state, context, "a", { type: "vote_player", suspectPlayerId: "a" }), state);
  assert.equal(input(state, context, "a", { type: "vote_player", suspectPlayerId: "outsider" }), state);
  assert.deepEqual(serverGame.toPublicState(state, context).voteCounts, []);
  assert.equal(serverGame.toControllerStateForPlayer(state, context, "b").votesByPlayer, undefined);
  assert.equal(serverGame.toControllerStateForPlayer(state, context, "b").ownVote, undefined);
  assert.equal(serverGame.toControllerStateForPlayer(state, context, "a").ownVote, "c");
  for (const id of ["b", "c"]) state = input(state, context, id, { type: "vote_player", suspectPlayerId: "a" });
  assert.equal(state.stage, "voting"); assert.deepEqual(serverGame.toPublicState(state, context).voteCounts, []);
  // The shared phone layout uses hasSubmitted to disable vote buttons.
  const messages = [];
  const model = buildImposterControllerModel({ state: { room: { language: "de", players }, player: { id: "a" }, game: { phase: "playing", state: serverGame.toControllerStateForPlayer(state, context, "a") } }, onInput: (message) => messages.push(message) });
  assert.equal(model.stage, "vote"); assert.equal(model.hasSubmitted, false);
  assert.equal(model.disabled, false); assert.equal(model.selectedId, "c");
  model.onVote("d");
  assert.equal(messages.at(-1).suspectPlayerId, "d");
  state = input(state, context, "a", messages.at(-1));
  state = input(state, context, "d", { type: "vote_player", suspectPlayerId: "a" });
  assert.equal(state.stage, "vote_reveal"); assert.equal(serverGame.toPublicState(state, context).voteCounts[0].votes, 3);
  assert.deepEqual(serverGame.toPublicState(state, context).voteCounts, [{ playerId: "a", votes: 3 }, { playerId: "d", votes: 1 }]);
  assert.equal(input(state, context, "a", { type: "vote_player", suspectPlayerId: "b" }), state);
});

test("ties expose nobody and the Imposter wins", () => {
  const { context, state: initial } = fixture();
  const voted = vote(clues(initial, context), context, ["b", "a", "a", "b"]);
  assert(voted.voteTied); assert.equal(voted.voteResultPlayerId, undefined);
  const result = afterReveal(voted, context);
  assert.equal(result.stage, "resolved"); assert(result.imposterWon);
  assert.deepEqual(serverGame.buildScore(result).map(({ playerId, delta }) => [playerId, delta]), [["a", 2]]);
});

test("wrong suspect resolves as an Imposter win", () => {
  const { context, state: initial } = fixture();
  const result = afterReveal(vote(clues(initial, context), context, ["b", "c", "b", "b"]), context);
  assert.equal(result.stage, "resolved"); assert(result.imposterWon);
});

test("caught Imposter gets one free-text guess; wrong actor, empty input and duplicate rejected", () => {
  const { context, state: initial } = fixture();
  const guess = afterReveal(vote(clues(initial, context), context, ["b", "a", "a", "a"]), context);
  assert.equal(guess.stage, "imposter_guess");
  assert.equal(input(guess, context, "b", { type: "guess_word", guessWord: "Regenschirm" }), guess);
  assert.equal(input(guess, context, "a", { type: "guess_word", guessWord: " " }), guess);
  const result = input(guess, context, "a", { type: "guess_word", guessWord: " REGENSCHIRM " });
  assert(result.imposterWon); assert.equal(input(result, context, "a", { type: "guess_word", guessWord: "falsch" }), result);
  const wrong = input(guess, context, "a", { type: "guess_word", guessWord: "falsch" });
  assert(!wrong.imposterWon); assert.equal(serverGame.buildScore(wrong).length, 3);
  assert.equal(normalizeGuess("Zähneputzen"), normalizeGuess("Zaehneputzen"));
});

test("guess timer expires; result stays for eight seconds before readiness gate", () => {
  const { context, state: initial } = fixture();
  const guess = afterReveal(vote(clues(initial, context), context, ["b", "a", "a", "a"]), context);
  assert.equal(guess.finishAt - 6000, 30000);
  const lateGuess = input(guess, { ...context, now: guess.finishAt }, "a", { type: "guess_word", guessWord: "Regenschirm" });
  assert.equal(lateGuess.stage, "resolved"); assert(!lateGuess.imposterWon);
  const result = serverGame.tick(guess, 0, { ...context, now: guess.finishAt });
  assert.equal(result.stage, "resolved"); assert(!result.imposterWon);
  assert(!serverGame.isRoundFinished(result, { ...context, now: result.finishAt - 1 }));
  assert(serverGame.isRoundFinished(result, { ...context, now: result.finishAt }));
});

test("game points persist without room points; no repeat until pool exhausted; auto-ready survives", () => {
  const { context, state: initial } = fixture();
  let state = afterReveal(vote(clues(initial, context), context, ["b", "a", "a", "b"]), context);
  state = input(state, context, "b", { type: "set_auto_continue", enabled: true });
  assert.equal(serverGame.toPublicState(state, context).players.find(({ id }) => id === "a").points, 2);
  // Emulate the platform's single commit in gameTransitionService.
  const gameScores = Object.fromEntries(serverGame.buildScore(state).map(({ playerId, delta }) => [playerId, delta]));
  const finished = { ...state, phase: "finished", gameScores };
  assert.equal(serverGame.toPublicState(finished, context).players.find(({ id }) => id === "a").points, 2);
  const next = serverGame.createInitialState({ ...context, now: 3000, roundNumber: 2, previousRound: { gameId: "imposter", phase: "finished", state: finished } });
  assert.equal(next.gameScores.a, 2); assert(next.autoContinueByPlayer.b);
  assert.notEqual(next.wordId, state.wordId); assert.equal(next.usedWordIds.length, 2);
  assert.equal(serverGame.manifest.scoreScope, "game"); assert.equal(serverGame.manifest.roundCompletionMode, "wait_for_ready");
  const reset = serverGame.createInitialState({ ...context, previousRound: { gameId: "other", phase: "finished", state: finished } });
  assert.deepEqual(reset.gameScores, {});
});

test("disconnect grace prevents deadlocks and permits a reconnect before timeout", () => {
  const { context, state: initial } = fixture();
  const state = clues(initial, context);
  const offline = { ...context, now: 2000, players: players.map((p) => ({ ...p, connected: p.id !== "d" })) };
  let next = serverGame.tick(state, 0, offline);
  for (const id of ["a", "b", "c"]) next = input(next, offline, id, { type: "vote_player", suspectPlayerId: id === "a" ? "b" : "a" });
  assert.equal(next.stage, "voting");
  assert.equal(serverGame.tick(next, 0, { ...offline, now: 31999 }).stage, "voting");
  assert.equal(serverGame.tick(next, 0, { ...offline, now: 32000 }).stage, "vote_reveal");
  const rejoined = serverGame.tick(next, 0, { ...context, now: 2500 });
  assert.deepEqual(rejoined.disconnectedAt, {});
  const imposterOffline = { ...context, now: 2000, players: players.map((p) => ({ ...p, connected: p.id !== "a" })) };
  const waiting = serverGame.tick(state, 0, imposterOffline);
  assert(!serverGame.tick(waiting, 0, { ...imposterOffline, now: 32000 }).imposterWon);
});

test("controller shows readiness and auto-ready, crew card, photo vote choices and free-text guess", () => {
  const { context, state: initial } = fixture();
  let state = clues(initial, context);
  const messages = [], readiness = [];
  const model = (id, candidate = state, phase = "playing") => buildImposterControllerModel({ state: {
    room: { language: "de", players }, player: { id }, game: { phase, state: serverGame.toControllerStateForPlayer(candidate, context, id) }
  }, onInput: (input) => messages.push(input), onSetReady: (ready) => readiness.push(ready) });
  assert.equal(model("a").secret, undefined); assert.equal(model("b").secret.term, "Regenschirm");
  const ballot = model("b"); assert.equal(ballot.stage, "vote"); assert(!ballot.choices.some(({ id }) => id === "b"));
  ballot.onVote("a"); assert.equal(messages.at(-1).roundId, state.roundId);
  state = afterReveal(vote(state, context, ["b", "a", "a", "a"]), context);
  assert.equal(model("a").stage, "submit"); assert.equal(model("a").taskKind, "text");
  const finished = model("a", { ...state, stage: "resolved" }, "finished");
  assert(finished.ready); finished.autoReady.onReady(); assert.deepEqual(readiness, [true]);
  finished.autoReady.onChange(true); assert.equal(messages.at(-1).type, "set_auto_continue");
});
