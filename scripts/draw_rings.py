import math, random
OUT='/home/user/whitakers/assets/designs/'

def defs(metal):
    m = {'white': ('#fbfbf9','#d9dadb','#9ea2a6'), 'yellow': ('#fbeac0','#d9b46e','#9a7436'), 'rose': ('#f8e6dc','#d9b8a6','#a3806e')}[metal]
    return f'''<defs>
<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6f1ea"/><stop offset="1" stop-color="#e8dfd3"/></linearGradient>
<radialGradient id="glow" cx=".5" cy=".45" r=".6"><stop offset="0" stop-color="#fffdf9" stop-opacity=".9"/><stop offset="1" stop-color="#fffdf9" stop-opacity="0"/></radialGradient>
<linearGradient id="metal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{m[0]}"/><stop offset=".55" stop-color="{m[1]}"/><stop offset="1" stop-color="{m[2]}"/></linearGradient>
<linearGradient id="metalV" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="{m[2]}"/><stop offset=".45" stop-color="{m[0]}"/><stop offset="1" stop-color="{m[1]}"/></linearGradient>
<linearGradient id="pearl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbf8f4"/><stop offset=".3" stop-color="#e9f1f4"/><stop offset=".5" stop-color="#f6eaf0"/><stop offset=".7" stop-color="#e6f3ec"/><stop offset="1" stop-color="#f3efe6"/></linearGradient>
<filter id="shadow" x="-20%" y="-20%" width="140%" height="160%"><feGaussianBlur stdDeviation="6"/></filter>
</defs>'''
MET = {'white': '#8e9297', 'yellow': '#8c6a30', 'rose': '#9a7766'}

def facets(outline, cx, cy, palette, seed=1):
    """A cut stone: crown facets from the outline to a table, shaded by angle."""
    rnd = random.Random(seed)
    n = len(outline)
    table = [(cx + (x - cx) * .52, cy + (y - cy) * .52) for x, y in outline]
    s = []
    base = palette[1]
    s.append(f'<polygon points="{pts(outline)}" fill="{base}"/>')
    for i in range(n):
        a, b = outline[i], outline[(i + 1) % n]
        ta, tb = table[i], table[(i + 1) % n]
        ang = math.atan2((a[1] + b[1]) / 2 - cy, (a[0] + b[0]) / 2 - cx)
        light = (math.cos(ang + 2.3) + 1) / 2
        col = palette[0] if light > .62 else palette[2] if light < .3 else palette[1]
        s.append(f'<polygon points="{pts([a, b, tb])}" fill="{col}" opacity="{.75 + .25 * rnd.random():.2f}"/>')
        col2 = palette[3] if i % 2 else palette[0]
        s.append(f'<polygon points="{pts([a, tb, ta])}" fill="{col2}" opacity=".55"/>')
    s.append(f'<polygon points="{pts(table)}" fill="{palette[0]}" opacity=".85"/>')
    # star facets inside the table
    for i in range(0, n, 2):
        s.append(f'<line x1="{cx:.1f}" y1="{cy:.1f}" x2="{table[i][0]:.1f}" y2="{table[i][1]:.1f}" stroke="{palette[2]}" stroke-width=".8" opacity=".5"/>')
    s.append(f'<polygon points="{pts(outline)}" fill="none" stroke="{palette[4]}" stroke-width="1.4"/>')
    return ''.join(s)

def pts(p): return ' '.join(f'{x:.1f},{y:.1f}' for x, y in p)
def ellipse(cx, cy, rx, ry, n=24, rot=0):
    return [(cx + rx * math.cos(2 * math.pi * i / n + rot), cy + ry * math.sin(2 * math.pi * i / n + rot)) for i in range(n)]
def marquise(cx, cy, w, h, n=28):
    p = []
    for i in range(n):
        t = 2 * math.pi * i / n
        x = cx + w / 2 * math.sin(t) * abs(math.sin(t)) ** .25 * (1 if math.sin(t) >= 0 else 1)
        y = cy - h / 2 * math.cos(t)
        x = cx + (w / 2) * math.sin(t) * (1 - .35 * abs(math.cos(t)) ** 3)
        p.append((x, y))
    return p

DIAMOND = ('#ffffff', '#e4ebf0', '#b7c4cf', '#f3f7fa', '#9aa8b4')
SAPPHIRE = ('#5b86d6', '#1d3f8f', '#0d2259', '#3a63b8', '#0b1b45')

