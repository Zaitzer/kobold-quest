# The story: the Hatching (plan)

A fairy tale that runs through the whole region. Hidden inside it is a lesson about **choosing versus not choosing**:
when every option looks bad, not picking still lets someone else pick for you. It stays a metaphor. There are no votes,
parties, taxes or turnout numbers. Pip's "they're all ugly, why bother?" is treated as fair. The story never lectures;
it shows what happens. (A first draft, the Pebble Moot, used an election; it felt too political and was replaced.)

## Premise

Once in a lifetime Burrowhome hatches a **guardian**. Three eggs sit in the **Great Nest** on the green, and every kobold
warms the one they like best with an ember. The warmest egg hatches.

| egg | good side | bad side |
|---|---|---|
| **spiky** | brave, would guard the valley | hisses and bites |
| **sleepy** | gentle | snores through everything |
| **shiny** | dazzling | a bit *too* shiny (Snatchclaw's bandits planted it) |

Pip thinks they're all ugly and keeps his ember, like most of the village. Snatchclaw's bandits sit by the shiny egg all
night with a sack of embers, and out comes **Glitterbeak**: small, greedy, loves everything shiny. The bandits feed him
and put toll gates on the roads ("one shiny thing per kobold"). An old rhyme says that a guardian who hatches wrong can be
hatched again, if a **spark from every town's hearth** lights the Great Nest.

## The journey (hero's journey → places)

| # | step | where | what happens | gate / item |
|---|---|---|---|---|
| 1 | Ordinary world | Burrowhome | Hatching day; a sign on the green | |
| 2 | Call | Burrowhome | Elder Mumble gives Pip an ember | ember |
| 3 | Refusal | the Great Nest | The player chooses: warm the **spiky**, **sleepy** or **shiny** egg, or **keep the ember**. Every path works | |
| 4 | Mentor | Witch Yarrow's hut | "An ember isn't a promise to love the egg forever. It's a nudge." Wizzle joins | |
| 5 | Threshold | Burrowhome | Glitterbeak hatches; toll gates go up; the rhyme about sparks | toll gates on Routes 4, 5, 6, 12 |
| 6a | Tests | **Pebblebrook** (Route 1) | The dam was decided by one stone; Turnip's family of five stayed home. Grubb padlocks the fountain. *One stone matters* | spark 1, Bork joins |
| 6b | | **Copperhollow** (Route 3) | Nobody comes to the shift circle, so the foreman decides everything and Snipe takes half the copper. Bring 4 miners | spark 2, **lantern** |
| 6c | | **Thistledown** (Route 8 cave, dark without the lantern) | Two quarrelling guilds can only mend the bridge together. *Nobody's perfect, so you pick allies* | spark 3 |
| 6d | | **Sunhaven** (Route 9 desert) | *"I don't know enough to choose."* An oasis scribe teaches reading two trail signs side by side | spark 4, **water flask** |
| 6e | | **Emberreach** (Route 14, too hot without the flask) | A hothead wants to smash the town forge because it's imperfect. See where that leads | spark 5 |
| 6f | | **Frostwick** (Route 13 snowfield) | Everyone decides the snow fort together: slow but fair | spark 6, the rockslide on Route 7 is cleared |
| 6g | | **Glimmerfen** (Route 10 marsh) | Fog kobolds believe every rumour. *Check before you choose* | spark 7 |
| 7 | Approach | **Saltspray** (Route 11 shore) | Smugglers' talk: Snatchclaw's hideout is on Brindlecove | |
| 8 | Ordeal | **Brindlecove** (Route 15 bridges) | Boss fight: Snatchclaw at the hideout, Glitterbeak's hoard | spark 8 |
| 9 | Reward | Brindlecove | The toll gates come down | |
| 10 | Road back | **Mossmere** → Burrowhome (Routes 5, 2) | Convince 5 stay-home kobolds to bring their embers, each with an excuse (see below) | |
| 11 | Resurrection | Burrowhome | The Great Nest is relit. This time the whole village comes; Glitterbeak hatches again into a real guardian | |
| 12 | Return | Burrowhome | Mumbletoes the egg-keeper asks Pip to help pick next time's eggs: *if every choice is ugly, help make a better one* | reward + title |

### The five excuses (step 10)

- **"They're all the same."** → Pebblebrook: one stone decided the dam.
- **"My one ember doesn't matter."** → the bandits only needed one sack.
- **"I don't know enough."** → Sunhaven: compare two signs side by side, that's enough.
- **"Not picking is my way of saying no."** → nobody heard it; the bandits picked anyway.
- **"Smash it all."** → Emberreach.

Nobody can lose the story.

## How it's built

- **Flags** in `s.q` (internal names kept from the first draft): `moot` (stage), `vote` (`'spiky'|'sleepy'|'shiny'|'skip'`),
  `seals` (sparks), `pb`, `ch`, `miners`, `lantern`, and later `th`, `sh`, `er`, `fw`, `gf`, `bc`.
- **Barriers** (`BARRIERS` in `data/overworld.js`): toll gates `Y` (until `bc`), the Route 7 rockslide `R` (until `fw:3`),
  the dark tunnel `Z` on Route 8 (until `lantern`).
- **Town villagers** stand at spots from each town's square (`townSpot`) or inside its houses.
- **Fights:** Grubb (`tollboss`), Snipe (`collector`); later Snatchclaw as the final boss.
- **Tests:** `test/logic/hatching.test.js` plays it through and checks every barrier and villager.

## Delivery

1. **Opening + Pebblebrook + Copperhollow.** *Built.*
2. **Thistledown + Sunhaven + Emberreach.**
3. **Frostwick + Glimmerfen.**
4. **Saltspray + Brindlecove**, the boss and the last spark.
5. **The road back, the second hatching, the ending.**
