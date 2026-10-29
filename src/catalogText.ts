import type { LocalizedGameTextMap } from "@open-party-lab/game-core";

export const imposterText = {
  "de": {
    "displayName": "Imposter",
    "description": "Finde den Bluffenden durch Hinweise und Abstimmung.",
    "visual": {
      "eyebrow": "Bluff"
    }
  },
  "en": {
    "displayName": "Imposter",
    "description": "Find the bluffing player through clues and a vote.",
    "lobbySetup": {
      "title": "Set up Imposter",
      "fields": {
        "category": {
          "label": "Words",
          "options": {
            "standard": {
              "label": "Family",
              "description": "Family-friendly words."
            },
            "adult": {
              "label": "18+",
              "description": "Sex, erotic themes, strong language, relationships and nightlife."
            },
            "all": {
              "label": "All",
              "description": "Family and adult words mixed together."
            }
          }
        },
        "hint": {
          "label": "Give a hint",
          "description": "The Imposter receives a related clue, for example condom → sex."
        },
        "confirmClues": {
          "label": "Confirm each clue",
          "description": "Off: discuss freely and vote directly. On: two clue rounds, with confirmation after each clue."
        }
      }
    },
    "visual": {
      "eyebrow": "Bluff"
    }
  }
} as const satisfies LocalizedGameTextMap;
