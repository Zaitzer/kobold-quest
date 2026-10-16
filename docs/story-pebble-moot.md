# Chapter 2: The Pebble Moot (plan)

A story that runs through the whole region. Its lesson is about **choosing versus not choosing**: when every option looks
bad, staying home still hands the choice to someone else. It stays out of real politics: no real parties, no left or
right, and no candidate stands for a real-world side. Pip's frustration ("trash or garbage, why bother?") is treated as
fair. The story never lectures; it shows what happens.

## Premise

Every few seasons the kobolds of Burrowhome choose a **Warden** by dropping pebbles in an urn at the **Pebble Moot**.
There are three candidates, and each is flawed in a different way:

| candidate | good side | bad side |
|---|---|---|
| **Gristle** | keeps the valley safe | wants a giant wall, taxes the mushroom farmers |
| **Mumbletoes** | kind and honest | so slow that nothing gets done |
| **Snatchclaw** | charming, great speeches | secretly friends with the bandits |

The chapter starts after King Vexx is beaten (`q.vexx`), so it works as chapter 2 for players who have finished the valley.
The region stays open to explore before that. The story only adds what happens there.

## The journey (hero's journey → places)

| # | step | where | what happens | gate / item |
|---|---|---|---|---|
| 1 | Ordinary world | Burrowhome | Moot posters everywhere; the candidates give speeches by the inn | |
| 2 | Call | Burrowhome | Elder Mumble gives Pip a voting pebble | item: **voting pebble** |
| 3 | Refusal | Burrowhome | The player chooses: **vote**, **blank pebble** (counted, says "none of you") or **skip**. Every path works; skipping is the default story | |
| 4 | Mentor | Witch Yarrow's hut | "A pebble isn't a love letter, it's a shove." | |
| 5 | Threshold | Burrowhome | Only 4 in 10 voted; Snatchclaw wins by 3 pebbles. Bandit tolls go up. Elder Mumble: a new Moot can be called with a **seal from every town** | toll gates on Route 4 and Route 12 |
| 6a | Tests | **Pebblebrook** (Route 1) | Farmers lost a field dispute by one pebble. *"My one pebble doesn't matter."* | seal 1 |
| 6b | | **Copperhollow** (Route 3) | Nobody comes to meetings, so the mine boss decides everything. Rally the miners | seal 2, **lantern** |
| 6c | | **Thistledown** (Route 8 cave, dark without the lantern) | Two quarrelling groups can only win together. *Nobody's perfect, so you pick allies* | seal 3 |
| 6d | | **Sunhaven** (Route 9 desert) | *"I don't know enough to choose."* An oasis scribe teaches comparing promises | seal 4, **water flask** |
| 6e | | **Emberreach** (Route 14, too hot and dry without the flask) | A hothead wants to burn everything down because "it's all trash". See where that leads | seal 5 |
| 6f | | **Frostwick** (Route 13 snowfield) | Everyone votes on everything: slow but fair | seal 6, **warm boots** |
| 6g | | **Glimmerfen** (Route 10 marsh) | Fog kobolds believe every rumour. *Check before you choose* | seal 7 |
| 7 | Approach | **Saltspray** (Route 11 shore) | Smugglers' talk: Snatchclaw's hideout is on Brindlecove | |
| 8 | Ordeal | **Brindlecove** (Route 15 bridges) | Boss fight: Snatchclaw's bandit captain at the hideout | seal 8 |
| 9 | Reward | Brindlecove | The petition is complete, and the toll gates come down | |
| 10 | Road back | **Mossmere** → Burrowhome (Routes 5, 2) | Side quests: convince 5 stay-home kobolds, each with an excuse (see below) | |
| 11 | Resurrection | Burrowhome | The new Moot. The winner wins by exactly the number of kobolds Pip convinced | |
| 12 | Return | Burrowhome | Mumbletoes asks Pip to help write the next promises: *if every choice is trash, help make a better one* | reward + title |

### The five excuses (step 10)

Each stay-home kobold gets one answer, drawn from what Pip learned:

- **"They're all the same."** → Pebblebrook: one pebble decided the field.
- **"My one pebble doesn't matter."** → the Moot itself: 3 pebbles.
- **"I don't know enough."** → Sunhaven: compare two promises, that's enough.
- **"Not voting is my protest."** → the blank pebble is counted; staying home isn't.
- **"Burn it all down."** → Emberreach.

If a player convinces fewer than all five, the Moot is still won, just more narrowly. Nobody can lose the chapter.

## How it's built

All of it uses what the game already has; the only new kinds of thing are toll gates and route barriers.

- **Flags** (in `s.q`, no save version change): `moot` (stage 0–12), `seals` (count), `vote` (`'yes'|'blank'|'skip'`),
  `convinced` (0–5), and one flag per town quest (`pb`, `ch`, `th`, `sh`, `er`, `fw`, `gf`, `bc`).
- **Barriers** come from a list in `data/overworld.js`: route, place, kind (`toll`, `dark`, `heat`, `snow`), and the flag
  that clears it. `makeWorldGrid` lays them across the full width of a route at a narrow spot, the same way the
  castle gate opens today. Each gets its own tile and drawing, and talking to it explains what is needed.
- **Town NPCs** stand at spots worked out from each town's square (`sites()`), or inside the town's lodge
  (`place:'h<letter>0'`), so they always stand on open ground. Dialogue is rules in `data/dialogue.js`, as today.
- **Quest log and top-bar line** get chapter 2 entries.
- **Fights:** new monster tables per route kind (bandits on the grass routes, cave critters on Route 8, sand
  skinks on the desert routes, frost beasts on the snowfield), scaled for parties of level 8 to 15. Snatchclaw's captain is
  a boss in `RP_BOSSES` with drops. Balance is checked with `test/sim`.
- **Rewards:** each seal gives XP and gold. The items (lantern, flask, boots) are key items. A final cosmetic
  hat, the "Warden's sash".

## Tests

- `test/logic/moot.test.js` plays the whole chapter headless: every barrier blocks before its flag and opens after, every
  NPC can be reached, all three vote choices reach the end, and the seal count and the Moot result add up.
- The overworld test checks that barriers sit on a route and cut it completely, and that nothing else gets cut off.
- One browser scenario: talk through the opening, walk to Pebblebrook, get the seal.

## Delivery (each part playable on its own)

1. **Opening + Pebblebrook + Copperhollow:** steps 1–6b, the toll gates and the cave darkness. *Built.*
2. **Thistledown + Sunhaven + Emberreach:** seals 3–5, the desert heat.
3. **Frostwick + Glimmerfen:** seals 6–7, snow.
4. **Saltspray + Brindlecove:** the boss and the last seal.
5. **The road back + the final Moot + epilogue.**
