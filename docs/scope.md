# Kobaldia: scope and milestones (v2, 20 Oct 2026, for story v6)

*Step 1.8 of the roadmap, the last of pre-production.*

## Version 1.0 (for friends)

**In:**
- The whole story (v6): Hearthspire in the middle, five towns, five Smiler pieces plus the sixth in Mallow's book, the
  Ordeal, the march, the finale and the new hatching.
- Seven routes with their own foes and materials, each with a landmark, a joke and a side quest.
- Seven companions (one per deadly sin) with their quests; the twelve classes in two waves, each with two subclasses.
- Four challenge types for the five keepers; a guard boss per town; Snatchclaw and Glitterbeak.
- Raptors and boats as field moves.
- Fountains with respawn and fast travel; the shared world with co-op, level sync, shared boss credit, duels, gifts,
  the market, chat, yips, letters to Quill; phasing for the story scenes in Hearthspire.
- Joakim's drawings for the cast and monsters met in the story (tiles optional, code-drawn fallbacks stay).
- Music and sounds for every kind of place and every big moment (Hearthspire and the castle get their own).

**Out (later):**
- Post-game beyond a small taste (the islands' trials, Glitterbeak's hoard).
- Walking frames, portraits, drawn houses.
- Async notes on signs and gifts at fountains.
- Everything in "Before going public" in the tech plan; the public-release questions in `gate1-review.md` (B7).

## Milestones

Each milestone ends with Joakim and friends playing it. Order matters; dates don't. The rebuild is built on `main` (Gate 1, `design.md` §16.1);
`release/` and the Claude page are not rebuilt from it until the slice is ready.

| # | milestone | what's in it | gate |
|---|---|---|---|
| M1 | **Vertical slice** | Hearthspire act 1 (bakery, nest, Mallow, Bib, the hatching), the capital gate, R1 and Pebblebrook with the mine; class wave 1 (eight); Wizzle, Glint, Bork, Nugget; Grubb and Snipe; the tube and the raptors; fountains and fast travel; tile-targeting; phasing; the first drawings; slice music; balance. Merge to `main` and bump the save epoch | friends play it and say it's fun |
| M2 | **The desert** | R2 and Sunhaven (signs challenge, Saffi, the sight) | |
| M3 | **The ovens** | R3 and Emberreach (sequence challenge, Cinder, the igniter, Snatchclaw 1), class wave 2, the R4 bun road | |
| M4 | **Home** | the empty square, the castle, the Ordeal, the Reward, the flour tunnel | |
| M5 | **The cold** | R5 and Frostwick (build challenge, the draft camp, Wizzle rescued, Bork's quest, the fins) | |
| M6 | **The sea** | R6, R7 and Saltspray (ledger challenge, Crumb, boats, the ember chamber) | |
| M7 | **The march and the finale** | the follower line, the castle, Snatchclaw, Glitterbeak, the Smiler, the new hatching → **alpha** (everything in) | the whole story can be played |
| M8 | **Beta** | full playthroughs by friends, letters through Quill, balance, polish, the first ten minutes | nothing left a friend would stumble on |
| **1.0** | **Friends release** | | |
| 1.1 | **Public** | moderation, SQLite, off-site backups, error reports, a front page, the B7 questions | |
