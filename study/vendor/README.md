# Browser dependencies

These packages are served from the same origin as the trainer, rather than loaded from a third-party CDN at runtime.

- `supabase-js-2.115.0/supabase.js`: unchanged UMD bundle from the official npm package `@supabase/supabase-js@2.115.0`, MIT license included. SHA-256: `f387e5935730a6d9599a281986a176eafce5ebbe7514446222d21aa029e31dd5`.
- `mathjax-3.2.2/es5/`: complete browser distribution from the official npm package `mathjax@3.2.2`, Apache-2.0 license included. Includes fonts and dynamically loaded extensions so they do not fall back to the CDN.

Versions match the versions returned by the previously used jsDelivr URLs on 2026-09-06. Packages were downloaded with `npm pack --ignore-scripts`; no package lifecycle scripts were executed.

Local hosting of these files removes the CDN requests. It does not relocate GitHub Pages or establish legal compliance on its own.
