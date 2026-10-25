"""Art made with an image AI (ChatGPT), 25 Oct 2026. Image AIs draw a character well but can't keep an exact pixel grid, so the AI fills
in a big template (four large frames on magenta, a label over each) and this tool turns the result into a row of a real sheet:
it keys out the magenta, scales the row's four frames by one factor (so the character keeps its size), stands each on the feet line,
snaps the colours to the game's palette (the hero's scales stay orange, so the hero colour still works), cleans stray pixels and draws
the outline. The prompt is in art/templates/gpt/README.md.

    python3 tools/gpt-art.py templates                                   # write art/templates/gpt/
    python3 tools/gpt-art.py slice FILLED.png SHEET.png ROW [--size 32] [--kind hero]  # put the four frames into ROW of SHEET (e.g. "walk down")
    python3 tools/gpt-art.py slice FILLED.png SHEET.png turnaround       # the 8 standing directions: frame 1 of each walking row

ROW is a row's name as in art/ASSETS.md without the bracket: "walk down-right", "attack, facing left". The sheet's other rows
are left as they are; a missing sheet is made empty at the right size.
"""
import json, os, re, subprocess, sys
from collections import Counter
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.join(os.path.dirname(__file__), '..')
OUT = os.path.join(ROOT, 'art', 'templates', 'gpt')
SHEET = json.loads(subprocess.check_output(['node', '-e', "console.log(JSON.stringify(require('./tools/assets.js').SHEET))"], cwd=ROOT))
W, H = 1536, 1024   # the template: GPT's landscape size, four frames each under its label
MAGENTA, LINE, BORDER = (255, 0, 255), (200, 0, 200), (60, 0, 60)
FRAME_WORDS = ['stand', 'step', 'stand', 'other step']
hx = lambda h: tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))
INK = hx('#140a35')
# the palette a drawing is snapped to (style-guide.md): ramps light to dark; orange is kept for the hero's scales only
PAL = [hx(c) for c in ['#ffd08a', '#ffb04a', '#f08a2a', '#c4581c', '#8a3414',      # scales (orange: the hero colour)
                       '#f4e2c0', '#d8b890', '#a08060',                            # bellies, bone, cloth wraps
                       '#8a5ad8', '#6a3ab8', '#4a2490', '#2e1460',                 # purples
                       '#7bb6e6', '#3a8fd9', '#235a9a', '#162e5a',                 # blues
                       '#9be36b', '#5fb04a', '#3f7f3a', '#234a24',                 # greens
                       '#fff2a0', '#ffd54a', '#c8901c', '#6a4010',                 # golds, leather
                       '#ff7a6a', '#e83c3c', '#981c2a', '#4a0c22',                 # reds
                       '#fffbe0', '#ffe066', '#ffffff', '#d8d0e8', '#9c92b4', '#62526d', '#3a3050', '#1a0c14']]


def font(size):
    try:
        return ImageFont.load_default(size=size)
    except TypeError:
        return ImageFont.load_default()


def rows_of(kind):
    return [re.sub(r' \([^)]*\)', '', r[0]) for r in SHEET[kind]['rows']]   # 'walk (a patrol on the map), facing right' -> 'walk, facing right'


def template(title, labels, cols, rows_n):
    """cols x rows_n frames, each with its label above it, on magenta; a darker line marks where the feet stand"""
    im = Image.new('RGB', (W, H), MAGENTA)
    d = ImageDraw.Draw(im)
    cw, ch = W // cols, (H - 40) // rows_n
    d.rectangle([0, 0, W, 40], fill=(255, 255, 255))
    d.text((12, 8), title, fill=(0, 0, 0), font=font(24))
    for k, lab in enumerate(labels):
        c, r = k % cols, k // cols
        x0, y0 = c * cw, 40 + r * ch
        d.rectangle([x0, y0, x0 + cw - 1, y0 + 70], fill=(255, 255, 255))
        d.text((x0 + 12, y0 + 18), lab, fill=(0, 0, 0), font=font(30))
        d.rectangle([x0, y0, x0 + cw - 1, y0 + ch - 1], outline=BORDER, width=4)
        fy = y0 + ch - 40
        d.line([x0 + 20, fy, x0 + cw - 20, fy], fill=LINE, width=3)
    return im


