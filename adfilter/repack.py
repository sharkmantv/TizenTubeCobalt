#!/usr/bin/env python3
"""Patch ONLY the equal-length userscript URL in the official Cobalt ARM .so."""
import sys, zipfile
from pathlib import Path
ORIGINAL = b"https://cdn.jsdelivr.net/npm/@foxreis/tizentube/dist/userScript.js?v="
REPLACEMENT = b"https://cdn.jsdelivr.net/gh/sharkmantv/TizenTubeCobalt@adex/js1.js?v="
assert len(ORIGINAL) == len(REPLACEMENT) == 69
src, dst = map(Path, sys.argv[1:3])
n = 0
with zipfile.ZipFile(src, "r") as original, zipfile.ZipFile(dst, "w") as output:
    for item in original.infolist():
        name = item.filename
        # Drop old v1 signature files. Android v2 signature is removed by ZIP rewrite.
        if name.startswith("META-INF/") and (name.endswith((".SF", ".RSA", ".DSA", ".EC")) or name == "META-INF/MANIFEST.MF"):
            continue
        data = original.read(name)
        if name == "lib/armeabi-v7a/libchrobalt.so":
            n = data.count(ORIGINAL)
            assert n == 1, f"Expected 1 userScript URL, found {n}"
            data = data.replace(ORIGINAL, REPLACEMENT, 1)
            assert len(data) == item.file_size
        output.writestr(item, data)
assert n == 1
with zipfile.ZipFile(dst) as result:
    assert result.testzip() is None
    assert REPLACEMENT in result.read("lib/armeabi-v7a/libchrobalt.so")
print("Patched 1 native URL, no playback methods changed")
