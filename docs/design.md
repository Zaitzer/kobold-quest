# Kobold Quest: design document (draft)

*Step 1.2 of the roadmap. Built from the vision (`vision.md`) and what the prototype already does. Sections marked
**Decide** need the creative director.*

## 1. Core loop

- **Moment to moment (seconds):** walk, bump into things, talk, open, fight. Every tap does something.
- **Session (5–15 minutes, or an evening of them):** pick a goal from the top bar → travel a route (fights, finds) →
  reach a town → solve one step of its trouble → heal at the fountain → save. Every step of a town's trouble is a
  natural place to stop.
- **Long term:** sparks (8) → the second hatching. Alongside: levels, promotions, gear sets, the rival, side quests.

## 2. Exploring

- The region: 10 towns, 15 routes, each route its own kind of land (see the world plan, step 1.4).
- Key items open the map (lantern, flask, boots); the toll gates fall at the end.
- **Fast travel:** fountains you have drunk from let you warp to any other drunk-from fountain. Unlocked after the
  second spark so the early routes are walked at least once.
- **Finds:** chests, hidden items, side quests, signs with jokes. Every route should have at least one thing off the path.

## 3. Battles

- Small turn-based grid battles (already built): position, range, line of sight, skills that cost mana.
- Enemies per kind of land, getting tougher further from Burrowhome; bosses with their own tricks.
- You can always run from normal fights; bosses can be retried with no loss beyond the potions used.
- Losing sends you back to the last fountain you drank from, with half your gold (decided).

## 4. Party and growth

- Pip plus up to two others at a time, chosen from a **roster of recruitable kobolds** (decided). Bork and Wizzle are the
  first two; more can be met in towns, each with a class (warrior, ranger, mage, cleric), a personality and a small
  recruitment quest. Those not in the party wait at the inn and catch up in level slowly.
- Levels give a talent pick (3 offered). At level 10 a promotion: two paths per class (knight/berserker, sniper/scout,
  archmage/battlemage, and two for the cleric). The moon shrine resets talents for gold.
- Level range for the story: about 1 to 30 (a long story, see below).

## 5. Gear and crafting

- Slots: weapon, head, armour, cloak, shield, boots, neck, two rings. Item sets give bonuses.
- Monsters drop **materials** by land (moss, frost shards, spores, scrap, fangs...); Clink the smith crafts and later
  reforges. Every material must have a home on the map.
- Shops sell potions and basic gear; better gear comes from chests, bosses and crafting.

## 6. Economy

- Gold from fights, quests and bounties; spent on rest, potions, gear, crafting, shrine resets.
- The **market** lets players trade gear with each other (online only).
- No real money, ever.

## 7. Playing together

**Model: a shared world with personal stories** (a cozy MMO-lite, like Monster Hunter or Guild Wars), with a touch of
async co-op. *Decided.*

- **One shared world:** everyone online walks the same map at the same time; you see each other, chat and yip.
- **Personal stories:** each player has their own save and story progress. The world shows *your* progress: your
  tunnel can still be dark while a friend's is lit (barriers already work this way).
- **Group fights count for everyone who is ready:** a boss beaten together counts for each player who has reached that
  step of their own story (done the talking before it). Everyone else gets the normal rewards.
- **Level sync:** when you help a lower-level friend, your party is brought down to their level for that fight (stats
  worked out as if you were that level; gear and talents still work, scaled down). You still earn XP and loot suited to
  your real level, plus **helper's spark dust** (for cosmetics), so helping is fun rather than a favour.
- **Duels** for fun, **gifts** of items, the **market** for trading.
- **Async touches** for when nobody else is on: notes left on signs for friends, small gifts left at fountains.
- Playing together never blocks anyone's story, and nobody has to play with others.

## 8. Story and tone

- The Hatching (`story-hatching.md`): 8 towns' troubles, a villain thread, Tikka the rival, the Old Guardian.
- Cozy and funny; the lesson is shown, never preached; nothing political.

## 9. Difficulty and onboarding

- The first 10 minutes teach walking, talking, a first fight and a first level-up, with no walls of text.
- Normal difficulty should rarely lose a fight if you heal at fountains; bosses are the real tests.

## 10. Decisions

1. **Losing a fight:** back to the last fountain, lose half your gold. *Decided.*
2. **Shared story moments:** a shared world with personal stories; group boss fights count for everyone who is ready, with level sync for helpers (section 7). *Decided.*
3. **Party:** recruit more kobolds into a roster, take three along. *Decided.*
4. **Length:** long, 15+ hours. *Decided.* That means each town needs more than one step, every route needs something
   off the path, there are optional areas and a post-game. The 8 sparks stay the spine; the length comes from
   depth, not padding.

### 10.2 Shared story moments: the options that were weighed (B was chosen)

Friends play at different times and get to different points, so whatever we pick must work when they are out of step.

| option | how it works | good | bad |
|---|---|---|---|
| **A. Personal only** | helping a friend gives you XP, gold and loot, never story progress | simple; nobody skips their own story | helping feels like a chore; a friend ahead can't "carry" you through a hard boss |
| **B. Credit when you're ready** | a boss fight counts for everyone in it **who has reached that step** of their own story (done the talking before it). Others get the normal rewards | beating a boss together means something; the talking and puzzles are still your own | a strong friend can make your boss easy |
| **C. Shared save for a group** | a group of friends shares one story | true co-op adventure | breaks when someone plays alone; hard to build; saves get messy |
| **D. Echoes** | helping someone through a boss gives you an "echo": later, your own fight is easier (an ally appears, or the boss starts hurt) | rewards helping without skipping | more to build; harder to explain |

**Recommendation: B, plus a helper's reward.** Each player's story stays theirs (they still walk the routes, solve the
towns and read the jokes), but the big fights can be won together and count for everyone who is ready for them. The
friend who is further ahead and comes back to help gets a small reward for it (a "helper's spark dust" for cosmetics),
so helping is fun rather than a favour. Bosses already scale up with more players, so a strong friend helps without
making the fight trivial.