def cells(img, n, cols):
    """the frame boxes of a filled template, scaled to the size the AI returned it at"""
    rows_n = (n + cols - 1) // cols
    sx, sy = img.width / W, img.height / H
    cw, ch = W // cols, (H - 40) // rows_n
    out = []
    for k in range(n):
        c, r = k % cols, k // cols
        x0, y0 = c * cw, 40 + r * ch + 74
        out.append((round((x0 + 10) * sx), round(y0 * sy), round((x0 + cw - 10) * sx), round((y0 + ch - 84) * sy)))
    return out


def figure(cell):
    """the character in a frame: everything that isn't magenta (the feet line and the border included in the key)"""
    rgb = cell.convert('RGB')
    a = Image.new('L', rgb.size, 0)
    p, q = rgb.load(), a.load()
    for y in range(rgb.height):
        for x in range(rgb.width):
            r, g, b = p[x, y]
            bg = (r > 140 and b > 140 and g < 120 and abs(r - b) < 90) or (r < 90 and g < 30 and b < 90 and abs(r - b) < 30 and r > 40)
            q[x, y] = 0 if bg else 255
    out = rgb.convert('RGBA')
    out.putalpha(a)
    return out


def near(c):
    return min(PAL, key=lambda p: 2 * (p[0] - c[0]) ** 2 + 4 * (p[1] - c[1]) ** 2 + 3 * (p[2] - c[2]) ** 2)


