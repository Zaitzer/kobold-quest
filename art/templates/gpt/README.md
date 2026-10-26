# Drawing with ChatGPT (25-26 Oct 2026)

ChatGPT draws a character's whole sheet from the description below; `tools/gpt-art.py cut` turns its picture into the game's sheet
(it finds the rows and frames itself, keys out the magenta and keeps every pixel ChatGPT drew). Frames are **128 × 128**.

## The description to paste

> A sprite sheet, 512 × 2048 pixels, on a solid pure-magenta (#FF00FF) background. A grid of 4 columns and 16 rows; every cell is
> exactly 128 × 128 pixels and holds one animation frame. No labels, no grid lines, no borders, no text, no shadows. The character
> stands in the middle of each cell with its feet about 8 pixels above the cell's bottom edge, the same size in every cell.
>
> The rows, top to bottom (walking rows: column 1 standing, 2 one foot forward, 3 standing, 4 the other foot forward):
> 1 walking toward the viewer (down); 2 walking down-right (3/4 view, front and right side); 3 walking right (side view);
> 4 walking up-right (3/4 view from behind, right side); 5 walking away from the viewer (up, back view); 6 walking up-left (3/4 view
> from behind, left side); 7 walking left (side view); 8 walking down-left (3/4 view, front and left side); 9 battle idle facing
> right (4 frames of a breathing loop); 10 attack facing right (wind-up, strike, follow-through, recover); 11 casting a spell facing
> right (raise, charge, release, lower); 12 facing right: hurt, knocked down lying on the ground, cheer with arms up, cheer jumping;
> 13 battle idle facing left; 14 attack facing left; 15 casting a spell facing left; 16 facing left: hurt, knocked down, cheer, cheer.
>
> Left-facing and left-walking rows are drawn as their own poses, not mirrored copies: anything the character holds stays in the
> same hand. Style: crisp pixel art like a modern indie RPG, hard pixel edges, no anti-aliasing, a dark outline.
>
> The character: [DESCRIPTION]

**Pip** (the hero, any class): *Pip, a young kobold (small slim lizard-folk): a long snout with a lighter underjaw, yellow eyes, a
row of short spines down the back of the head (no horns), digitigrade legs, a thick tail that tapers and curls behind. Scales plain
orange (#F08A2A) with light orange highlights and darker orange-brown shadows; nothing else orange* (the game recolours the orange to
the hero's colour), then the class's outfit.

ChatGPT tends to draw the left-facing battle rows (13-15) facing right; check them, or ask for those rows again on their own.

## Into the game

Download the PNG (not a screenshot) and send it to Claude, or run:

    python3 tools/gpt-art.py cut FILLED.png art/characters/heroes/pip-classes/pip-sorcerer.png
    python3 tools/gpt-art.py cut FILLED.png SHEET.png "attack, facing left"     # one row redrawn on its own (4 frames in a line)
