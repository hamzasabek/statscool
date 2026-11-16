"""StatsCool logo, version 3 (Step 105), built on a grid.

The logo of the site is H2, "labelled bars", chosen by the owner: the ink "Stats" key, then the four
fluorescent letter keys of the old logo (pink c, lime o, cyan o, yellow l), each topped by a bar of its
colour, a gap apart: a small histogram with its labels. It keeps the old logo's identity (the four
fluorescent tiles in the same order, ink letters on them) in the site's language since Step 100:
IBM Plex Mono (the headings' font), square keys, no tilt, one grid, the site's ink.

Letters are drawn as outlines (paths) from IBM Plex Mono SemiBold, so the SVGs need no font.
Usage (from the repository root, after npm install):  python design/logo/make_logos.py
Writes:
  design/logo/statscool-logo-light.svg / -dark.svg   the logo (H2); copied to src/assets/logo-light.svg / -dark.svg
  design/logo/statscool-mark.svg                     the tab icon (H2's keys and bars, no letters); copied to public/favicon.svg
  design/logo/statscool-icon.svg                     the home-screen icon (H2 on an ink square, with letters)
  design/archive/logos/v3-candidates/*.svg           the candidates of rounds 1 and 2 (archive; A, B, C, H1-H6, the 2x2 mark)
The PNG icons (public/favicon-32.png, public/apple-touch-icon.png) are rendered from the SVGs by design/logo/rasterize.mjs.
Requires Python with fontTools (pip install fonttools).
"""
import shutil
from pathlib import Path

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
OUT = ROOT / 'design/archive/logos/v3-candidates'
FONT = TTFont(ROOT / 'node_modules/@ibm/plex/IBM-Plex-Mono/fonts/complete/woff/IBMPlexMono-SemiBold.woff')
GS = FONT.getGlyphSet()
CMAP = FONT.getBestCmap()
UPM = FONT['head'].unitsPerEm

PINK, LIME, CYAN, YELLOW = '#FF2D95', '#B6FF1A', '#12E6FF', '#FFF000'
TILES = [('c', PINK), ('o', LIME), ('o', CYAN), ('l', YELLOW)]
INK = {'light': '#101a30', 'dark': '#e6edf3'}  # the site's text colour in each mode
TILE_INK = '#101a30'  # letters on the bright tiles, both modes


def r(v):
    return f'{v:.2f}'.rstrip('0').rstrip('.')


def glyph_bounds(ch):
    bp = BoundsPen(GS)
    GS[CMAP[ord(ch)]].draw(bp)
    return bp.bounds  # xMin, yMin, xMax, yMax in font units


def glyph_path(ch, x, baseline, size):
    """Outline of one character, its origin at (x, baseline), `size` = font size in SVG units."""
    s = size / UPM
    pen = SVGPathPen(GS, ntos=r)
    GS[CMAP[ord(ch)]].draw(TransformPen(pen, (s, 0, 0, -s, x, baseline)))
    return pen.getCommands()


def text_path(text, x, baseline, size):
    adv = 600 * size / UPM
    return ''.join(glyph_path(ch, x + i * adv, baseline, size) for i, ch in enumerate(text))


def centred_glyph(ch, cx, baseline, size):
    """One character centred (by its ink) on cx."""
    x0, _, x1, _ = glyph_bounds(ch)
    s = size / UPM
    return glyph_path(ch, cx - (x0 + x1) / 2 * s, baseline, size)


def ink_extent(text, size):
    """Left and right of the ink of a line set at x = 0."""
    s = size / UPM
    left = glyph_bounds(text[0])[0] * s
    right = (len(text) - 1) * 600 * s + glyph_bounds(text[-1])[2] * s
    return left, right


def svg(view, body, title='StatsCool'):
    x, y, w, h = view
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{r(x)} {r(y)} {r(w)} {r(h)}" role="img" aria-label="{title}">\n'
            f'<title>{title}</title>\n{body}\n</svg>\n')


# ---------- A. Tiles: the old stacked logo on a strict grid ----------
def tiles(mode):
    size = 100
    left, right = ink_extent('Stats', size)
    gap = 6
    w = (right - left - 3 * gap) / 4  # four tiles as wide, together, as "Stats"
    base_stats = 70
    bottom = base_stats + 16 + 86  # tiles stand on one line; the l tile is the tallest
    parts = [f'<path fill="{INK[mode]}" d="{text_path("Stats", 0, base_stats, size)}"/>']
    letter = 76
    for i, (ch, col) in enumerate(TILES):
        h = 86 if ch == 'l' else 68
        x = left + i * (w + gap)
        parts.append(f'<rect x="{r(x)}" y="{r(bottom - h)}" width="{r(w)}" height="{r(h)}" fill="{col}"/>')
        parts.append(f'<path fill="{TILE_INK}" d="{centred_glyph(ch, x + w / 2, bottom - 15, letter)}"/>')
    pad = 6
    top = base_stats - 0.71 * size
    return svg((left - pad, top - pad, right - left + 2 * pad, bottom - top + 2 * pad), '\n'.join(parts))


