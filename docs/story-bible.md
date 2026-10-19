# Kobold Quest: story bible (draft)

*Step 1.3 of the roadmap. The who, where and how of the Hatching. The plot outline is in `story-hatching.md`; this file is
what a writer checks before writing any line. Items marked **Decide** need the creative director.*

## 1. Tone rules

1. **Cozy first.** Nobody dies. Bandits run away holding their bellies. The worst thing that happens is losing your shiny things.
2. **Jokes on every screen.** Every villager gets at least one line that's funny or odd. Signs are allowed to be silly.
3. **Kobolds are small and brave.** They overreact, they're proud of tiny things, they love shiny objects and snacks.
4. **The theme stays inside the fairy tale.** Nobody says "vote", "election", "party" or "politics". Characters show
   what happens when nobody chooses; they never tell the player what to think.
5. **Pip's frustration is fair.** The eggs really are a bit ugly. The story never mocks Pip for it.
6. **Short lines.** Two lines of dialogue is good, three is the most per page. A phone screen is small.
7. **Plain words.** Players may be young or reading in a second language. No archaic fantasy-speak.
8. **Everyone has a life first.** The central theme is *taking part in a democracy*, but most villagers have nothing to
   do with it: they have jobs, goats, feuds and lunch. The few who carry the theme do it through their own history and
   problems, never as a mouthpiece for one opinion. For those few, a writer asks: what do they carry, and how do they
   change (or why won't they)? If a scene only works as a lesson, it's cut.
9. **Three layers of why.** Every custom, place and villain has a reason, that reason has a reason, and that one has a
   reason too (see "The world underneath" in `story-hatching.md`). The player may never find layer 3, but it's there.

## 2. The world

- **Hearthspire** is the capital, in the middle of the map: marble streets, a castle, the Great Nest in the castle
  yard. Pip, Bib and the three guards live here. (Burrowhome is dropped.)
- **The whole country makes ember-buns together:** Mossbacks farm, millers grind, bakers use the volcano, riders on
  raptors carry everything, and every other town adds one ingredient or tool (see `story-hatching.md`).

- **The land** is called **Kobaldia**.
- Kobolds live in ten towns joined by fifteen routes. Each town has a **hearth**, a fire that has burned since the town
  was founded; a spark from it carries the town's say.
- Once a lifetime Burrowhome hatches a **guardian** dragon from one of three eggs in the **Great Nest**. The guardian
  watches over the whole land, not just Burrowhome.
- The last guardian, the **Old Guardian**, grew old and went to sleep on **Frostpeak**. That's why a new one is due.
- **Kobolds are cold-blooded**, which is why warmth matters so much to them: embers, hearths, sunny rocks, naps by the fire.
- **A dragon becomes like whatever warmed it.** That's the reason for the whole hatching custom.
- **The dragon king** ruled long ago, with kobolds as his hoard-keepers, until every town carried fire to his mountain on
  the same night. Every town's hearth was lit from that night's fire. Nobody alive remembers him; he's a nursery rhyme
  ("the king who ate the gold") and some faded murals.
- **Each town has its own way of deciding things**: a shift circle, guild councils, a fort meeting, gossip at the well.

## 3. The cast

### The heroes
| who | role | personality | first seen |
|---|---|---|---|
| **Pip** | the hero | small, stubborn, big stick, thinks every egg is ugly and keeps his ember; short lines of his own; grumpy all game, but what he does changes | Burrowhome |
| **Bork** | warrior, joins in Pebblebrook | speaks about himself in the third person; napped through the hatching and means to make up for it; loyal | Pebblebrook |
| **Wizzle** | mage, joins after Yarrow | Yarrow's over-eager grandson; too young for an ember and can't believe Pip kept his; ate the sandwich | Whisper Woods |

### Recruitable kobolds (one or two per town)
Each has a class, a personality and a small recruitment quest. They wait at any inn when not in the party.

| who | class | town | personality | how to recruit |
|---|---|---|---|---|
| **Nugget** | warrior | Copperhollow | cheerful miner, finds nuggets, asks lots of questions | after the shift circle |
| **Fennel** | cleric | Pebblebrook | a farm healer who talks to vegetables; walked to Burrowhome to warm the sleepy egg, which lost, and is cheerful about it | find her runaway goat on Route 1 |
| **Brass** | ranger | Thistledown | a bridge guard who has never left the bridge | help mend the bridge |
| **Saffi** | mage | Sunhaven | the oasis scribe's apprentice, reads everything twice | read the trail signs with her |
| **Cinder** | warrior | Emberreach | the hothead who wanted to smash the forge; calms down | after Emberreach is saved |
| **Pell** | cleric | Frostwick | a slow, careful snow-fort builder | win the snowball fight |
| **Mist** | ranger | Glimmerfen | believes rumours, then learns to check them | track down a rumour together |
| **Skipper Gull** | ranger | Saltspray | a retired smuggler with a soft heart | take her boat back from the bandits |

### How the party carries the story (decided 18 Oct 2026)
No loyalty missions. Instead, three cheap layers that fit short phone sessions:
1. **A personal want, not about eggs**, folded into each recruit's join quest and paid off later in passing:
   Fennel wants her goat to like her; Nugget wants his grandad's lost nugget; Brass has never seen the sea; Saffi wants
   to finish one book without starting another; Cinder wants to make something nobody laughs at; Pell wants to win one
   snowball fight; Mist wants one rumour that turns out true; Gull wants her boat back.
2. **Campfire banter** at inns (*built*: `data/banter.js`, "Sit by the fire" at any innkeeper; five chats so far): short chats between two party members, unlocked by travelling together. Opinions come
   out as arguments between friends, never speeches. First pairs: Cinder and Brass (smash it / keep it), Saffi and Bork
   (overthinking / napping), Wizzle and Tikka (wants an ember / threw hers away), Fennel and Nugget (snacks).
3. **One beat each at the second hatching**: every recruit decides whether to bring an ember, for their own reason.
   Most reasons are funny; one or two are touching.

### Mentors and villagers
- **Elder Mumble** (Burrowhome): kind, slow, eats the pebbles when counting. Explains the rhyme of the sparks.
- **Witch Yarrow** (Whisper Woods): sharp, warm, "an ember is a nudge, not a promise". Never gives anything back.
- **Granny Nettle**, **Pebble**, **Clink**, **Toast**, **Biscuit**, **Quill**: Burrowhome's regulars.
- **Farmer Turnip** (Pebblebrook), **Foreman Ruddle** and the four miners (Copperhollow): built in part 1.

### The rival
- **Tikka** (Burrowhome inn): quick, proud, a bit bossy. Kept her ember: "they're all just eggs." When Glitterbeak hatches
  she's furious, mostly at herself, and sets off to fix it alone and faster. Battles Pip three times (Thistledown,
  Frostwick, Mossmere). Her excuse is the last one Pip answers; after the third battle she brings her ember, and asks to
  join the roster as a ranger.

