"""Crop each render around the piece (4:3, with breathing room) and save web-sized WebP into assets/designs."""
import sys, pathlib
from PIL import Image, ImageChops
here = pathlib.Path(__file__).parent
dest = here.parent.parent / 'assets' / 'designs'
for png in sorted((here / 'out').glob('*.png')):
    if png.stem in ('pair', 'crop', 't', 'sheet1', 'sheet2'): continue
    im = Image.open(png).convert('RGB')
    w, h = im.size
    # background reference: the same image with the piece removed is not available, so compare with a blurred copy of the corners' colour ramp
    bg = Image.new('RGB', im.size)
    for y in range(h):
        c = im.getpixel((5, y)); bg.paste(c, (0, y, w, y + 1))
    diff = ImageChops.difference(im, bg).convert('L').point(lambda v: 255 if v > 18 else 0)
    box = diff.getbbox() or (0, 0, w, h)
    if png.stem not in ('before-brooch', 'after-emerald-circle'):
        # rings: frame the head and the upper part of the band, like a close product shot
        bh0 = box[3] - box[1]
        box = (box[0], box[1] - bh0 * 0.15, box[2], box[1] + bh0 * 0.66)
    cx, cy = (box[0] + box[2]) / 2, (box[1] + box[3]) / 2
    bw, bh = (box[2] - box[0]) * 1.12, (box[3] - box[1]) * 1.18
    cw = max(bw, bh * 4 / 3, 480); ch = cw * 3 / 4
    cw, ch = min(cw, w), min(ch, h)
    x0 = min(max(cx - cw / 2, 0), w - cw); y0 = min(max(cy - ch / 2, 0), h - ch)
    out = im.crop((int(x0), int(y0), int(x0 + cw), int(y0 + ch))).resize((800, 600), Image.LANCZOS)
    out.save(dest / (png.stem + '.webp'), quality=82, method=6)
    print(png.stem, box)