def to_frame(fig, scale, fw, fh, feet, dx):
    """one character, scaled, standing on the feet line, snapped to the palette, cleaned and outlined"""
    bb = fig.getbbox()
    out = Image.new('RGBA', (fw, fh), (0, 0, 0, 0))
    if not bb:
        return out
    f = fig.crop(bb)
    w, h = max(1, round(f.width * scale)), max(1, round(f.height * scale))
    s = f.resize((w, h), Image.BOX)
    sp, op = s.load(), out.load()
    ox, oy = fw // 2 - w // 2 + dx, feet + 1 - h
    for y in range(h):
        for x in range(w):
            r, g, b, a = sp[x, y]
            if a >= 130 and 0 <= ox + x < fw and 0 <= oy + y < fh:
                op[ox + x, oy + y] = near((r, g, b)) + (255,)
    for _ in range(2):   # a lone pixel takes its neighbours' colour
        for y in range(fh):
            for x in range(fw):
                if op[x, y][3] == 0:
                    continue
                nb = [op[x + i, y + j] for i, j in ((1, 0), (-1, 0), (0, 1), (0, -1)) if 0 <= x + i < fw and 0 <= y + j < fh and op[x + i, y + j][3]]
                if len(nb) >= 3 and op[x, y] not in nb:
                    m = Counter(nb).most_common(1)[0]
                    if m[1] >= 3:
                        op[x, y] = m[0]
    solid = [[op[x, y][3] > 0 for x in range(fw)] for y in range(fh)]
    for y in range(fh):
        for x in range(fw):
            if not solid[y][x] and any(0 <= x + i < fw and 0 <= y + j < fh and solid[y + j][x + i] for i, j in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                op[x, y] = INK + (255,)
    return out


def kind_of(sheet_path):
    p = sheet_path.replace('\\', '/')
    return 'boss' if '/bosses/' in p else 'foe' if '/foes/' in p else 'hero' if '/heroes/' in p or '/companions/' in p else 'villager'


def slice_into(filled, sheet_path, row, size=None, kind=None):
    kind = kind or kind_of(sheet_path)
    S = SHEET[kind]
    fw, fh = S['fw'], S['fh']
    if size:
        fw = fh = int(size) * (2 if kind == 'boss' else 1)
    feet = round(fh * S['feet'] / S['fh'])
    names = rows_of(kind)
    img = Image.open(filled)
    if row == 'turnaround':
        targets = [(names.index(n), 0) for n in names[:8]]
        boxes = cells(img, 8, 4)
    else:
        if row not in names:
            sys.exit('no row "%s"; the rows: %s' % (row, ', '.join(names)))
        targets = [(names.index(row), i) for i in range(4)]
        boxes = cells(img, 4, 4)
    figs = [figure(img.crop(b)) for b in boxes]
    tallest = max((f.getbbox()[3] - f.getbbox()[1]) for f in figs if f.getbbox())
    scale = (feet - 1) / tallest          # one scale for the row: the tallest frame fills the height
    sw, sh = fw * 4, fh * len(names)
    sheet = Image.open(sheet_path).convert('RGBA') if os.path.exists(sheet_path) else Image.new('RGBA', (sw, sh), (0, 0, 0, 0))
    if sheet.size != (sw, sh):
        big = Image.new('RGBA', (sw, sh), (0, 0, 0, 0))
        big.alpha_composite(sheet.crop((0, 0, min(sw, sheet.width), min(sh, sheet.height))))
        sheet = big
    for (r, i), b, f in zip(targets, boxes, figs):
        bb = f.getbbox()
        dx = round(((bb[0] + bb[2]) / 2 - f.width / 2) * scale) if bb else 0   # keep where the figure stands in its frame: no jitter
        fr = to_frame(f, scale, fw, fh, feet, dx)
        sheet.paste(Image.new('RGBA', (fw, fh), (0, 0, 0, 0)), (i * fw, r * fh))
        sheet.alpha_composite(fr, (i * fw, r * fh))
    sheet.save(sheet_path)
    print('put %d frames into %s (%s, %dx%d)' % (len(targets), sheet_path, row, fw, fh))


def templates():
    os.makedirs(OUT, exist_ok=True)
    for f in os.listdir(OUT):
        if f.endswith('.png'):
            os.remove(os.path.join(OUT, f))
    for kind in ('hero', 'villager', 'foe', 'boss'):
        names = rows_of(kind)
        for n in names:
            walk = n.startswith('walk ') and kind != 'foe'
            if walk:
                labels = ['%d %s' % (i + 1, FRAME_WORDS[i]) for i in range(4)]
            else:
                parts = n.split(', facing ')[0].split(', ')
                labels = ['%d %s' % (i + 1, parts[i] if len(parts) == 4 else parts[0]) for i in range(4)]
            face = ' (facing ' + n.split(', facing ')[1] + ')' if ', facing ' in n else ''
            title = '%s: %s%s. One character per frame, standing on the line, same size in every frame.' % (kind, n.split(', facing ')[0], face)
            template(title, labels, 4, 1).save(os.path.join(OUT, '%s-%s.png' % (kind, n.replace(', ', '-').replace(' ', '-'))))
        if kind in ('hero', 'villager'):
            labels = ['%d %s' % (i + 1, n.replace('walk ', 'facing ')) for i, n in enumerate(names[:8])]
            template('%s: turnaround, standing still in 8 directions. The same character in every frame.' % kind, labels, 4, 2).save(os.path.join(OUT, '%s-turnaround.png' % kind))
    print('templates in', os.path.relpath(OUT, ROOT), len([f for f in os.listdir(OUT) if f.endswith('.png')]))


if __name__ == '__main__':
    a = sys.argv[1:]
    if a[:1] == ['templates']:
        templates()
    elif a[:1] == ['slice'] and len(a) >= 4:
        size = a[a.index('--size') + 1] if '--size' in a else None
        slice_into(a[1], a[2], a[3], size, a[a.index('--kind') + 1] if '--kind' in a else None)
    else:
        print(__doc__)
