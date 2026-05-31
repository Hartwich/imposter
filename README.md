# Open Party Lab: Imposter

Imposter is an optional Open Party Lab game package. Players give clues, vote on the hidden Imposter, and give the Imposter one last chance to guess the secret word.

## Local Development

```bash
npm install
npm run typecheck
npm run build
```

For local Platform integration, run this in the Party Platform repo:

```bash
cd ../..
npm run games:sync-local
npm run dev:all
```

The Platform links only game repos that exist locally. If this repo is not present, Imposter is skipped.

## Public Entrypoints

```text
@open-party-lab/game-imposter/manifest
@open-party-lab/game-imposter/protocol
@open-party-lab/game-imposter/server
@open-party-lab/game-imposter/host
@open-party-lab/game-imposter/controller
```