def claw(x, y, r, metal_id='metal', stroke='#8e9297'):
    return f'<ellipse cx="{x:.1f}" cy="{y:.1f}" rx="{r:.1f}" ry="{r*1.15:.1f}" fill="url(#{metal_id})" stroke="{stroke}" stroke-width="1"/><ellipse cx="{x-r*.3:.1f}" cy="{y-r*.35:.1f}" rx="{r*.35:.1f}" ry="{r*.3:.1f}" fill="#fff" opacity=".8"/>'

def band(W, cy, half_w, thick_mid, thick_end, sag, engrave, stroke):
    """Front view of a band running across the picture, curving gently."""
    top, bot = [], []
    for i in range(41):
        t = i / 40
        x = W / 2 - half_w + 2 * half_w * t
        d = abs(t - .5) * 2
        y = cy + sag * (1 - (2 * t - 1) ** 2) * -1 + sag
        th = thick_mid * (1 - d) + thick_end * d
        top.append((x, y - th / 2)); bot.append((x, y + th / 2))
    s = f'<polygon points="{pts(top + bot[::-1])}" fill="url(#metal)" stroke="{stroke}" stroke-width="1.2"/>'
    s += f'<polyline points="{pts(top)}" fill="none" stroke="#fff" stroke-width="1.5" opacity=".8"/>'
    if engrave:
        # repeating leaf-and-scroll engraving, drawn on each shoulder
        for i in list(range(3, 15)) + list(range(26, 38)):
            t = i / 40; x = W / 2 - half_w + 2 * half_w * t
            y = (top[i][1] + bot[i][1]) / 2; th = bot[i][1] - top[i][1]
            r = th * .28
            s += f'<path d="M{x-r*1.6:.1f} {y:.1f} c {r*.4:.1f} {-r*1.2:.1f} {r*1.8:.1f} {-r*1.2:.1f} {r*1.6:.1f} 0 s {-r:.1f} {r*.9:.1f} {-r*.5:.1f} {r*.2:.1f}" fill="none" stroke="{stroke}" stroke-width=".9" opacity=".75"/>'
        for row in (0, 1):
            pl = top if row == 0 else bot
            for i in range(2, 39):
                if 15 < i < 26: continue
                x, y = pl[i]; y += 2.2 if row == 0 else -2.2
                s += f'<circle cx="{x:.1f}" cy="{y:.1f}" r=".9" fill="{stroke}" opacity=".6"/>'
    return s

