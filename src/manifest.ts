import type { GameManifest } from "@open-party-lab/game-core";

const rules = {
  de: [
    { title: "Rollen & Hinweise", lines: ["Ein zufälliger Spieler ist der Imposter. Nur die Crew sieht den geheimen Begriff auf ihrem Handy.", "Mit Hinweisbestätigung nennt ihr reihum ein passendes Wort, zweimal pro Person. Ist sie aus, diskutiert ihr frei und könnt direkt voten. Den Begriff selbst nicht nennen.", "Mit ‚Hinweis geben‘ erhält der Imposter einen fest zugeordneten Hinweisbegriff: passend, aber ohne den geheimen Begriff zu verraten."] },
    { title: "Abstimmung & Sieg", lines: ["Alle stimmen geheim auf dem Handy für einen anderen Spieler ab. Eine Stimme pro Person, keine Selbstwahl. Du kannst deine Auswahl ändern, bis alle abgestimmt haben.", "Erst nach allen Stimmen wird das Ergebnis gezeigt. Bei Gleichstand oder falschem Verdacht gewinnt der Imposter.", "Wird der Imposter entlarvt, hat er 30 Sekunden und einen freien Worttipp. Ein korrekter Tipp stiehlt den Sieg."] },
    { title: "Punkte & nächste Runde", lines: ["Imposter-Sieg: +2 Punkte für den Imposter. Crew-Sieg: +1 Punkt pro Crew-Mitglied.", "Die Punkte gelten nur für dieses Spiel. Für den nächsten Begriff müssen alle wieder bereit sein; ‚automatisch bereit‘ ist optional.", "Ein Spielerfoto ist freiwillig. Später beigetretene Spieler spielen ab dem nächsten Begriff mit."] }
  ],
  en: [
    { title: "Roles & clues", lines: ["One random player is the Imposter. Only the crew sees the secret word on their phone.", "With clue confirmation enabled, take turns saying one related word, twice per player. Otherwise, discuss freely and vote directly. Do not say the secret word.", "With hints enabled, the Imposter gets one curated association for the word, without revealing the secret word."] },
    { title: "Voting & victory", lines: ["Everyone secretly votes for another player on their phone. One vote each; no self-votes. You can change your choice until everyone has voted.", "Results appear after all votes. A tie or a wrong suspect lets the Imposter win.", "An exposed Imposter gets 30 seconds and one free-text word guess. A correct guess steals the win."] },
    { title: "Points & next round", lines: ["Imposter victory: +2 for the Imposter. Crew victory: +1 per crew member.", "Points belong only to this game. Everyone must ready up for the next word; automatic readiness is optional.", "Player photos are optional. Late joiners play from the next word."] }
  ]
} as const;

export const imposterManifest = {
  id: "imposter",
  displayName: "Imposter",
  description: "Finde den Bluffenden durch Hinweise und Abstimmung.",
  minPlayers: 3,
  maxPlayers: 20,
  hostView: "ImposterHostScene",
  controllerView: "imposter",
  controllerLayout: "social_party",
  supportsTeams: false,
  scoreScope: "game",
  lobbySetup: {
    title: "Imposter einrichten",
    fields: [
      { kind: "select", id: "category", settingKey: "imposterWordCategory", label: "Begriffe", defaultValue: "standard",
        options: [
          { id: "standard", label: "U18", description: "Familienfreundliche Begriffe.", rules },
          { id: "adult", label: "Ü18", description: "Sex, Erotik, Schimpfwörter, Beziehungen und Nachtleben.", rules },
          { id: "all", label: "Alle", description: "U18 und Ü18 gemischt.", rules }
        ] },
      { kind: "toggle", id: "hint", settingKey: "imposterGiveHint", label: "Hinweis geben",
        description: "Der Imposter erhält einen passenden Hinweisbegriff, z. B. Kondom → Sex.", onValue: "on", offValue: "off", defaultValue: "off" },
      { kind: "toggle", id: "confirmClues", settingKey: "imposterConfirmClues", label: "Hinweis gegeben bestätigen",
        description: "Aus: frei diskutieren und direkt voten. An: zwei Hinweisrunden mit Bestätigung pro Person.", onValue: "on", offValue: "off", defaultValue: "on" }
    ]
  },
  estimatedRoundDurationMs: 120_000,
  roundCompletionMode: "wait_for_ready",
  phaseDurations: {
    roundIntroMs: 1_600,
    countdownMs: 2_200,
    resultMs: 6_000,
    scoreboardMs: 5_000
  },

  ownsScreens: ["round_intro", "result"],
  hostChrome: { hud: false, roomCode: false },
  controllerChrome: { bare: true, hideScore: true },
  visual: { accent: "#8a7aa8", icon: "mask", eyebrow: "Bluff" },
  audio: { track: { profile: "mystery", bpm: 98, rootMidi: 46, masterGain: 0.11 } },
} as const satisfies GameManifest;

export const manifest = imposterManifest;

