# Cobalt AdFilter V2 — not device verified

This branch is a separate experimental test, **not an official release**.
The previous trial on branch \`adex\` FAILED on a TV: it exposed five-second
YouTube pre-roll video ads as well as leaving sponsored Home content visible.

## What is different in V2

The official deployed TizenTube JavaScript is downloaded from
\`https://cdn.jsdelivr.net/npm/@foxreis/tizentube/dist/userScript.js?v=2.0.3\`
without editing its bytes. The only added JavaScript is
\`adfilter/safe_addon.js\`, run AFTER the original code, filtering narrowly
identified advertising renderers from Home/shelves/continuations only.
This removes the risky replacement of the complete script with fresh compiled
source from the prior attempt.

GitHub Actions checks the official JavaScript is an unchanged prefix and
checks the patched CDN serves the exact same output published on the branch.
The Android APK is the official TizenTube Cobalt ARM v2.0.3 with one
equal-length native script URL string changed, then re-signed with an
experimental key. No Cobalt decoder or video code is changed.

**Not tested on the user's television:** successful CI, signature, and URL
checks cannot prove that adverts are actually blocked during playback.
Do not uninstall a working app without backing up sign-in and settings.
App signed with an experimental key cannot be installed as an update to the
official app.

Original Cobalt source license is per its upstream repository. TizenTube's
\`userScript.js\` is GPL-3.0-only. The patched copy retains its source
provenance and attribution; do not misrepresent this as an official release.

Running the workflow produces an Actions artifact
\`TizenTubeCobalt-ARM-AdFilter-v2-TEST\`, NOT a final release.