def frame(W, H, metal, body, vb=None):
    vb = vb or f'0 0 {W} {H}'
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}">{defs(metal)}<rect width="{W}" height="{H}" fill="url(#bg)"/><ellipse cx="{W/2}" cy="{H*.48}" rx="{W*.42}" ry="{H*.42}" fill="url(#glow)"/>{body}</svg>'

# 1. Marquise with pearl side stones and engraved band (wide)
def marquise_ring():
    W, H, cx, cy = 900, 560, 450, 270; st = MET['rose']
    b = f'<ellipse cx="{cx}" cy="{cy+150}" rx="330" ry="22" fill="#8a7563" opacity=".22" filter="url(#shadow)"/>'
    b += band(W, cy + 60, 400, 40, 28, 16, True, st)
    # side stones: soft trapezoids in mother-of-pearl
    for sgn in (-1, 1):
        x0 = cx + sgn * 62
        poly = [(x0, cy - 62), (x0 + sgn * 92, cy - 24), (x0 + sgn * 92, cy + 30), (x0, cy + 68)]
        b += f'<polygon points="{pts(poly)}" fill="url(#pearl)" stroke="{st}" stroke-width="3"/>'
        b += f'<polygon points="{pts([(x0+sgn*14,cy-40),(x0+sgn*70,cy-14),(x0+sgn*70,cy+18),(x0+sgn*14,cy+46)])}" fill="#fff" opacity=".35"/>'
        # small marquise accents
        mx = cx + sgn * 184
        b += facets(marquise(mx, cy + 4, 24, 46, 16), mx, cy + 4, DIAMOND, 3 + sgn)
        b += claw(mx, cy - 20, 5, 'metal', st) + claw(mx, cy + 28, 5, 'metal', st)
    m = marquise(cx, cy, 128, 250)
    b += facets(m, cx, cy, DIAMOND, 7)
    for (x, y) in [(cx, cy - 128), (cx, cy + 128), (cx - 58, cy - 62), (cx + 58, cy - 62), (cx - 58, cy + 62), (cx + 58, cy + 62)]:
        b += claw(x - 5, y, 6.5, 'metal', st) + claw(x + 5, y, 6.5, 'metal', st)
    return frame(W, H, 'rose', b, '130 90 640 400')

# 2. Sapphire with three diamonds at 120 degrees
def sapphire_ring():
    W, H, cx, cy = 700, 520, 350, 250; st = MET['white']
    b = f'<ellipse cx="{cx}" cy="{cy+140}" rx="270" ry="20" fill="#7c828a" opacity=".22" filter="url(#shadow)"/>'
    b += band(W, cy + 56, 330, 34, 26, 12, False, st)
    for ang in (-90, 30, 150):
        a = math.radians(ang); x, y = cx + 92 * math.cos(a), cy + 92 * math.sin(a)
        b += facets(ellipse(x, y, 34, 34, 16), x, y, DIAMOND, ang)
        for k in range(6):
            q = math.radians(k * 60 + 30); b += claw(x + 36 * math.cos(q), y + 36 * math.sin(q), 4.5, 'metal', st)
    b += facets(ellipse(cx, cy, 62, 62, 20), cx, cy, SAPPHIRE, 11)
    for k in range(4):
        q = math.radians(k * 90 + 45); b += claw(cx + 64 * math.cos(q), cy + 64 * math.sin(q), 7, 'metal', st)
    return frame(W, H, 'white', b, '110 100 480 360')

# 3. Oval solitaire on an engraved yellow-gold band
def oval_ring():
    W, H, cx, cy = 700, 520, 350, 245; st = MET['yellow']
    b = f'<ellipse cx="{cx}" cy="{cy+150}" rx="270" ry="20" fill="#8a6a3a" opacity=".22" filter="url(#shadow)"/>'
    b += band(W, cy + 74, 330, 44, 32, 10, True, st)
    o = ellipse(cx, cy, 82, 118, 26, math.pi / 26)
    b += facets(o, cx, cy, DIAMOND, 5)
    for q in (35, 145, 215, 325):
        a = math.radians(q); b += claw(cx + 84 * math.cos(a), cy + 120 * math.sin(a), 8, 'metal', st)
    return frame(W, H, 'yellow', b, '110 90 480 360')

# 4. Side profile showing a hidden halo under an oval stone
def hidden_halo():
    W, H = 700, 520; st = MET['yellow']; cx = 350
    b = f'<ellipse cx="{cx}" cy="455" rx="190" ry="16" fill="#8a6a3a" opacity=".25" filter="url(#shadow)"/>'
    # the shank seen from the side: an ellipse ring
    b += f'<ellipse cx="{cx}" cy="300" rx="150" ry="150" fill="none" stroke="url(#metalV)" stroke-width="22"/>'
    b += f'<ellipse cx="{cx}" cy="300" rx="150" ry="150" fill="none" stroke="{st}" stroke-width="1" opacity=".6"/>'
    b += f'<ellipse cx="{cx}" cy="300" rx="139" ry="139" fill="none" stroke="#fff" stroke-width="1.5" opacity=".5"/>'
    # gallery and hidden halo
    b += f'<path d="M{cx-70} 150 Q {cx} 205 {cx+70} 150" fill="none" stroke="url(#metal)" stroke-width="10"/>'
    for i in range(9):
        x = cx - 64 + i * 16; y = 148 + 0.012 * (x - cx) ** 2 * .6
        b += facets(ellipse(x, y, 7, 7, 10), x, y, DIAMOND, i)
    # claws rising to the stone
    for x0, x1 in ((cx - 58, cx - 78), (cx + 58, cx + 78)):
        b += f'<path d="M{x0} 160 Q {x1} 120 {x1+ (8 if x1<cx else -8)} 92" fill="none" stroke="url(#metalV)" stroke-width="9" stroke-linecap="round"/>'
    # oval stone in profile: crown + pavilion
    crown = [(cx - 112, 112), (cx - 62, 78), (cx + 62, 78), (cx + 112, 112)]
    pav = [(cx - 112, 112), (cx, 168), (cx + 112, 112)]
    b += f'<polygon points="{pts(pav)}" fill="#dfe7ee" stroke="#9aa8b4" stroke-width="1.2"/>'
    for i in range(6):
        x = cx - 112 + i * 44.8
        b += f'<line x1="{x:.1f}" y1="112" x2="{cx}" y2="168" stroke="#b7c4cf" stroke-width="1"/>'
    b += f'<polygon points="{pts(crown)}" fill="#f6f9fb" stroke="#9aa8b4" stroke-width="1.2"/>'
    b += f'<polygon points="{pts([(cx-62,78),(cx-30,112),(cx+30,112),(cx+62,78)])}" fill="#e4ebf0" opacity=".9"/>'
    b += f'<line x1="{cx-112}" y1="112" x2="{cx+112}" y2="112" stroke="#9aa8b4" stroke-width="1.4"/>'
    b += claw(cx - 104, 104, 7, 'metal', st) + claw(cx + 104, 104, 7, 'metal', st)
    # leaf engraving on the shank shoulders
    for a in (200, 215, 230, 310, 325, 340):
        t = math.radians(a); x, y = cx + 150 * math.cos(t), 300 + 150 * math.sin(t)
        b += f'<path d="M{x-6:.1f} {y:.1f} q 6 -9 12 0 q -6 9 -12 0" fill="none" stroke="{st}" stroke-width="1"/>'
    return frame(W, H, 'yellow', b, '150 50 400 300')


# BEFORE 1. 1950s cluster ring: sapphire ringed by eight diamonds on a milgrain plate, yellow gold
def cluster_1950s():
    W, H, cx, cy = 700, 520, 350, 240; st = MET['yellow']
    b = f'<ellipse cx="{cx}" cy="{cy+145}" rx="270" ry="20" fill="#8a6a3a" opacity=".22" filter="url(#shadow)"/>'
    b += band(W, cy + 66, 330, 40, 30, 10, False, st)
    # split shoulders rising to the head
    for sgn in (-1, 1):
        b += f'<path d="M{cx+sgn*190} {cy+60} C {cx+sgn*140} {cy+40} {cx+sgn*120} {cy+10} {cx+sgn*96} {cy}" fill="none" stroke="url(#metal)" stroke-width="10"/>'
        b += f'<path d="M{cx+sgn*190} {cy+80} C {cx+sgn*140} {cy+86} {cx+sgn*118} {cy+60} {cx+sgn*96} {cy+30}" fill="none" stroke="url(#metal)" stroke-width="10"/>'
    b += f'<circle cx="{cx}" cy="{cy}" r="104" fill="url(#metal)" stroke="{st}" stroke-width="2"/>'
    b += ''.join(f'<circle cx="{cx+100*math.cos(math.radians(a)):.1f}" cy="{cy+100*math.sin(math.radians(a)):.1f}" r="3" fill="{st}"/>' for a in range(0, 360, 9))
    b += f'<circle cx="{cx}" cy="{cy}" r="92" fill="none" stroke="{st}" stroke-width="1.2" opacity=".7"/>'
    for i in range(8):
        a = math.radians(i * 45 - 90); x, y = cx + 66 * math.cos(a), cy + 66 * math.sin(a)
        b += f'<circle cx="{x:.1f}" cy="{y:.1f}" r="25" fill="{st}" opacity=".5"/>'
        b += facets(ellipse(x, y, 21, 21, 12), x, y, DIAMOND, i)
        for k in range(4):
            q = math.radians(k * 90 + 45 + i * 45); b += claw(x + 22 * math.cos(q), y + 22 * math.sin(q), 3.4, 'metal', st)
    b += facets(ellipse(cx, cy, 40, 40, 16), cx, cy, SAPPHIRE, 2)
    for k in range(6):
        q = math.radians(k * 60); b += claw(cx + 42 * math.cos(q), cy + 42 * math.sin(q), 4.5, 'metal', st)
    return frame(W, H, 'yellow', b, '110 90 480 360')

# BEFORE 2. 1920s Art Deco ring: long navette plate in white metal, milgrain edge, openwork, old marquise centre
def deco_1920s():
    W, H, cx, cy = 900, 560, 450, 270; st = MET['white']
    b = f'<ellipse cx="{cx}" cy="{cy+150}" rx="330" ry="22" fill="#7c828a" opacity=".22" filter="url(#shadow)"/>'
    b += band(W, cy + 66, 400, 32, 24, 16, True, st)
    plate = marquise(cx, cy, 250, 300, 40)
    b += f'<polygon points="{pts(plate)}" fill="url(#metal)" stroke="{st}" stroke-width="2"/>'
    inner = [(cx + (x - cx) * .9, cy + (y - cy) * .9) for x, y in plate]
    b += ''.join(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="2.6" fill="{st}"/>' for x, y in inner)
    # openwork: little arched windows down each side
    for sgn in (-1, 1):
        for j in range(-2, 3):
            y = cy + j * 40; x = cx + sgn * (78 - abs(j) * 14)
            b += f'<path d="M{x-9:.1f} {y+12:.1f} v-10 a 9 9 0 0 1 18 0 v10 z" fill="#6c7176" opacity=".55"/>'
    # small single-cut diamonds in a line above and below the centre
    for j in (-1, 1):
        for k in range(3):
            y = cy + j * (88 + k * 22); r = 9 - k * 1.6
            b += facets(ellipse(cx, y, r, r, 10), cx, y, DIAMOND, k + 5 * j)
    m = marquise(cx, cy, 70, 130, 24)
    b += facets(m, cx, cy, DIAMOND, 4)
    b += claw(cx, cy - 67, 5, 'metal', st) + claw(cx, cy + 67, 5, 'metal', st)
    return frame(W, H, 'white', b, '130 70 640 400')

# BEFORE 3. 1970s solitaire: small diamond in a tall petal-shaped illusion plate, heavy yellow-gold band
def illusion_1970s():
    W, H, cx, cy = 700, 520, 350, 240; st = MET['yellow']
    b = f'<ellipse cx="{cx}" cy="{cy+150}" rx="270" ry="20" fill="#8a6a3a" opacity=".22" filter="url(#shadow)"/>'
    b += band(W, cy + 74, 330, 58, 46, 8, False, st)
    # petal illusion plate
    for k in range(8):
        a = math.radians(k * 45)
        x, y = cx + 52 * math.cos(a), cy + 58 * math.sin(a)
        b += f'<ellipse cx="{x:.1f}" cy="{y:.1f}" rx="34" ry="30" transform="rotate({k*45} {x:.1f} {y:.1f})" fill="url(#metal)" stroke="{st}" stroke-width="1.5"/>'
    b += f'<ellipse cx="{cx}" cy="{cy}" rx="70" ry="76" fill="url(#metal)" stroke="{st}" stroke-width="1.5"/>'
    for r in (60, 48):
        b += f'<ellipse cx="{cx}" cy="{cy}" rx="{r}" ry="{r*1.08:.1f}" fill="none" stroke="{st}" stroke-width="1" opacity=".7"/>'
    for k in range(16):
        a = math.radians(k * 22.5)
        b += f'<line x1="{cx+28*math.cos(a):.1f}" y1="{cy+30*math.sin(a):.1f}" x2="{cx+62*math.cos(a):.1f}" y2="{cy+66*math.sin(a):.1f}" stroke="{st}" stroke-width="1" opacity=".6"/>'
    o = ellipse(cx, cy, 24, 32, 16, math.pi / 16)
    b += facets(o, cx, cy, DIAMOND, 9)
    for q in (35, 145, 215, 325):
        a = math.radians(q); b += claw(cx + 26 * math.cos(a), cy + 34 * math.sin(a), 4.5, 'metal', st)
    return frame(W, H, 'yellow', b, '110 90 480 360')

# BEFORE 4. Edwardian bar brooch: platinum-look bar with a row of small old-cut diamonds and scrolls
def brooch_1910s():
    W, H, cx, cy = 700, 520, 350, 250; st = MET['white']
    b = f'<ellipse cx="{cx}" cy="{cy+90}" rx="260" ry="18" fill="#7c828a" opacity=".22" filter="url(#shadow)"/>'
    b += f'<rect x="{cx-280}" y="{cy-6}" width="560" height="12" rx="6" fill="url(#metal)" stroke="{st}" stroke-width="1.2"/>'
    b += f'<circle cx="{cx-286}" cy="{cy}" r="12" fill="url(#metal)" stroke="{st}"/><circle cx="{cx+286}" cy="{cy}" r="12" fill="url(#metal)" stroke="{st}"/>'
    for sgn in (-1, 1):
        for k in range(2):
            x = cx + sgn * (120 + k * 70)
            b += f'<path d="M{x-28} {cy} c 0 -30 40 -30 40 -6 c 0 14 -18 16 -20 4" fill="none" stroke="url(#metalV)" stroke-width="5" stroke-linecap="round" transform="{"" if sgn>0 else f"scale(-1 1) translate({-2*x} 0)"}"/>'
    b += f'<ellipse cx="{cx}" cy="{cy}" rx="96" ry="30" fill="url(#metal)" stroke="{st}" stroke-width="1.5"/>'
    b += ''.join(f'<circle cx="{cx+90*math.cos(math.radians(a)):.1f}" cy="{cy+25*math.sin(math.radians(a)):.1f}" r="1.8" fill="{st}"/>' for a in range(0, 360, 10))
    for k in range(7):
        x = cx - 66 + k * 22; r = 10 if k != 3 else 14
        b += facets(ellipse(x, cy, r, r, 10), x, cy, DIAMOND, k)
    return frame(W, H, 'white', b, '40 120 620 260')


EMERALD = ('#5fe0a8', '#0f8a5a', '#06502f', '#2fb67c', '#043a22')
ONYX = ('#4a4d55', '#15161a', '#050506', '#2a2c32', '#000000')
def octagon(cx, cy, w, h, c):
    """Emerald-cut outline: a rectangle with cut corners."""
    x0, x1, y0, y1 = cx - w / 2, cx + w / 2, cy - h / 2, cy + h / 2
    return [(x0 + c, y0), (x1 - c, y0), (x1, y0 + c), (x1, y1 - c), (x1 - c, y1), (x0 + c, y1), (x0, y1 - c), (x0, y0 + c)]
def trillion(cx, cy, w, h, sgn):
    return [(cx - sgn * w / 2, cy - h / 2), (cx + sgn * w / 2, cy), (cx - sgn * w / 2, cy + h / 2)]

# BEFORE 5. Wide diamond dress band: round centre diamond in a diamond-shaped plate with crossing ridges, six smaller diamonds
def dress_band():
    W, H, cx, cy = 900, 560, 450, 270; st = MET['yellow']
    b = f'<ellipse cx="{cx}" cy="{cy+150}" rx="330" ry="22" fill="#8a6a3a" opacity=".22" filter="url(#shadow)"/>'
    b += band(W, cy + 20, 400, 170, 120, 6, False, st)
    # crossing ridges forming an X lattice across the face
    for sgn in (-1, 1):
        b += f'<line x1="{cx-200}" y1="{cy-60+sgn*0}" x2="{cx+200}" y2="{cy+100}" stroke="{st}" stroke-width="3" opacity=".7" transform="{"" if sgn>0 else f"scale(1 -1) translate(0 {-2*cy-40})"}"/>'
    b += f'<polygon points="{pts([(cx,cy-70),(cx+90,cy+20),(cx,cy+110),(cx-90,cy+20)])}" fill="url(#metal)" stroke="{st}" stroke-width="2"/>'
    for (dx, dy) in ((-150, -10), (150, -10), (-150, 60), (150, 60), (-230, 25), (230, 25)):
        x, y = cx + dx, cy + dy
        b += f'<circle cx="{x}" cy="{y}" r="22" fill="{st}" opacity=".45"/>' + facets(ellipse(x, y, 18, 18, 12), x, y, DIAMOND, dx + dy)
    b += facets(ellipse(cx, cy + 20, 50, 50, 18), cx, cy + 20, DIAMOND, 21)
    for q in (0, 90, 180, 270):
        a = math.radians(q); b += claw(cx + 54 * math.cos(a), cy + 20 + 54 * math.sin(a), 7, 'metal', st)
    return frame(W, H, 'yellow', b, '130 90 640 400')

# AFTER 5. The centre diamond in a fine six-claw solitaire, the six smaller diamonds set into a slim white-gold band
def solitaire_six():
    W, H, cx, cy = 700, 520, 350, 240; st = MET['white']
    b = f'<ellipse cx="{cx}" cy="{cy+150}" rx="270" ry="20" fill="#7c828a" opacity=".22" filter="url(#shadow)"/>'
    b += band(W, cy + 80, 330, 22, 16, 8, False, st)
    for sgn in (-1, 1):
        for k in range(3):
            x = cx + sgn * (90 + k * 34); y = cy + 76 + 10 * ((x - cx) / 330) ** 2
            b += facets(ellipse(x, y, 10, 10, 10), x, y, DIAMOND, k * sgn)
    b += facets(ellipse(cx, cy, 62, 62, 20), cx, cy, DIAMOND, 4)
    for k in range(6):
        q = math.radians(k * 60 + 30); b += claw(cx + 64 * math.cos(q), cy + 64 * math.sin(q), 6, 'metal', st)
    return frame(W, H, 'white', b, '110 90 480 360')

# BEFORE 6. Onyx and diamond cocktail ring: emerald-cut onyx, trillion onyx sides, bars of small diamonds, yellow gold
def onyx_cocktail():
    W, H, cx, cy = 900, 560, 450, 260; st = MET['yellow']
    b = f'<ellipse cx="{cx}" cy="{cy+150}" rx="330" ry="22" fill="#8a6a3a" opacity=".22" filter="url(#shadow)"/>'
    b += band(W, cy + 80, 400, 30, 22, 14, False, st)
    b += facets(octagon(cx, cy, 120, 150, 16), cx, cy, ONYX, 2)
    for x, y in ((cx - 62, cy - 77), (cx + 62, cy - 77), (cx - 62, cy + 77), (cx + 62, cy + 77)):
        b += claw(x, y, 7, 'metal', st)
    for sgn in (-1, 1):
        bx = cx + sgn * 86
        b += f'<rect x="{bx-14}" y="{cy-62}" width="28" height="124" rx="6" fill="url(#metal)" stroke="{st}"/>'
        for k in range(4):
            y = cy - 45 + k * 30; b += facets(ellipse(bx, y, 10, 10, 10), bx, y, DIAMOND, k + sgn)
        tx = cx + sgn * 150
        b += facets(trillion(tx, cy, 80, 110, sgn), tx, cy, ONYX, 5 + sgn)
        b += claw(tx - sgn * 40, cy - 55, 6, 'metal', st) + claw(tx - sgn * 40, cy + 55, 6, 'metal', st) + claw(tx + sgn * 40, cy, 6, 'metal', st)
    return frame(W, H, 'yellow', b, '130 80 640 400')

# AFTER 6. The onyx set east-west in a sleek bezel, the eight small diamonds flush-set along a slim band
def onyx_eastwest():
    W, H, cx, cy = 700, 520, 350, 240; st = MET['yellow']
    b = f'<ellipse cx="{cx}" cy="{cy+150}" rx="270" ry="20" fill="#8a6a3a" opacity=".22" filter="url(#shadow)"/>'
    b += band(W, cy + 70, 330, 24, 18, 8, False, st)
    for sgn in (-1, 1):
        for k in range(4):
            x = cx + sgn * (110 + k * 30); y = cy + 68 + 8 * ((x - cx) / 330) ** 2
            b += f'<circle cx="{x:.1f}" cy="{y:.1f}" r="8" fill="{st}" opacity=".5"/>' + facets(ellipse(x, y, 6, 6, 10), x, y, DIAMOND, k)
    o = octagon(cx, cy + 10, 170, 104, 14)
    b += f'<polygon points="{pts(octagon(cx, cy + 10, 186, 120, 18))}" fill="url(#metal)" stroke="{st}" stroke-width="2"/>'
    b += facets(o, cx, cy + 10, ONYX, 3)
    return frame(W, H, 'yellow', b, '110 90 480 360')

# BEFORE 7. Filigree emerald ring: small oval emerald between open scrollwork shoulders, yellow gold
def filigree_emerald():
    W, H, cx, cy = 900, 560, 450, 260; st = MET['yellow']
    b = f'<ellipse cx="{cx}" cy="{cy+150}" rx="330" ry="22" fill="#8a6a3a" opacity=".22" filter="url(#shadow)"/>'
    b += band(W, cy + 30, 400, 110, 34, 10, False, st)
    for sgn in (-1, 1):
        for k in range(4):
            x = cx + sgn * (70 + k * 42)
            for dy in (-14, 22):
                b += f'<path d="M{x-14} {cy+30+dy} c 0 -18 26 -18 26 -2 c 0 10 -12 12 -14 4" fill="none" stroke="#6b4f20" stroke-width="3" stroke-linecap="round" opacity=".75" transform="{"" if sgn>0 else f"scale(-1 1) translate({-2*x} 0)"}"/>'
    o = ellipse(cx, cy + 30, 36, 52, 18, math.pi / 18)
    b += facets(o, cx, cy + 30, EMERALD, 8)
    for q in (40, 140, 220, 320):
        a = math.radians(q); b += claw(cx + 38 * math.cos(a), cy + 30 + 54 * math.sin(a), 5, 'metal', st)
    return frame(W, H, 'yellow', b, '130 80 640 400')

# AFTER 7. The emerald set east-west on a fine stacking band
def emerald_stacker():
    W, H, cx, cy = 700, 520, 350, 240; st = MET['yellow']
    b = f'<ellipse cx="{cx}" cy="{cy+150}" rx="270" ry="20" fill="#8a6a3a" opacity=".22" filter="url(#shadow)"/>'
    b += band(W, cy + 30, 330, 16, 12, 8, False, st)
    o = ellipse(cx, cy + 28, 64, 44, 20)
    b += facets(o, cx, cy + 28, EMERALD, 6)
    for q in (25, 155, 205, 335):
        a = math.radians(q); b += claw(cx + 66 * math.cos(a), cy + 28 + 46 * math.sin(a), 6, 'metal', st)
    return frame(W, H, 'yellow', b, '110 90 480 360')

# BEFORE 8. Emerald cluster ring: oval emerald ringed by twelve diamonds on a chunky yellow-gold band
def emerald_cluster():
    W, H, cx, cy = 700, 520, 350, 240; st = MET['yellow']
    b = f'<ellipse cx="{cx}" cy="{cy+150}" rx="270" ry="20" fill="#8a6a3a" opacity=".22" filter="url(#shadow)"/>'
    b += band(W, cy + 40, 330, 150, 60, 6, False, st)
    for k in range(12):
        a = math.radians(k * 30); x, y = cx + 74 * math.cos(a), cy + 92 * math.sin(a)
        b += facets(ellipse(x, y, 18, 18, 12), x, y, DIAMOND, k)
        b += claw(x + 20 * math.cos(a + .5), y + 20 * math.sin(a + .5), 3.5, 'metal', st)
    b += facets(ellipse(cx, cy, 50, 68, 20, math.pi / 20), cx, cy, EMERALD, 3)
    return frame(W, H, 'yellow', b, '110 90 480 360')

# AFTER 8. The emerald and its diamonds become a light halo pendant on a fine chain
def emerald_pendant():
    W, H, cx, cy = 700, 520, 350, 290; st = MET['yellow']
    b = f'<path d="M110 60 Q {cx} {cy-40} 590 60" fill="none" stroke="url(#metalV)" stroke-width="3"/>'
    b += f'<path d="M110 60 Q {cx} {cy-40} 590 60" fill="none" stroke="{st}" stroke-width="1" stroke-dasharray="3 3" opacity=".6"/>'
    b += f'<ellipse cx="{cx}" cy="{cy-88}" rx="10" ry="16" fill="none" stroke="url(#metal)" stroke-width="5"/>'
    for k in range(12):
        a = math.radians(k * 30); x, y = cx + 52 * math.cos(a), cy + 68 * math.sin(a)
        b += facets(ellipse(x, y, 11, 11, 10), x, y, DIAMOND, k)
    b += f'<ellipse cx="{cx}" cy="{cy}" rx="40" ry="54" fill="none" stroke="url(#metal)" stroke-width="3"/>'
    b += facets(ellipse(cx, cy, 36, 50, 20, math.pi / 20), cx, cy, EMERALD, 3)
    for q in (45, 135, 225, 315):
        a = math.radians(q); b += claw(cx + 37 * math.cos(a), cy + 51 * math.sin(a), 4, 'metal', st)
    return frame(W, H, 'yellow', b, '110 70 480 360')

for name, fn in (('before-band', dress_band), ('after-band', solitaire_six), ('before-onyx', onyx_cocktail), ('after-onyx', onyx_eastwest), ('before-filigree', filigree_emerald), ('after-filigree', emerald_stacker), ('before-emerald-cluster', emerald_cluster), ('after-emerald-pendant', emerald_pendant), ('before-cluster', cluster_1950s), ('before-deco', deco_1920s), ('before-illusion', illusion_1970s), ('before-brooch', brooch_1910s), ('marquise', marquise_ring), ('sapphire', sapphire_ring), ('oval', oval_ring), ('hidden-halo', hidden_halo)):
    open(OUT + name + '.svg', 'w').write(fn())
print('ok')
