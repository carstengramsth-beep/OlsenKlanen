"""Laver samlekortet: alle motiver i et gitter + en tom plads med opfordring.
Brug: python3 samlekort.py <repo-mappe>"""
import sys, os
from PIL import Image, ImageDraw, ImageFont, ImageOps

repo = sys.argv[1]
d = os.path.join(repo, "billeder", "kort")
filer = ["hulemaleri", "landskab-2014", "landskab-2012", "balletdanser", "frugter-abstrakt",
         "kvinde-i-farver", "vinterstemning", "paeoner-i-haven", "damen-med-guldhaar",
         "esther-1", "esther-fastelavn", "esther-halloween", "esther-jul", "esther-paaske"]

W, H = 1600, 1140
M, G = 34, 18
COLS, ROWS = 5, 3
cw = (W - 2 * M - (COLS - 1) * G) // COLS
ch = (H - 2 * M - (ROWS - 1) * G) // ROWS
bund = (247, 243, 234)
kant = (220, 210, 190)
groen = (45, 80, 22)

ark = Image.new("RGB", (W, H), bund)
tegn = ImageDraw.Draw(ark)

def celle(i):
    r, c = divmod(i, COLS)
    return M + c * (cw + G), M + r * (ch + G)

for i, navn in enumerate(filer):
    im = ImageOps.exif_transpose(Image.open(os.path.join(d, navn + ".jpg"))).convert("RGB")
    im.thumbnail((cw - 12, ch - 12), Image.LANCZOS)
    x, y = celle(i)
    tegn.rectangle([x, y, x + cw - 1, y + ch - 1], fill="white", outline=kant, width=2)
    ark.paste(im, (x + (cw - im.width) // 2, y + (ch - im.height) // 2))

# Sidste plads: opfordring
x, y = celle(len(filer))
tegn.rectangle([x, y, x + cw - 1, y + ch - 1], fill="white", outline=groen, width=4)
f_stor = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf", 34)
f_lille = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf", 22)
linjer = [("Din", f_stor), ("tegning", f_stor), ("eller dit", f_lille), ("maleri", f_stor), ("her?", f_stor)]
hoejder = [tegn.textbbox((0, 0), t, font=f)[3] + 14 for t, f in linjer]
yy = y + (ch - sum(hoejder)) // 2
for (t, f), h in zip(linjer, hoejder):
    bw = tegn.textbbox((0, 0), t, font=f)[2]
    tegn.text((x + (cw - bw) // 2, yy), t, font=f, fill=groen)
    yy += h

ark.save(os.path.join(d, "samlekort.jpg"), quality=88)
print("ok", ark.size)
