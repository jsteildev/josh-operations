# Photo Swipe

A mobile-first, swipe-to-curate photo app. Static only: no backend, no build
step, no npm. Open a batch on your phone, swipe through the photos, and send
back one short results code that records every decision.

## What it does

You (or someone you trust with the batch password) flip through a set of
photos one at a time and make a call on each:

| Gesture / key        | Decision | Meaning                                  |
|----------------------|----------|------------------------------------------|
| Swipe left / ←       | Archive  | File it away in the Archived album       |
| Swipe right / →      | Keep     | Leave it in the library, no album change |
| Swipe up / ↑         | IG Pick  | Add it to the IG Picks album             |

On-screen buttons do the same thing, and Undo (or the Z key) restores the
last swiped card. A counter ("7 / 40") and progress bar track where you are.

When the last photo is decided you get a summary (kept N, archived M,
IG picks K) and a **results code** like:

```
SWIPE:b1:GA
```

Copy it or read it out. Whoever runs the organizer decodes it and applies
each decision to the matching photo in iCloud Photos.

## Building a batch

```bash
python3 make_batch.py <source_dir> <output_dir> --batch-id b1 --password secret
```

- Reads `.jpg .jpeg .png .heic .heif` (HEIC needs `pip install pillow-heif`;
  without it those files are skipped with a warning).
- Sorts by filename, resizes so the long edge is at most 1600px, converts to
  JPEG quality 82, writes `photos/001.jpg`, `002.jpg`, ... in order.
- Copies `index.html`, `styles.css`, `app.js` into the output dir and writes
  `manifest.json` (`{batch_id, photos: [...]}`) plus a `config.js` carrying
  the batch id and password.
- Prints a summary: images found, images written, output dir.

Serve a batch over HTTP (opening `index.html` from disk blocks the manifest
fetch in most browsers):

```bash
python3 -m http.server --directory <output_dir> 8000
```

then open `http://<your-machine>:8000` on the phone. Any static host
(Vercel, Netlify, GitHub Pages) works the same way.

## The results code

Format: `SWIPE:<batch_id>:<payload>`

The payload is base64url (no padding) of the decisions packed at 2 bits per
photo, in manifest order, first photo in the most significant bits of the
first byte:

- `00` = keep
- `01` = archive
- `10` = IG pick
- (`11` is unused; treat it as keep)

The final byte is zero-padded in its low bits. Decode example:

```python
import base64

def decode_results(code, photo_count):
    kind, batch_id, payload = code.split(":")
    assert kind == "SWIPE"
    raw = base64.urlsafe_b64decode(payload + "=" * (-len(payload) % 4))
    decisions = []
    for byte in raw:
        for shift in (6, 4, 2, 0):
            decisions.append((byte >> shift) & 0b11)
    decisions = decisions[:photo_count]
    names = {0: "keep", 1: "archive", 2: "igpick"}
    return batch_id, [names.get(d, "keep") for d in decisions]

batch_id, decisions = decode_results("SWIPE:b1:GA", 4)
print(batch_id, decisions)  # b1 ['keep', 'archive', 'igpick', 'keep']
```

## Privacy note

The password gate is casual obfuscation, not real security: anyone who can
reach the hosted files can read them. Treat each batch as a disposable,
shareable envelope:

- Use a fresh password per batch (or per person).
- Do not reuse a batch URL after the decisions are in; delete or rotate it.
- The photos in a batch are downscaled copies (1600px long edge), not your
  originals.
- Nothing is uploaded anywhere by the app itself. The only thing that leaves
  the phone is the results code, which you copy and send yourself.
