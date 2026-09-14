"""Cut the Afintrix desk assets out of the client's brand files.

Run with the bench's python (it already has Pillow):

    ~/frappe-bench/env/bin/python make_brand_assets.py <src-dir> <out-dir>

Two sources, because they differ in a way that matters:

  lockup-master.png  4167x4167, the full lockup (symbol + AFINTRIX wordmark +
                     ADVISORY ANALYTICS strapline) on an **opaque white**
                     background — its alpha channel is uniformly 255.
  symbol-134.png     134x134, the symbol alone with genuine transparency.

So the symbol assets come from the small file (already keyed, and 134px is
ample for a 34px rail tile and a 32px favicon — no upscaling needed), and only
the lockup needs its white background removed. That is done by flood-filling
inwards from the corners rather than by keying on brightness, so the artwork's
own colours — especially the light gold of the swoosh and the strapline — are
left exactly as the client supplied them.
"""

import sys
from pathlib import Path

from PIL import Image, ImageDraw

# How far a pixel may sit from pure white and still count as background.
WHITE_TOLERANCE = 12


def key_white_background(img):
	"""Make the white surround transparent, leaving interior whites alone.

	Flood-filling from the four corners only reaches background that is
	connected to the edge, so white *inside* the artwork survives and no
	colour channel is touched.
	"""
	img = img.convert("RGBA")
	# Flood fill needs a colour no pixel already uses as its key.
	marker = (255, 0, 255, 0)
	work = img.copy()

	for corner in [
		(0, 0),
		(work.width - 1, 0),
		(0, work.height - 1),
		(work.width - 1, work.height - 1),
	]:
		ImageDraw.floodfill(work, corner, marker, thresh=WHITE_TOLERANCE)

	pixels = work.load()
	for y in range(work.height):
		for x in range(work.width):
			if pixels[x, y] == marker:
				pixels[x, y] = (255, 255, 255, 0)

	return work


def alpha_bbox(img, threshold=8):
	return img.getchannel("A").point(lambda a: 255 if a > threshold else 0).getbbox()


def trim(img, threshold=8):
	box = alpha_bbox(img, threshold)
	return img.crop(box) if box else img


def square(img, pad_ratio=0.0):
	"""Centre `img` on a transparent square canvas. Pads, never resamples."""
	side = int(round(max(img.size) * (1 + pad_ratio)))
	canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
	canvas.paste(img, ((side - img.width) // 2, (side - img.height) // 2), img)
	return canvas


def fit(img, width):
	height = round(img.height * width / img.width)
	return img.resize((width, height), Image.LANCZOS)


def main():
	src = Path(sys.argv[1] if len(sys.argv) > 1 else ".")
	out = Path(sys.argv[2] if len(sys.argv) > 2 else "out")
	out.mkdir(parents=True, exist_ok=True)

	written = []

	# Full lockup — login page, splash, print formats: anywhere with room for
	# the words. 720px wide covers a 2x retina render of frappe's login mark.
	lockup = trim(key_white_background(Image.open(src / "lockup-master.png")))
	lockup = fit(lockup, width=720)
	lockup.save(out / "afintrix-logo.png", optimize=True)
	written.append(("afintrix-logo.png", lockup.size))

	symbol = trim(Image.open(src / "symbol-134.png").convert("RGBA"))

	# Symbol on a square canvas for the 64px module rail. The padding keeps it
	# off the edge of its rounded tile.
	mark = square(symbol, pad_ratio=0.16)
	mark.save(out / "afintrix-symbol.png", optimize=True)
	written.append(("afintrix-symbol.png", mark.size))

	# Favicon — same square, no padding so it still reads at 16px.
	icon = square(symbol)
	icon.save(out / "afintrix-favicon.png", optimize=True)
	written.append(("afintrix-favicon.png", icon.size))

	for name, size in written:
		print(f"{name}: {size[0]}x{size[1]}")


if __name__ == "__main__":
	main()
