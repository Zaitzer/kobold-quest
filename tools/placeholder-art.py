"""Placeholder art for every asset in art/v6 that nobody has drawn yet (22 Oct 2026, Joakim: "draw everything but only as
placeholders"). Simple shapes in the style guide's palette and ink outline, one per frame, so a sheet shows something in every
frame. Each placeholder's hash goes into art/v6/placeholders.json: a file whose content still matches its hash is a placeholder
(not drawn) and may be redrawn by this tool; anything else is Joakim's drawing and is never touched.

    python3 tools/placeholder-art.py        # fill every empty or placeholder file
"""
import hashlib, json, math, os, re, sys, zlib
from PIL import Image, ImageDraw

ROOT = os.path.join(os.path.dirname(__file__), '..')
ART = os.path.join(ROOT, 'art', 'v6')
LIST = os.path.join(ART, 'ASSETS.md')
MARK = os.path.join(ART, 'placeholders.json')
INK = (0x14, 0x0a, 0x35, 255)
SHEET = {  # frame w, h, frames per row (tools/assets.js SHEET)
    'hero': (32, 64, [3, 3, 3, 2, 3, 2, 4]), 'villager': (32, 64, [3, 3, 3, 2]), 'foe': (32, 64, [2, 3, 3, 2]),
    'boss': (64, 96, [2, 3, 2, 2]), 'tile': (32, 32, [1]), 'tileanim': (32, 32, [4]), 'building': (128, 96, [1]),
    'buildanim': (128, 96, [4]), 'fx': (32, 32, [6]), 'fxbig': (64, 64, [6]), 'portrait': (64, 64, [3]),
    'icon': (32, 32, [1]), 'icon16': (16, 16, [1]), 'object': (32, 32, [2])}
# what each character row shows (the pose drawn in that row)
POSES = {'hero': ['walk', 'walk', 'walk', 'idle', 'attack', 'cast', 'hurtdowncheer'], 'villager': ['walk', 'walk', 'walk', 'talk'],
         'foe': ['idle', 'walk', 'attack', 'hurtoff'], 'boss': ['idle', 'attack', 'telegraph', 'hurtdown']}
PALETTE = [('grass|meadow|garden|flowers|tall-grass|nest', '#6cbf4c'), ('tree|forest|plant|bush', '#3f7f3a'),
           ('water|pond|flood|oasis-water|sea', '#3a8fd9'), ('sand|dune|desert|dry', '#e9d18b'), ('snow|ice|frost|white', '#eef4fb'),
           ('rock|cliff|wall|stone|pillar|ledge|pass|ash|mine', '#62526d'), ('wood|plank|pier|hull|fence|bridge|crate|rail|deck|cart', '#a8743f'),
           ('fire|ember|lava|magma|oven|burn|tower-fire', '#ff8a2b'), ('marble|cobble|castle|street|carpet|throne|stairs', '#b8aec9'),
           ('honey|wax|comb|gold|coin', '#ffd54a'), ('mushroom|poison|hex|dark', '#8a4fc0'), ('heal|holy|nature|leaf', '#9be36b'),
           ('storm', '#9ad0ff'), ('roof|inn|shop|house|bakery|smithy|forge', '#c4523a')]

def hexc(h, a=255):
    return (int(h[1:3], 16), int(h[3:5], 16), int(h[5:7], 16), a)

def shade(c, f):
    return tuple(max(0, min(255, int(v * f))) for v in c[:3]) + (c[3],)

KOBOLDS = {'pip': '#ff8a2b', 'bork': '#5fb04a', 'wizzle': '#4a9fe0', 'glint': '#e05aa8', 'nugget': '#c9a24a', 'saffi': '#8a6bff', 'cinder': '#e8483c', 'crumb': '#f0e6c8'}

def name_colour(name):
    k = name.split(' ')[0].split('-')[0]
    if k in KOBOLDS: return hexc(KOBOLDS[k])
    for pat, col in PALETTE:
        if re.search(pat, name):
            return hexc(col)
    h = zlib.crc32(name.encode())
    hue = (h % 360) / 360
    import colorsys
    r, g, b = colorsys.hsv_to_rgb(hue, 0.55, 0.85)
    return (int(r * 255), int(g * 255), int(b * 255), 255)

