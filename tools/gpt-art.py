"""Art made with an image AI (ChatGPT; 25-26 Oct 2026). The AI draws a whole sprite sheet (or one row of it) on magenta from the
description in art/templates/gpt/README.md; it can't keep an exact grid, so this tool finds the frames itself: the rows are the
bands of drawing between empty magenta lines, the frames of a row the bands across it. Each frame keeps every pixel the AI drew
(26 Oct, Joakim: "use all the pixels"): the magenta and its fringe are keyed out, the character stands on the feet line, centred
where its column was. A frame only shrinks if it is bigger than the sheet's frame, and then the whole sheet shrinks by one factor.

    python3 tools/gpt-art.py cut FILLED.png SHEET.png                  # a whole sheet (as many rows as the sheet has)
    python3 tools/gpt-art.py cut FILLED.png SHEET.png "walk down"      # one row (4 frames) into that row
    python3 tools/gpt-art.py cut FILLED.png SHEET.png turnaround       # 8 standing directions (2 rows of 4): frame 1 of each walk
    add --kind hero|villager|foe|boss when SHEET is outside art/ (the kind is read from the folder otherwise)

ROW is a row's name as in art/ASSETS.md without the bracket ("walk down-right", "attack, facing left"). Rows not cut are kept.
"""
import json, os, re, subprocess, sys
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), '..')
SHEET = json.loads(subprocess.check_output(['node', '-e', "console.log(JSON.stringify(require('./tools/assets.js').SHEET))"], cwd=ROOT))


def rows_of(kind):
    return [re.sub(r' \([^)]*\)', '', r[0]) for r in SHEET[kind]['rows']]   # 'walk (a patrol on the map), facing right' -> 'walk, facing right'


def magenta(c):
    """the background and the blend at its edge (the AI softens the outline into the magenta)"""
    r, g, b = c[:3]
    return (r > 140 and b > 140 and g < 120 and abs(r - b) < 90) or (r > 80 and b > 80 and g < 0.55 * min(r, b) and abs(r - b) < 60)


def bands(profile, gap):
    out, start = [], None
    for i, v in enumerate(profile + [0]):
        if v and start is None:
            start = i
        if not v and start is not None:
            out.append([start, i])
            start = None
    merged = []
    for b in out:   # a gap narrower than `gap` is inside a frame (between a flame and its hand, say)
        if merged and b[0] - merged[-1][1] < gap:
            merged[-1][1] = b[1]
        else:
            merged.append(b)
    return merged


def frames(img, n_rows):
    """the frames of a filled picture: [row][column] -> (box, figure with the magenta keyed out)"""
    rgb = img.convert('RGB')
    W, H = rgb.size
    px = rgb.load()
    mask = [[0 if magenta(px[x, y]) else 1 for x in range(W)] for y in range(H)]
    rows = bands([sum(r) for r in mask], 6)
    while len(rows) > n_rows:   # join the closest bands until the count is right
        g = [rows[i + 1][0] - rows[i][1] for i in range(len(rows) - 1)]
        i = g.index(min(g))
        rows[i][1] = rows[i + 1][1]
        del rows[i + 1]
    if len(rows) != n_rows:
        sys.exit('found %d rows of drawing, expected %d' % (len(rows), n_rows))
    out = []
    for y0, y1 in rows:
        cols = bands([sum(mask[y][x] for y in range(y0, y1)) for x in range(W)], 14)
        while len(cols) > 4:
            g = [cols[i + 1][0] - cols[i][1] for i in range(len(cols) - 1)]
            i = g.index(min(g))
            cols[i][1] = cols[i + 1][1]
            del cols[i + 1]
        row = []
        for c, (x0, x1) in enumerate(cols):
            cell = rgb.crop((x0, y0, x1, y1)).convert('RGBA')
            p = cell.load()
            for y in range(cell.height):
                for x in range(cell.width):
                    if magenta(p[x, y]):
                        p[x, y] = (0, 0, 0, 0)
            bb = cell.getbbox()
            row.append(((x0, y0, x1, y1), cell.crop(bb), (x0 + (bb[0] + bb[2]) / 2) - (c + 0.5) * W / 4))
        out.append(row)
    return out


def kind_of(path):
    p = path.replace('\\', '/')
    return 'boss' if '/bosses/' in p else 'foe' if '/foes/' in p else 'hero' if '/heroes/' in p or '/companions/' in p else 'villager'


def cut(filled, sheet_path, row=None, kind=None):
    kind = kind or kind_of(sheet_path)
    S = SHEET[kind]
    fw, fh, feet = S['fw'], S['fh'], S['feet']
    names = rows_of(kind)
    img = Image.open(filled)
    if row is None:
        targets = list(range(len(names)))
        got = frames(img, len(names))
        place = [(r, c) for r in targets for c in range(4)]
        figs = [f for rr in got for f in rr]
    elif row == 'turnaround':
        got = frames(img, 2)
        figs = [f for rr in got for f in rr][:8]
        place = [(i, 0) for i in range(8)]
    else:
        if row not in names:
            sys.exit('no row "%s"; the rows: %s' % (row, ', '.join(names)))
        figs = frames(img, 1)[0]
        place = [(names.index(row), c) for c in range(4)]
    k = min(1, (feet - 1) / max(f[1].height for f in figs), fw / max(f[1].width for f in figs))   # every pixel, unless it can't fit
    sw, sh = fw * 4, fh * len(names)
    sheet = Image.open(sheet_path).convert('RGBA') if os.path.exists(sheet_path) else Image.new('RGBA', (sw, sh), (0, 0, 0, 0))
    if sheet.size != (sw, sh):
        sheet = Image.new('RGBA', (sw, sh), (0, 0, 0, 0))
    for (r, c), (_, fig, off) in zip(place, figs):
        if k < 1:
            fig = fig.resize((max(1, round(fig.width * k)), max(1, round(fig.height * k))), Image.BOX)
        x = max(0, min(fw - fig.width, fw // 2 + round(off * k) - fig.width // 2))
        sheet.paste(Image.new('RGBA', (fw, fh), (0, 0, 0, 0)), (c * fw, r * fh))
        sheet.alpha_composite(fig, (c * fw + x, r * fh + max(0, feet - fig.height)))
    sheet.save(sheet_path)
    print('%d frames into %s%s' % (len(place), sheet_path, '' if k == 1 else ' (shrunk to %d%%: the drawing was bigger than a frame)' % (k * 100)))


if __name__ == '__main__':
    a = sys.argv[1:]
    kind = a[a.index('--kind') + 1] if '--kind' in a else None
    a = [x for i, x in enumerate(a) if x != '--kind' and (i == 0 or a[i - 1] != '--kind')]
    if a[:1] == ['cut'] and len(a) >= 3:
        cut(a[1], a[2], a[3] if len(a) > 3 else None, kind)
    else:
        print(__doc__)
