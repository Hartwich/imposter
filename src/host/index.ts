import Phaser from "phaser";
import { imposterManifest } from "../manifest.js";
import { renderImposterState } from "./ImposterRenderer.js";

interface HostClientLike {
  subscribe(callback: (state: HostAppStateLike) => void): () => void;
}

interface HostAppStateLike {
  game?: {
    state?: unknown;
  } | null;
  room?: {
    language?: "de" | "en";
    players?: Array<{ id: string; name: string }>;
  } | null;
}

export class ImposterHostScene extends Phaser.Scene {
  private unsubscribe?: () => void;

  constructor() {
    super(imposterManifest.hostView);
  }

  create(): void {
    const client = this.registry.get("hostClient") as HostClientLike;

    this.unsubscribe = client.subscribe((state) => {
      const gameState = (state.game?.state ?? {}) as {
        stage?: string;
        category?: string;
        currentTurnPlayerId?: string;
        clueTurnsCompleted?: number;
        clueTurnsTotal?: number;
        voteCounts?: Array<{ playerId: string; playerName: string; votes: number }>;
        secretWord?: string;
        imposterRevealName?: string;
        imposterGuess?: string;
        imposterWon?: boolean;
        resolvedReason?: string;
        message?: string;
      };

      const playerNames = Object.fromEntries((state.room?.players ?? []).map((player) => [player.id, player.name]));

      this.children.removeAll(true);
      this.cameras.main.setBackgroundColor("#111827");
      renderImposterState(this, gameState, playerNames, state.room?.language);
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.unsubscribe?.();
      this.unsubscribe = undefined;
    });
  }
}

export const hostGame = {
  id: imposterManifest.id,
  displayName: imposterManifest.displayName,
  sceneKey: imposterManifest.hostView,
  scene: ImposterHostScene
} as const;
