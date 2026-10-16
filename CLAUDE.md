# Working on Kobold Quest

- Owner: Joakim (GitHub Zaitzer). He plays on his phone; keep replies short and do the technical work yourself.
- Read ARCHITECTURE.md before changing code. After moving code between modules run `node tools/imports.js`.
- Before every push: `npm i && (cd server && npm i)`, then `node test/run.js` must pass, then `node tools/package.js` to refresh `release/`.
- Deploying = committing `release/` to `main`. The live server (joakimskar.no) pulls every 2 minutes.
  Check it went live with https://joakimskar.no/status (its `build` field matches `release/server/BUILD`).
- The same code also builds the Claude artifact page (dist/kobold-quest.html), published at
  https://claude.ai/artifact/Qs7Wi9o685We4R8s6rkzPY. Keep save format, room topic `kq` and db paths compatible.
- Never commit secrets. Player data lives only on the server (/var/lib/kobold-quest), never in the repo.
