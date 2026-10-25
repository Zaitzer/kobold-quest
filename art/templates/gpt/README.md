# Drawing with ChatGPT (25 Oct 2026)

Image AIs draw a character well but can't hold an exact pixel grid, so ChatGPT fills in a big template and
`tools/gpt-art.py` turns it into a row of the real sheet: it keys out the magenta, scales the four frames by one factor, stands
each on the feet line, snaps the colours to the game's palette, cleans stray pixels and draws the outline.

Each template here is one row of a sheet (`art/ASSETS.md`): four frames, each under its label (*1 stand, 2 step, 3 stand, 4 other
step* for walking), or the **turnaround** (the character standing still in all 8 directions, which also fills frame 1 of every
walking row). Start a new character with its turnaround, so every later row has the same character to copy.

## The prompt

Attach the template (and, after the first good one, the turnaround you got), then:

> Fill in this template with pixel-art game sprites of the same character in every frame. Draw exactly one character inside each
> magenta frame, under its label, doing what the label says, feet on the thin line near the bottom of the frame, the same size in
> every frame. Keep the magenta background, the white labels and the frame borders exactly as they are: no scenery, no shadows, no
> extra text.
>
> The character: [DESCRIPTION].
>
> Style: crisp pixel art like a modern indie RPG, hard pixel edges, no anti-aliasing, no blur, no gradients, about 16–24 colours,
> a dark outline. Chibi proportions: a big head, a compact body, limbs close to the body, so it fits a square frame.

For a left-facing row add: *"facing left. Draw it facing left, not mirrored: whatever the character holds stays in the same hand."*

**Pip** (the hero, any class): *Pip, a young kobold (small slim lizard-folk): a long snout with a lighter underjaw, yellow eyes, a
row of short spines down the back of the head (no horns), digitigrade legs, a thick tail that tapers and curls behind. Scales plain
orange (#F08A2A) with light orange highlights and darker orange-brown shadows; nothing else orange.* Then the class's outfit, for
the sorcerer: *a fitted purple tunic (#5A2EA6) with gold trim and belt, a red scarf, wrapped ankles, gold bracers; red and yellow
flames with white-hot cores in his hands.*

## Into the game

Download the PNG ChatGPT made (not a screenshot) and send it to Claude, or run:

    python3 tools/gpt-art.py slice FILLED.png art/characters/heroes/pip-classes/pip-sorcerer.png "battle idle, facing right"
    python3 tools/gpt-art.py slice FILLED.png art/characters/heroes/pip-classes/pip-sorcerer.png turnaround

`python3 tools/gpt-art.py templates` writes these templates again (after a change to the sheet types in `tools/assets.js`).
