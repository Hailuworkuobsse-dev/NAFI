# PWA icons

Place these PNG files in this folder before shipping:

- `icon-192.png` (192×192)
- `icon-512.png` (512×512)
- `icon-512-maskable.png` (512×512, respects safe area)

The manifest in `apps/web/vite.config.ts` references all three. If any
are missing, the PWA still installs — the browser falls back to a
default icon or the `theme_color` block.
