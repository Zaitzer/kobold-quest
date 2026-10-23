# The slice's scenes, wired (generated)

*Written by `node tools/gen-data.js` from `tools/v6/scenes.js` (where and when each scene of `slice-dialogue.md` plays and what it does). Change the wiring there; the lines stay in `slice-dialogue.md`.*

| scene | where | when | does |
|---|---|---|---|
| 1.1 | new game | — | set {act:1} |
| 1.2 | room:cellar, on entering | {act:1} | fight rats1; fight rats2; chest Mallow's old box; give lamp; set {act:2,lamp:1} |
| 1.3 | hearthspire, talk to bib | {act:2} | set {bib1:1} |
| 1.4 | hearthspire, near 19.5,11 | {act:2,drill:0} | class; fight drill1; fight drill2; set {drill:1} |
| 1.5a | room:castle, on entering | {act:{gte:2},mural:0} | set {mural:1} |
| 1.5b | room:tower, on entering | {act:2,lamp:1} | set {lamp:2} |
| 1.5c | room:bakery, talk to mallow | {act:2,lamp:2} | set {act:3} |
| 1.6 | room:bakery, talk to mallow | {act:3,ember:0} | give ember; set {ember:1} |
| 1.7 | hearthspire, near 19.5,8.5 | {act:3,ember:1} | set {act:4} |
| 1.8 | hearthspire, bump near 19.5,8.5 | {act:4} | set {act:5} |
| 1.9 | room:bakery, talk to mallow | {act:5} | give bun; give book; join wizzle; join glint; set {act:6} |
| 1.11 | hearthspire, near 1,16 | {act:6,bork:0} | join bork; set {bork:1}; scene 1.12 |
| 1.12 | (follows the scene before) | — | fight gate; set {act:7} |
| 2.1a | r1, talk to goat | {goat:0} | set {goat:1} |
| 2.1b | pebblebrook, talk to clover | {goat:1} | give clover-ring; kind 2; set {goat:2} |
| 2.2 | r1, talk to tansy | {pb:{gte:2},miner_tansy:0} | fight lunch; choice: Give it back / Eat it; set {miner_tansy:1} |
| 3.1 | r1, near 93,9 | {act:7,pb:0} | set {pb:1} |
| 3.1b | pebblebrook, on entering | {pb:1,arrived:0} | set {arrived:1} |
| 3.2 | room:mill, talk to ruddle | {pb:1} | set {pb:2} |
| 3.3 | r1, near 93,9 | {pb:{gte:2,lte:3},grubb:0} | fight grubb; set {grubb:1} |
| 3.4 | pebblebrook, near 10,10 | {grubb:1,gbmill:0} | set {gbmill:1} |
| 3.5 | mine1, talk to nugget_mine | {nugget:0} | join nugget; set {nugget:1} |
| 3.5b | mine1, talk to ore | {pb:{gte:2},miner_ore:0,cart:0} | choice: Push the cart / Leave it |
| 3.5c | mine1, talk to ore | {cart:1,miner_ore:0} | set {miner_ore:1} |
| 3.6 | pebblebrook, talk to flint | {pb:{gte:2},stone:0} | set {stone:1} |
| 3.6x | pebblebrook, talk to grit | {pb:{gte:2},stone:0} | set {stone:1} |
| 3.6b | room:loft, the tile 5,2 | {stone:1} | chest the loft (needs the vote bag); set {stone:2,miner_brothers:1} |
| 3.7 | pebblebrook, talk to marl | {pb:{gte:2},marl:0} | set {marl:1} |
| 3.7b | room:mill, talk to ruddle | {marl:1} | set {marl:2} |
| 3.7c | pebblebrook, talk to marl | {marl:2} | set {marl:3,miner_marl:1} |
| 3.8 | pebblebrook, near 18,16 | {pb:2,miner_ore:1,miner_tansy:1,miner_brothers:1,miner_marl:1} | tint dusk; tint; set {pb:3} |
| 3.9 | mine3, near 24,15 | {pb:3} | fight snipe; set {pb:4} |
| 3.10 | r1, talk to grubb_road | {pb:4,nugget:1} | set {pb:5} |
| 3.11 | pebblebrook, near 18,16 | {pb:5} | scene 3.12 |
| 3.12 | (follows the scene before) | — | piece tube; kind 5; set {pb:6} |
| 3.14a | pebblebrook, talk to shaky | {ghost:0} | set {ghost:1} |
| 3.14b | room:mill, talk to chick | {ghost:1} | set {ghost:2} |
| 3.14c | pebblebrook, talk to clover | {seeds:0,goat:{ne:1}} | set {seeds:1} |
| 3.14d | pebblebrook, talk to board_pb | {bounty_pinch:0} | set {bounty_pinch:1,bounty_scout:1} |
| 3.14e | mine2, near 20,5 | {bounty_scout:1} | fight scoutboss; give gold; set {bounty_scout:2} |
| 3.14f | r1, near 60,12 | {bounty_pinch:1} | fight pinch; give gold; set {bounty_pinch:2} |

## Set pieces

| id | foes | board |
|---|---|---|
| rats1 | cellar_rat L1, cellar_rat L1, cellar_rat L1 (the hero alone) | cave |
| rats2 | cellar_rat L2 (big), cellar_rat L1, cellar_rat L1 (the hero alone) | cave |
| drill1 | guard_recruit L2, guard_recruit L2 (the hero alone) | town |
| drill2 | guard_recruit L3 (elite+tele), guard_recruit L2 (the hero alone) | town |
| gate | nettlenose_scout L3, nettlenose_scout L3, nettlenose_scout L3 | meadow |
| lunch | copper_beetle L4, copper_beetle L4, nettlenose_scout L4 | meadow |
| grubb | boss grubb | meadow |
| snipe | boss snipe | cave |
| pinch | copper_beetle L5 (elite), copper_beetle L5 | meadow |
| scoutboss | nettlenose_scout L7 (elite), nettlenose_scout L7, nettlenose_scout L7 | dark |
