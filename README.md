# Kobold Quest

A sideways tactical RPG for the phone, played together on one shared server. Live at https://joakimskar.no.

* `src/`, `styles/`, `index.html`: the game (ES modules, built into one page). See [ARCHITECTURE.md](ARCHITECTURE.md).
* `server/`: the game server (accounts, the shared world, market, saves).
* `release/`: the built server the live machine runs. **Pushing a change to `release/` on `main` deploys it**:
  the server checks GitHub every 2 minutes and reinstalls when `release/` changed.
* `deploy/`: first-time server setup (`cloud-init.yaml`, `bootstrap.sh`) and the installer.

```
npm i && (cd server && npm i)
node test/run.js        # all tests
node tools/package.js   # build the game and refresh release/
```
