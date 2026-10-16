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

## Four threads (borrowed from Pokémon Ruby/Emerald)

1. **The spine: 8 sparks**, one per town, like the gym badges. Each town has its own trouble, and fixing it earns the spark.
2. **The villain thread: Snatchclaw's bandits.** They start as a joke (Grubb's padlock), grow into thieves, then wake
   something they can't control. Snatchclaw shows himself halfway, escapes, and is fought for real at the end.
3. **The rival: Tikka**, the girl at the inn who said "they're all just eggs" and kept her ember. She sets off to
   gather sparks on her own, to prove she can fix things faster without anyone's help. She turns up every few towns for
   a battle and grows stronger each time. In the end she is the last stay-home kobold who brings her ember.
4. **Key items open the map**, like Surf and the other field moves: the lantern (dark tunnel), the water flask (desert
   heat), warm boots (the frozen peak), and the toll gates fall with Snatchclaw.

## The journey (hero's journey → places)

| # | step | where | spine | villain thread | rival | opens |
|---|---|---|---|---|---|---|
| 1 | Ordinary world | Burrowhome | Hatching day | Snatchclaw's "friends" loiter by the nest | Tikka: "they're all just eggs" | |
| 2 | Call | Burrowhome | Elder Mumble's ember | | | |
| 3 | Refusal | the Great Nest | warm the **spiky**, **sleepy** or **shiny** egg, or **keep the ember** | someone giggles behind the nest | | |
| 4 | Mentor | Yarrow's hut | "An ember is a nudge, not a promise." Wizzle joins | | | |
| 5 | Threshold | Burrowhome | the rhyme about sparks | **Glitterbeak hatches**; toll gates go up | Tikka leaves to do it "her way" | |
| 6a | Tests | **Pebblebrook** (Route 1) | the dam lost by one stone. *One stone matters* | Grubb padlocks the fountain (comic) | | spark 1, Bork joins |
| 6b | | **Copperhollow** (Route 3) | nobody comes to the shift circle | Snipe takes half the copper for the hoard | | spark 2, **lantern** |
| 6c | | **Thistledown** (Route 8, dark tunnel) | two quarrelling guilds mend the bridge together. *Pick allies* | bandits raid the town hall and steal the hearth jar | **rival battle 1** at the tunnel mouth | spark 3 |
| 6d | | **Sunhaven** (Route 9 desert) | *"I don't know enough to choose"*: read two trail signs side by side | bandits drain the oasis to polish the hoard | | spark 4, **water flask** |
| 6e | | **Emberreach** (Route 14, hot) | a hothead wants to smash the forge because it's imperfect | **Snatchclaw in person** feeds Glitterbeak volcano fire. He grows huge and flies off. Snatchclaw escapes | | spark 5 |
| 6f | | **Frostwick** (Route 13 snowfield) | the snow fort: everyone decides together, slow but fair | Glitterbeak's shadow passes over the town | **rival battle 2** | spark 6, **warm boots**, Route 7 rockslide cleared |
| 6g | | **Glimmerfen** (Route 10 marsh) | fog kobolds believe every rumour. *Check before you choose* | **the crisis:** Glitterbeak's rampage starts; every shiny thing in the land is vanishing | | spark 7 |
| 6h | | **Frostpeak** (back up past Frostwick, boots needed) | the climb to the **Old Guardian**, last generation's dragon, asleep on the peak | wake her; she grounds Glitterbeak | | |
| 7 | Approach | **Saltspray** (Route 11 shore) | the harbour | smugglers say the hideout is on Brindlecove | | |
| 8 | Ordeal | **Brindlecove** (Route 15 bridges) | | **boss: Snatchclaw** and the hoard | | spark 8; the toll gates fall |
| 9 | Reward | Brindlecove | the hoard goes back to every town | | | |
| 10 | Road back | **Mossmere** → Burrowhome (Routes 5, 2) | convince the stay-home kobolds (below) | | **rival battle 3**: Tikka at Mossmere, at her strongest. Afterwards she brings her ember | |
| 11 | Resurrection | Burrowhome | the Great Nest is relit; this time the whole village comes, and Glitterbeak hatches again into a real guardian | | | |
| 12 | Return | Burrowhome | the Old Guardian asks Pip to help choose next time's eggs: *if every choice is ugly, help make a better one* | | | reward + title |

### The five excuses (step 10)

- **"They're all the same."** → Pebblebrook: one stone decided the dam.
- **"My one ember doesn't matter."** → the bandits only needed one sack.
- **"I don't know enough."** → Sunhaven: compare two signs side by side, that's enough.
- **"Not picking is my way of saying no."** → nobody heard it; the bandits picked anyway. (Tikka's excuse; she is the last to be convinced.)
- **"Smash it all."** → Emberreach.

Nobody can lose the story.

## How it's built

- **Flags** in `s.q` (internal names kept from the first draft): `moot` (stage), `vote` (`'spiky'|'sleepy'|'shiny'|'skip'`),
  `seals` (sparks), `pb`, `ch`, `miners`, `lantern`, and later `th`, `sh`, `er`, `fw`, `gf`, `bc`.
- **Barriers** (`BARRIERS` in `data/overworld.js`): toll gates `Y` (until `bc`), the Route 7 rockslide `R` (until `fw:3`),
  the dark tunnel `Z` on Route 8 (until `lantern`).
- **Town villagers** stand at spots from each town's square (`townSpot`) or inside its houses.
- **Fights:** Grubb (`tollboss`), Snipe (`collector`); later three Tikka rival fights (a party that levels with the story), Snatchclaw at Emberreach (he flees) and Brindlecove (final boss).
- **Frostpeak:** a small new area above Route 13, reached with the warm boots.
- **Tests:** `test/logic/hatching.test.js` plays it through and checks every barrier and villager.

## Delivery

1. **Opening + Pebblebrook + Copperhollow.** *Built.*
2. **Thistledown + Sunhaven + Emberreach:** rival battle 1, the first Snatchclaw encounter.
3. **Frostwick + Glimmerfen + Frostpeak:** rival battle 2, the crisis, the Old Guardian.
4. **Saltspray + Brindlecove**, the boss and the last spark.
5. **The road back:** rival battle 3, the second hatching, the ending.
