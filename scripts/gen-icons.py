"""
Nova Studio — Icon Generator (Pillow-based, no cairosvg needed)

Renders the icon from the SVG geometry directly using Pillow's polygon/rectangle
drawing, with 4× supersampling for clean antialiasing.

Icon design (from icon.svg):
  Background: #0C0C0C (320×320)
  Two vertical stems:  #EDEDED  (left: 52-106 x, right: 214-268 x, full height)
  Diagonal cross-bar:  #9A9A9A  (top-left to bottom-right)
  Corner fills:        #FFFFFF  (top of left stem, bottom of right stem triangles)

All paths are defined at 320×320. We scale everything for each output size.
"""

import os, struct, io
from PIL import Image, ImageDraw

ICONS_DIR = os.path.join(os.path.dirname(__file__), '..', 'src-tauri', 'icons')

# ── Geometry constants (at 320×320) ────────────────────────────────────────
BG        = (12,  12,  12, 255)   # #0C0C0C
STEM      = (237, 237, 237, 255)  # #EDEDED — stems
DIAG      = (154, 154, 154, 255)  # #9A9A9A — diagonal bar
WHITE     = (255, 255, 255, 255)  # #FFFFFF — corner fills

def render(size: int, aa: int = 4) -> Image.Image:
    """Render the icon at `size`×`size` with `aa`× supersampling."""
    S   = size * aa
    f   = S / 320.0          # scale factor

    img  = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 1. Background — full square (Tauri handles rounding via OS)
    draw.rectangle([0, 0, S - 1, S - 1], fill=BG)

    # 2. Diagonal bar (drawn before stems so stems sit on top)
    #    SVG: M52,52 L120,52 L268,268 L200,268 Z
    diag_pts = [
        (int(52  * f), int(52  * f)),
        (int(120 * f), int(52  * f)),
        (int(268 * f), int(268 * f)),
        (int(200 * f), int(268 * f)),
    ]
    draw.polygon(diag_pts, fill=DIAG)

    # 3. Left stem  — rect 52→106, 52→268
    draw.rectangle([int(52*f), int(52*f), int(106*f)-1, int(268*f)-1], fill=STEM)

    # 4. Right stem — rect 214→268, 52→268
    draw.rectangle([int(214*f), int(52*f), int(268*f)-1, int(268*f)-1], fill=STEM)

    # 5. White triangle — top of left stem
    #    SVG: M106,130.811 L52,52 L106,52 Z
    tri_tl = [
        (int(106   * f), int(130.811 * f)),
        (int(52    * f), int(52      * f)),
        (int(106   * f), int(52      * f)),
    ]
    draw.polygon(tri_tl, fill=WHITE)

    # 6. White triangle — bottom of right stem
    #    SVG: M214,189.189 L268,268 L214,268 Z
    tri_br = [
        (int(214 * f), int(189.189 * f)),
        (int(268 * f), int(268     * f)),
        (int(214 * f), int(268     * f)),
    ]
    draw.polygon(tri_br, fill=WHITE)

    # Downsample with LANCZOS for antialiasing
    img = img.resize((size, size), Image.LANCZOS)
    return img


def save_png(size: int, filename: str):
    path = os.path.join(ICONS_DIR, filename)
    img  = render(size)
    img.save(path, format='PNG', optimize=True)
    print(f'  {filename:<40} {size:>4}×{size}')


# ── ICO builder ────────────────────────────────────────────────────────────
def build_ico(sizes=(16, 24, 32, 48, 64, 128, 256)) -> bytes:
    images = []
    for sz in sizes:
        img = render(sz)
        buf = io.BytesIO()
        img.save(buf, format='PNG')
        images.append((sz, buf.getvalue()))

    count      = len(images)
    header     = struct.pack('<HHH', 0, 1, count)
    dir_offset = 6 + 16 * count
    entries    = b''
    data       = b''

    for (sz, png_data) in images:
        w            = sz if sz < 256 else 0
        file_offset  = dir_offset + len(data)
        entries     += struct.pack('<BBBBHHII', w, w, 0, 0, 1, 32, len(png_data), file_offset)
        data        += png_data

    return header + entries + data


# ── ICNS builder ───────────────────────────────────────────────────────────
ICNS_TYPES = {
    16:   b'icp4', 32:  b'icp5', 64:  b'icp6',
    128:  b'ic07', 256: b'ic08', 512: b'ic09', 1024: b'ic10',
}

def build_icns() -> bytes:
    chunks = b''
    for sz, type_code in ICNS_TYPES.items():
        img = render(sz)
        buf = io.BytesIO()
        img.save(buf, format='PNG')
        png = buf.getvalue()
        chunks += type_code + struct.pack('>I', len(png) + 8) + png
    total  = 8 + len(chunks)
    return b'icns' + struct.pack('>I', total) + chunks


# ── Generate all files ─────────────────────────────────────────────────────
print('\n── Generating Nova Studio icons ────────────────────────────')
os.makedirs(ICONS_DIR, exist_ok=True)

# Standard PNGs required by Tauri
save_png(32,   '32x32.png')
save_png(128,  '128x128.png')
save_png(256,  '128x128@2x.png')
save_png(512,  'icon.png')

# Windows Store sizes
for size, name in [
    (30,  'Square30x30Logo.png'),
    (44,  'Square44x44Logo.png'),
    (71,  'Square71x71Logo.png'),
    (89,  'Square89x89Logo.png'),
    (107, 'Square107x107Logo.png'),
    (142, 'Square142x142Logo.png'),
    (150, 'Square150x150Logo.png'),
    (284, 'Square284x284Logo.png'),
    (310, 'Square310x310Logo.png'),
    (50,  'StoreLogo.png'),
]:
    save_png(size, name)

# ICO (Windows taskbar / exe)
ico_data = build_ico((16, 24, 32, 48, 64, 128, 256))
with open(os.path.join(ICONS_DIR, 'icon.ico'), 'wb') as f:
    f.write(ico_data)
print(f'  {"icon.ico":<40} multi-size (16→256)')

# ICNS (macOS)
icns_data = build_icns()
with open(os.path.join(ICONS_DIR, 'icon.icns'), 'wb') as f:
    f.write(icns_data)
print(f'  {"icon.icns":<40} multi-size (16→1024)')

print('\n✓  All icons generated.\n')