### The villains
- **Snatchclaw**: the bandit chief. Charming, a showman, laughs at his own jokes. He wants every shiny thing in the land,
  and a guardian who hoards for him. He planted the shiny egg. Not evil, just very, very greedy. Fought at Emberreach
  (escapes) and Brindlecove (final boss).
- **Glitterbeak**: the guardian who hatched wrong. Small at first, greedy, a magpie-dragon. The bandits feed him; he grows
  huge at Emberreach and goes on a rampage at Glimmerfen. **He is not evil**, just badly raised. At the second hatching
  he gets a second chance.
- **The bandits are kobolds**, Snatchclaw's crew, one ember each like everyone else; they win the hatching by all turning up. **The bandit crew:** **Grubb** (toll boss, mostly belly), **Snipe** (copper snatcher, cowardly), plus one new face per
  town (a bandit **quartermaster** in Thistledown, a **drainer** at the oasis, a **stoker** at the volcano).

### The Old Guardian
- An ancient, gentle dragon asleep on Frostpeak. Speaks slowly, remembers everyone's grandparents. Grounds Glitterbeak,
  and at the end asks Pip to help choose the next eggs.

## 4. The towns' troubles (in more steps, for a long story)

Each town is 3–5 steps, so a coffee break always ends a step.

| town | trouble | steps | lesson, shown | spark from |
|---|---|---|---|---|
| **Pebblebrook** | the dam lost by one stone; Grubb padlocks the fountain | talk to Turnip → fight Grubb → (side) Fennel's goat | one stone matters | Farmer Turnip |
| **Copperhollow** | nobody comes to the shift circle | talk to Ruddle → 4 miners → fight Snipe → (side) Nugget joins | showing up changes things | Foreman Ruddle |
| **Thistledown** | two guilds (bakers and millers) won't share the broken bridge; the bandit quartermaster steals the hearth jar | hear both guilds → find the quartermaster's hideout in the sewers → get both guilds to fix the bridge together → rival battle 1 | nobody's perfect; pick allies | both guild masters together |
| **Sunhaven** | bandits drain the oasis to polish the hoard; Saffi can't decide which trail leads to the drainer | read two trail signs side by side → cross the dunes → stop the drainer | you know enough to choose | the oasis scribe |
| **Emberreach** | Cinder wants to smash the forge because it's imperfect; Snatchclaw feeds Glitterbeak volcano fire | calm Cinder → climb the volcano → fight Snatchclaw (he escapes) → Glitterbeak flies off huge | smashing it all helps the bandits most | the forge master |
| **Frostwick** | the snow fort must be built before the storm; everyone has to agree on the plan | snowball fight with Pell → Pip watches and gets a snowball → he helps; his plan loses; he builds the winner anyway → rival battle 2 → the miners clear the Route 7 rockslide | ownership: taking part earns a real opinion (the town that pushes back on the hatching) | the fort |
| **Glimmerfen** | rumours spread in the fog; Glitterbeak's rampage starts and shiny things vanish | chase a rumour with Mist → find the truth → the rampage → climb Frostpeak to wake the Old Guardian | check before you choose | the fen witch |
| **Saltspray** | two bad harbour masters; smugglers know where the hideout is; bandits took Skipper Gull's boat | hear the fishers → win the smugglers' trust → take the boat back | bad and worse are still different | (no spark; it's the approach) |
| **Brindlecove** | Snatchclaw's hideout and the hoard | the hideout → final boss → the hoard goes home | | the island's hearth |
| **Mossmere** | the moss walls fail when the old gardener retires; Tikka's last battle | help with the walls → rival battle 3 → home to answer every stay-home | "fine" is kept fine by somebody | (the road home) |

## 5. The ending

The Great Nest is relit with eight sparks. This time the whole village brings embers: the nest crowd, Tikka, and Wizzle
with his very first one. Glitterbeak curls up in the nest, and the second hatching gives him a fresh start: still loves shiny things,
but now he guards them for everyone. The Old Guardian asks Pip to help pick next time's eggs: if every choice is ugly,
help make a better one. A fourth bowl, "none of these, try again", now sits by the nest, and it counts.

## 6. After the story

Post-game hooks: the Old Guardian's trials on Frostpeak, a bandit hunt for Snatchclaw's hidden stash, rare recruits,
harder bounties.

## 7. Decisions

1. **The land's name:** Kobaldia. *Decided.*
2. **Pip** has short lines of his own (a personality), like "They're all ugly. Why bother?" *Decided.*
3. **Glitterbeak** hatched from too few embers, is corrupt and must be beaten; he curls back into his egg and the country holds the hatching again, with the player choosing Pip's egg. *Decided 19 Oct 2026 (replaces the second chance).*
4. **Tikka** joins as a **ranger**. *Decided.*
5. **Recruits:** the eight above. *Decided.*