def outline(im):
    """a one-pixel ink outline around everything drawn (style guide rule 1)"""
    px = im.load(); w, h = im.size
    solid = [[px[x, y][3] > 0 for x in range(w)] for y in range(h)]
    for y in range(h):
        for x in range(w):
            if not solid[y][x] and any(0 <= x + dx < w and 0 <= y + dy < h and solid[y + dy][x + dx] for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                px[x, y] = INK
    return im

def creature(fw, fh, col, pose, i, big=False):
    """a big-headed creature facing right, standing on the feet line (fh - 4)"""
    im = Image.new('RGBA', (fw, fh), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    s = fw / 32; feet = fh - 4
    dx = dy = 0; c = col; lying = False
    if pose == 'walk': dy = -1 if i == 1 or i == 2 else 0; leg = i
    else: leg = 0
    if pose == 'idle' or pose == 'talk': dy = -(i % 2)
    if pose == 'attack': dx = [0, 3, 1][i] * s
    if pose == 'cast': dy = -2 * (i % 2)
    if pose == 'telegraph': dx = -3 * s * (i + 1) / 2
    if pose in ('hurtdowncheer', 'hurtoff', 'hurtdown'):
        if i == 0: c = shade(col, 0.75); dx = -2 * s
        elif pose == 'hurtoff' and i == 1: dx = -5 * s
        elif pose == 'hurtdowncheer' and i >= 2: dy = -3 * (i - 1)
        else: lying = True
    dark, light = shade(c, 0.7), shade(c, 1.2)
    if lying:
        d.ellipse([4 * s, feet - 9 * s, fw - 4 * s, feet], fill=c)
        d.ellipse([fw - 15 * s, feet - 12 * s, fw - 3 * s, feet - 1 * s], fill=c)
        d.line([fw - 9 * s, feet - 8 * s, fw - 7 * s, feet - 6 * s], fill=INK)
        return outline(im)
    body_top = feet - 22 * s
    # legs (walk: one forward)
    lx = [(-3, 0), (2, 0), (-1, 0)][leg] if pose == 'walk' else (0, 0)
    d.rectangle([fw / 2 - 5 * s + lx[0] * s + dx, feet - 6 * s + dy, fw / 2 - 2 * s + lx[0] * s + dx, feet + dy], fill=dark)
    d.rectangle([fw / 2 + 1 * s + lx[1] * s + dx, feet - 6 * s + dy, fw / 2 + 4 * s + dx, feet + dy], fill=dark)
    d.ellipse([fw / 2 - 8 * s + dx, body_top + dy, fw / 2 + 8 * s + dx, feet - 4 * s + dy], fill=c)       # body
    d.polygon([(fw / 2 - 8 * s + dx, feet - 10 * s + dy), (fw / 2 - 14 * s + dx, feet - 4 * s + dy), (fw / 2 - 6 * s + dx, feet - 7 * s + dy)], fill=c)  # tail
    hr = 10 * s; hx = fw / 2 + 2 * s + dx; hy = body_top - 4 * s + dy                                           # a big head
    d.ellipse([hx - hr, hy - hr, hx + hr, hy + hr], fill=c)
    d.ellipse([hx - hr + 3 * s, hy - hr + 2 * s, hx, hy - 1 * s], fill=light)
    d.polygon([(hx - 4 * s, hy - hr + 1), (hx - 7 * s, hy - hr - 5 * s), (hx - 1 * s, hy - hr + 2)], fill=dark)  # horn
    d.ellipse([hx + 5 * s, hy - 1 * s, hx + 12 * s, hy + 5 * s], fill=c)                                      # snout
    ex, ey = hx + 3 * s, hy - 3 * s
    d.rectangle([ex, ey, ex + 2 * s, ey + 3 * s], fill=(255, 255, 255, 255)); d.rectangle([ex + s, ey + s, ex + 2 * s, ey + 3 * s], fill=INK)
    if pose == 'attack' and i == 1: d.rectangle([hx + 8 * s, body_top + 6 * s + dy, fw - 1, body_top + 8 * s + dy], fill=hexc('#ffd54a'))
    if pose == 'cast': d.ellipse([hx + 6 * s, body_top - 2 * s + dy, hx + 11 * s, body_top + 3 * s + dy], fill=hexc('#9ad0ff'))
    if pose == 'telegraph': d.ellipse([fw - 14 * s, body_top - 8 * s, fw - 2 * s, body_top + 4 * s], fill=hexc('#ff6b6b'))
    if big: d.rectangle([hx - 6 * s, hy - hr - 2 * s, hx + 4 * s, hy - hr + 1 * s], fill=hexc('#ffd54a'))  # a crown, so bosses read
    return outline(im)

def tile(fw, fh, col, i, name):
    im = Image.new('RGBA', (fw, fh), col); px = im.load()
    for y in range(fh):
        for x in range(fw):
            if ((x + i * 3) * 5 + y * 3) % 11 == 0 or ((x + i * 2) + y * 7) % 17 == 0: px[x, y] = shade(col, 0.85)
    if re.search('tree|bush|rock|mushroom|pillar|crate|cover|cactus|fountain|lamp', name):   # a thing standing on the tile
        base = hexc('#6cbf4c') if not re.search('mine|cave|mushroom', name) else hexc('#62526d')
        im = Image.new('RGBA', (fw, fh), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
        d.ellipse([5, 6, fw - 5, fh - 4], fill=col); d.ellipse([9, 9, 16, 15], fill=shade(col, 1.25)); outline(im)
    return im

def building(fw, fh, col, i):
    im = Image.new('RGBA', (fw, fh), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    wall = hexc('#e9d18b'); roof = col
    d.rectangle([8, 40, fw - 9, fh - 2], fill=wall)
    d.polygon([(2, 44), (fw / 2, 6 - (i % 2)), (fw - 3, 44)], fill=roof)
    d.rectangle([fw / 2 - 9, fh - 26, fw / 2 + 8, fh - 2], fill=hexc('#7a4f27'))
    for wx in (22, fw - 34): d.rectangle([wx, 54, wx + 11, 65], fill=hexc('#7bb6e6'))
    if i: d.ellipse([fw - 30, 8 + 2 * i, fw - 18, 20 + 2 * i], fill=hexc('#ffd54a'))   # the moving part
    return outline(im)

def burst(fw, fh, col, i, n):
    im = Image.new('RGBA', (fw, fh), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    t = (i + 1) / n; r = (fw / 2 - 3) * t; c = fw / 2
    for k in range(8):
        a = k * math.pi / 4 + i * 0.3
        d.line([c + math.cos(a) * r * 0.5, c + math.sin(a) * r * 0.5, c + math.cos(a) * r, c + math.sin(a) * r], fill=col, width=max(1, fw // 16))
    d.ellipse([c - r * 0.45, c - r * 0.45, c + r * 0.45, c + r * 0.45], fill=shade(col, 1.25) if i < n - 1 else (0, 0, 0, 0))
    return outline(im)

def portrait(fw, fh, col, i):
    im = Image.new('RGBA', (fw, fh), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.ellipse([8, 8, fw - 8, fh - 2], fill=col); d.ellipse([16, 14, 30, 26], fill=shade(col, 1.2))
    d.polygon([(18, 12), (12, 0), (26, 10)], fill=shade(col, 0.7))
    for ex in (24, 40): d.rectangle([ex, 26, ex + 4, 32], fill=(255, 255, 255, 255)); d.rectangle([ex + 2, 28, ex + 4, 32], fill=INK)
    m = [(24, 46, 40, 46), None, None][i]
    if i == 0: d.line([24, 46, 40, 46], fill=INK, width=2)
    if i == 1: d.arc([22, 36, 42, 50], 20, 160, fill=INK, width=2)
    if i == 2: d.arc([22, 44, 42, 58], 200, 340, fill=INK, width=2)
    return outline(im)

def icon(fw, fh, col, i):
    im = Image.new('RGBA', (fw, fh), (0, 0, 0, 0)); d = ImageDraw.Draw(im); m = max(2, fw // 8)
    d.rounded_rectangle([m, m + (i % 2), fw - m - 1, fh - m - 1 + (i % 2)], radius=max(2, fw // 6), fill=col)
    d.rectangle([m + 2, m + 2 + (i % 2), m + 2 + fw // 6, m + 2 + fw // 6 + (i % 2)], fill=shade(col, 1.3))
    return outline(im)

def frame(kind, fw, fh, name, pose, i, n):
    col = name_colour(name)
    if kind in POSES: return creature(fw, fh, col, pose, i, big=(kind == 'boss'))
    if kind in ('tile', 'tileanim'): return tile(fw, fh, col, i, name)
    if kind in ('building', 'buildanim'): return building(fw, fh, col, i)
    if kind in ('fx', 'fxbig'): return burst(fw, fh, col, i, n)
    if kind == 'portrait': return portrait(fw, fh, col, i)
    return icon(fw, fh, col, i)

def sheet(kind, name):
    fw, fh, rows = SHEET[kind]
    im = Image.new('RGBA', (fw * max(rows), fh * len(rows)), (0, 0, 0, 0))
    for r, n in enumerate(rows):
        pose = POSES.get(kind, [''] * len(rows))[r]
        for i in range(n): im.alpha_composite(frame(kind, fw, fh, name, pose, i, n), (i * fw, r * fh))
    return im

def sha(path):
    return hashlib.sha1(open(path, 'rb').read()).hexdigest()

def main():
    marks = json.load(open(MARK)) if os.path.exists(MARK) else {}
    rows = re.findall(r'^\| [★·] \| `([^`]+)` \| [^|]* \| (\w+) \|', open(LIST, encoding='utf8').read(), re.M)
    made = kept = 0
    for rel, kind in rows:
        path = os.path.join(ART, rel)
        if os.path.exists(path):
            im = Image.open(path).convert('RGBA')
            empty = im.getextrema()[3][1] == 0
            if not empty and marks.get(rel) != sha(path): kept += 1; continue   # a real drawing: never touched
        os.makedirs(os.path.dirname(path), exist_ok=True)
        sheet(kind, os.path.basename(rel)[:-4] + ' ' + os.path.dirname(rel)).save(path, optimize=True)
        marks[rel] = sha(path); made += 1
    json.dump(dict(sorted(marks.items())), open(MARK, 'w'), indent=0)
    print(f'placeholders drawn {made}, drawings kept {kept}')

if __name__ == '__main__':
    main()
