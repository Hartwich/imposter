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
  },
  es: {
    displayName: "Impostor", description: "Descubran quién está mintiendo mediante pistas y una votación.", visual: { eyebrow: "Farol" },
    lobbySetup: { title: "Configurar Impostor", fields: {
      category: { label: "Palabras", options: { standard: { label: "Familiar", description: "Palabras aptas para toda la familia." }, adult: { label: "18+", description: "Sexo, erotismo, malas palabras, relaciones y vida nocturna." }, all: { label: "Todas", description: "Mezcla de palabras familiares y para adultos." } } },
      hint: { label: "Dar una pista", description: "El impostor recibe una palabra relacionada, por ejemplo, condón → sexo." },
      confirmClues: { label: "Confirmar cada pista", description: "Desactivado: conversen libremente y voten. Activado: dos rondas de pistas, con confirmación después de cada una." }
    } }
  },
  fr: {
    displayName: "L’Imposteur", description: "Démasquez la personne qui bluffe grâce aux indices et au vote.", visual: { eyebrow: "Bluff" },
    lobbySetup: { title: "Configurer l’Imposteur", fields: {
      category: { label: "Mots", options: { standard: { label: "Tout public", description: "Mots adaptés à toute la famille." }, adult: { label: "18+", description: "Sexe, érotisme, gros mots, relations et sorties." }, all: { label: "Tous", description: "Mélange de mots tout public et adultes." } } },
      hint: { label: "Donner un indice", description: "L’imposteur reçoit un mot associé, par exemple préservatif → sexe." },
      confirmClues: { label: "Confirmer chaque indice", description: "Désactivé : discutez librement puis votez. Activé : deux tours d’indices, chacun confirmé." }
    } }
  },
  "pt-BR": {
    displayName: "Impostor", description: "Descubram quem está blefando com pistas e votação.", visual: { eyebrow: "Blefe" },
    lobbySetup: { title: "Configurar Impostor", fields: {
      category: { label: "Palavras", options: { standard: { label: "Para toda a família", description: "Palavras para toda a família." }, adult: { label: "18+", description: "Sexo, erotismo, palavrões, relacionamentos e vida noturna." }, all: { label: "Todas", description: "Mistura de palavras para toda a família e adultas." } } },
      hint: { label: "Dar uma pista", description: "O impostor recebe uma palavra relacionada, por exemplo, camisinha → sexo." },
      confirmClues: { label: "Confirmar cada pista", description: "Desativado: conversem livremente e votem. Ativado: duas rodadas de pistas, com confirmação após cada uma." }
    } }
  }
} as const satisfies LocalizedGameTextMap;
