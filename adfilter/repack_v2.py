#!/usr/bin/env python3
"""Change only the official remote userscript URL; preserve native playback."""
import sys
from pathlib import Path
from zipfile import ZipFile
ORIGINAL = b"https://cdn.jsdelivr.net/npm/@foxreis/tizentube/dist/userScript.js?v="
REPLACEMENT = b"https://cdn.jsdelivr.net/gh/sharkmantv/TizenTubeCobalt@ad2/safe.js?v="
assert len(ORIGINAL) == len(REPLACEMENT) == 69
src, dst = map(Path, sys.argv[1:3])
changed = 0
with ZipFile(src) as original, ZipFile(dst, "w") as output:
    for entry in original.infolist():
        name = entry.filename
        if name.startswith("META-INF/") and (name.endswith((".SF",".RSA",".DSA",".EC")) or name == "META-INF/MANIFEST.MF"):
            continue
        data = original.read(name)
        if name == "lib/armeabi-v7a/libchrobalt.so":
            changed = data.count(ORIGINAL)
            assert changed == 1, f"Expected exactly one official userscript URL; found {changed}"
            data = data.replace(ORIGINAL, REPLACEMENT, 1)
            assert len(data) == entry.file_size
        output.writestr(entry, data)
assert changed == 1
with ZipFile(dst) as result:
    assert result.testzip() is None
    assert REPLACEMENT in result.read("lib/armeabi-v7a/libchrobalt.so")
print("Patched exactly one equal-length remote script URL in libchrobalt.so; untouched playback engine")
