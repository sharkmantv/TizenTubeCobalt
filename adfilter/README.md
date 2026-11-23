# Cobalt experimental ad-filter APK (fork branch adex)

This branch is **only an experiment**. The GitHub Actions workflow compiles a
targeted JavaScript ad-renderer filter from the public \`reisxd/TizenTube\`
source, publishes the patched compiled userscript as \`js1.js\` on this branch,
downloads the official TizenTube Cobalt v2.0.3 ARM APK, changes **one same-length
URL string** in its \`libchrobalt.so\`, then re-signs the APK for testing.

Original downloads:
- Cobalt: https://github.com/reisxd/TizenTubeCobalt/releases/tag/v2.0.3
- TizenTube userscript source: https://github.com/reisxd/TizenTube

## Build and outputs

On a push to branch \`adex\`, the workflow
\`.github/workflows/cobalt-adfilter-apk.yml\` builds and uploads an artifact named
\`TizenTube-Cobalt-ARM-AdFilter-Experimental\`.

**Not tested on a TV or phone.** Adverts can still slip through due to upstream
response changes. This is not a guaranteed ad-free build. Userscript injection
still uses a remote URL. Sign-in and playback could be affected by a new build.

**Do not replace the working install until backed up.** It is test-signed, and
does not share the official APK signature, so an in-place upgrade may fail.

### License

Modifications are distributed against \`reisxd/TizenTube\` (GPL-3.0-only).
This directory provides the source patch. The Cobalt fork retains its own
upstream license terms. Do not present this experimental APK as an official release.