# ---------- B. Bars: the tiles become a small bar chart on an axis, the letters at their feet ----------
def bars(mode):
    size = 100
    left, right = ink_extent('Stats', size)
    gap = 6
    w = (right - left - 3 * gap) / 4
    heights = [58, 96, 78, 116]  # c, o, o, l: a bar chart of "cool", the yellow l the tallest
    axis = 196
    base_stats = axis - max(heights) - 18
    parts = [f'<path fill="{INK[mode]}" d="{text_path("Stats", 0, base_stats, size)}"/>']
    for i, (ch, col) in enumerate(TILES):
        x = left + i * (w + gap)
        h = heights[i]
        parts.append(f'<rect x="{r(x)}" y="{r(axis - h)}" width="{r(w)}" height="{r(h)}" fill="{col}"/>')
        parts.append(f'<path fill="{TILE_INK}" d="{centred_glyph(ch, x + w / 2, axis - 12, 70)}"/>')
    parts.append(f'<rect x="{r(left - 4)}" y="{r(axis)}" width="{r(right - left + 8)}" height="5" fill="{INK[mode]}"/>')
    pad = 6
    top = base_stats - 0.71 * size
    return svg((left - 4 - pad, top - pad, right - left + 8 + 2 * pad, axis + 5 - top + 2 * pad), '\n'.join(parts))


# ---------- C. Keys: one row of keys, "Stats" on an ink key, then the four fluorescent letter keys ----------
def keys(mode):
    H = 80
    size = 70
    base = 57  # one baseline for every key
    pad_x = 15
    gap = 6
    l0, r0 = ink_extent('Stats', size)
    stats_w = (r0 - l0) + 2 * pad_x
    key = INK[mode]
    on_key = '#ffffff' if mode == 'light' else '#0d1117'
    parts = [f'<rect x="0" y="0" width="{r(stats_w)}" height="{H}" fill="{key}"/>',
             f'<path fill="{on_key}" d="{text_path("Stats", pad_x - l0, base, size)}"/>']
    x = stats_w + gap
    for ch, col in TILES:
        parts.append(f'<rect x="{r(x)}" y="0" width="{H}" height="{H}" fill="{col}"/>')
        parts.append(f'<path fill="{TILE_INK}" d="{centred_glyph(ch, x + H / 2, base, size)}"/>')
        x += H + gap
    return svg((0, 0, x - gap, H), '\n'.join(parts))


