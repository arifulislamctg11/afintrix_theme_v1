# Brand images

Derived from the client's brand files in
`Fiverr Clients/Philip/Afintrix Theme/Brand details/` by
`scripts/make_brand_assets.py` — do not hand-edit; regenerate instead.

| file | source | notes |
| --- | --- | --- |
| `afintrix-logo.png` | `Afintrix TM SYMBOL-ID-01.png` | Full lockup, 720x492. The master has an **opaque white** background, so the surround is keyed out by flood-filling inwards from the corners; interior whites and every artwork colour are left untouched. |
| `afintrix-symbol.png` | `favicon-01.png` | Symbol on a padded transparent square, 155x155. Used for the module rail tile and the desk logo. |
| `afintrix-favicon.png` | `favicon-01.png` | Same square without padding, 134x134, so it still reads at 16px. |

`favicon-01.png` already ships with real transparency, which is why the symbol
assets come from it rather than from the larger master — no keying, no
upscaling.

The wordmark is blue on blue-dark, so `afintrix-logo.png` needs a light
backdrop; the rail uses the symbol on a white tile for the same reason.