# ---------- The mark (favicon, app icon): the four tiles, two by two ----------
def mark():
    t, g = 31, 2
    parts = []
    for i, (ch, col) in enumerate(TILES):
        x, y = (i % 2) * (t + g), (i // 2) * (t + g)
        parts.append(f'<rect x="{x}" y="{y}" width="{t}" height="{t}" fill="{col}"/>')
        parts.append(f'<path fill="{TILE_INK}" d="{centred_glyph(ch, x + t / 2, y + (22.5 if ch != "l" else 24.5), 30)}"/>')
    return svg((0, 0, 2 * t + g, 2 * t + g), '\n'.join(parts))


# ================= Hybrids of B (bars) and C (keys), asked by the owner after the first round =================
KEY_H, KEY_SIZE, KEY_BASE, KEY_PAD, KEY_GAP = 80, 70, 57, 15, 6


def stats_key(mode, x=0, y=0, size=KEY_SIZE, h=KEY_H, base=KEY_BASE, width=None):
    """The ink key with "Stats" (light key with ink letters in dark mode), its text centred if `width` is given."""
    l0, r0 = ink_extent('Stats', size)
    w = width or (r0 - l0) + 2 * KEY_PAD
    tx = x + (w - (r0 - l0)) / 2 - l0
    on_key = '#ffffff' if mode == 'light' else '#0d1117'
    return w, [f'<rect x="{r(x)}" y="{r(y)}" width="{r(w)}" height="{r(h)}" fill="{INK[mode]}"/>',
               f'<path fill="{on_key}" d="{text_path("Stats", tx, y + base, size)}"/>']


def letter_key(ch, col, x, y, w=KEY_H, h=KEY_H, base=KEY_BASE, size=KEY_SIZE):
    return [f'<rect x="{r(x)}" y="{r(y)}" width="{r(w)}" height="{r(h)}" fill="{col}"/>',
            f'<path fill="{TILE_INK}" d="{centred_glyph(ch, x + w / 2, y + base, size)}"/>']


# H1. Key chart: one row; the ink Stats key, then c-o-o-l as bars of different heights on one axis, letters at the foot.
def keychart(mode):
    heights = [64, 104, 84, 124]
    axis = max(heights)
    w, parts = stats_key(mode, 0, axis - KEY_H)
    x = w + KEY_GAP
    for (ch, col), h in zip(TILES, heights):
        parts += letter_key(ch, col, x, axis - h, h=h, base=h - (KEY_H - KEY_BASE))
        x += KEY_H + KEY_GAP
    parts.append(f'<rect x="0" y="{axis}" width="{r(x - KEY_GAP)}" height="6" fill="{INK[mode]}"/>')
    return svg((0, 0, x - KEY_GAP, axis + 6), '\n'.join(parts))


# H2. Labelled bars: one row of equal keys (C); above each fluorescent key a bar of its colour, a gap apart (a histogram and its labels).
def labelled(mode):
    bars = [22, 54, 36, 70]
    gap = 5
    top = max(bars) + gap
    w, parts = stats_key(mode, 0, top)
    x = w + KEY_GAP
    for (ch, col), h in zip(TILES, bars):
        parts.append(f'<rect x="{r(x)}" y="{r(top - gap - h)}" width="{KEY_H}" height="{h}" fill="{col}"/>')
        parts += letter_key(ch, col, x, top)
        x += KEY_H + KEY_GAP
    return svg((0, 0, x - KEY_GAP, top + KEY_H), '\n'.join(parts))


# H3. Stacked chart: "Stats" on a wide ink key as the chart's title; under it, the bars of B on their axis.
def stackedchart(mode):
    bw, gap = 80, 6
    width = 4 * bw + 3 * gap
    heights = [64, 100, 82, 118]
    _, parts = stats_key(mode, 0, 0, width=width)
    axis = KEY_H + 10 + max(heights)
    x = 0
    for (ch, col), h in zip(TILES, heights):
        parts += letter_key(ch, col, x, axis - h, w=bw, h=h, base=h - (KEY_H - KEY_BASE))
        x += bw + gap
    parts.append(f'<rect x="0" y="{axis}" width="{width}" height="6" fill="{INK[mode]}"/>')
    return svg((0, 0, width, axis + 6), '\n'.join(parts))


# H4. Badge: one ink square, "Stats" at the top, a small c-o-o-l bar chart inside (works as an app icon too).
def badge(mode):
    S, pad = 200, 16
    on_key = '#ffffff' if mode == 'light' else '#0d1117'
    size = 56
    l0, r0 = ink_extent('Stats', size)
    parts = [f'<rect x="0" y="0" width="{S}" height="{S}" fill="{INK[mode]}"/>',
             f'<path fill="{on_key}" d="{text_path("Stats", (S - (r0 - l0)) / 2 - l0, pad + 0.698 * size, size)}"/>']
    inner = S - 2 * pad
    gap = 6
    bw = (inner - 3 * gap) / 4
    heights = [44, 76, 60, 92]
    bottom = S - pad
    for i, ((ch, col), h) in enumerate(zip(TILES, heights)):
        x = pad + i * (bw + gap)
        parts.append(f'<rect x="{r(x)}" y="{r(bottom - h)}" width="{r(bw)}" height="{h}" fill="{col}"/>')
        parts.append(f'<path fill="{TILE_INK}" d="{centred_glyph(ch, x + bw / 2, bottom - 9, 36)}"/>')
    return svg((0, 0, S, S), '\n'.join(parts))


# H5. Keys on an axis: C exactly, standing on an ink axis with a tick under each letter key.
def axiskeys(mode):
    w, parts = stats_key(mode)
    x = w + KEY_GAP
    ticks = []
    for ch, col in TILES:
        parts += letter_key(ch, col, x, 0)
        ticks.append(x + KEY_H / 2)
        x += KEY_H + KEY_GAP
    axis = KEY_H + 7
    parts.append(f'<rect x="0" y="{axis}" width="{r(x - KEY_GAP)}" height="5" fill="{INK[mode]}"/>')
    for t in ticks:
        parts.append(f'<rect x="{r(t - 2)}" y="{axis + 5}" width="4" height="9" fill="{INK[mode]}"/>')
    return svg((0, 0, x - KEY_GAP, axis + 14), '\n'.join(parts))


# H6. Lollipop: the letter keys at different heights, each on a stem down to the axis (a lollipop chart of "cool").
def lollipop(mode):
    k = 70  # letter keys a little smaller than the Stats key, so the heights read
    lift = [16, 48, 30, 66]
    top = max(lift)
    axis = top + k + 0
    w, parts = stats_key(mode, 0, axis - KEY_H)
    x = w + KEY_GAP + 4
    for (ch, col), up in zip(TILES, lift):
        y = axis - k - up
        if up:
            parts.append(f'<rect x="{r(x + k / 2 - 2.5)}" y="{r(y + k)}" width="5" height="{r(up)}" fill="{INK[mode]}"/>')
        parts += letter_key(ch, col, x, y, w=k, h=k, base=50, size=62)
        x += k + 12
    parts.append(f'<rect x="0" y="{r(axis)}" width="{r(x - 12)}" height="6" fill="{INK[mode]}"/>')
    return svg((0, 0, x - 12, axis + 6), '\n'.join(parts))


HYBRIDS = (('h1-keychart', keychart), ('h2-labelled', labelled), ('h3-stacked', stackedchart),
           ('h4-badge', badge), ('h5-axis', axiskeys), ('h6-lollipop', lollipop))

H2_BARS = [22, 54, 36, 70]  # the bar heights of the logo (labelled()), reused by the icons


# ---------- The tab icon of H2: its four keys and their bars, without letters (they would not read at 16 px) ----------
def h2_mark():
    # On a 32-unit grid with whole numbers only, so the icon stays crisp at 32 px (and 16 px) in a browser tab.
    S, col_w, gap, key, bar_gap = 32, 6, 2, 6, 2
    bars = [round(b * 14 / max(H2_BARS)) for b in H2_BARS]  # the logo's bars, scaled to 14 units: 4, 11, 7, 14
    width = 4 * col_w + 3 * gap
    height = max(bars) + bar_gap + key
    x0, y0 = (S - width) // 2, (S - height) // 2
    parts = []
    for i, ((_, col), h) in enumerate(zip(TILES, bars)):
        x = x0 + i * (col_w + gap)
        parts.append(f'<rect x="{r(x)}" y="{r(y0 + height - key - bar_gap - h)}" width="{col_w}" height="{r(h)}" fill="{col}"/>')
        parts.append(f'<rect x="{r(x)}" y="{r(y0 + height - key)}" width="{col_w}" height="{key}" fill="{col}"/>')
    return svg((0, 0, S, S), '\n'.join(parts))


# ---------- The home-screen icon: H2 (keys with their letters, bars) on an ink square ----------
def h2_icon():
    S, key, gap, bar_gap = 180, 30, 4, 4
    k = 72 / max(H2_BARS)
    width = 4 * key + 3 * gap
    height = max(H2_BARS) * k + bar_gap + key
    x0, y0 = (S - width) / 2, (S - height) / 2
    parts = [f'<rect x="0" y="0" width="{S}" height="{S}" fill="{INK["light"]}"/>']
    for i, ((ch, col), b) in enumerate(zip(TILES, H2_BARS)):
        x = x0 + i * (key + gap)
        h = b * k
        top = y0 + height - key
        parts.append(f'<rect x="{r(x)}" y="{r(top - bar_gap - h)}" width="{key}" height="{r(h)}" fill="{col}"/>')
        parts += letter_key(ch, col, x, top, w=key, h=key, base=22, size=28)
    return svg((0, 0, S, S), '\n'.join(parts))


if __name__ == '__main__':
    # the archive: every candidate of rounds 1 and 2, as they were shown to the owner
    OUT.mkdir(parents=True, exist_ok=True)
    for name, make in (('tiles', tiles), ('bars', bars), ('keys', keys)) + HYBRIDS:
        for mode in ('light', 'dark'):
            (OUT / f'{name}-{mode}.svg').write_text(make(mode), encoding='utf8')
    (OUT / 'mark.svg').write_text(mark(), encoding='utf8')
    # the logo of the site: H2
    for mode in ('light', 'dark'):
        (HERE / f'statscool-logo-{mode}.svg').write_text(labelled(mode), encoding='utf8')
        shutil.copyfile(HERE / f'statscool-logo-{mode}.svg', ROOT / f'src/assets/logo-{mode}.svg')
    (HERE / 'statscool-mark.svg').write_text(h2_mark(), encoding='utf8')
    (HERE / 'statscool-icon.svg').write_text(h2_icon(), encoding='utf8')
    shutil.copyfile(HERE / 'statscool-mark.svg', ROOT / 'public/favicon.svg')
    print('logo, mark and icon written; candidates in', OUT.relative_to(ROOT))
