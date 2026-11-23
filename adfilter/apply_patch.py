#!/usr/bin/env python3
"""Patch a clean checkout of reisxd/TizenTube with conservative ad filtering."""
from pathlib import Path
import sys
def main():
    root = Path(sys.argv[1])
    target = root / "mods/features/adblock.js"
    extra = root / "mods/features/enhanced_filter.js"
    s = target.read_text()
    anchor = "import { configRead } from '../config.js';"
    hook = '    // Drop "masthead" ad from home screen'
    assert s.count(anchor) == 1, "Upstream import changed"
    assert s.count(hook) == 1, "Upstream adblock layout changed"
    assert not extra.exists(), "Patch already present"
    s = s.replace(anchor, anchor + "\nimport { cleanKnownPromotions } from './enhanced_filter.js';", 1)
    s = s.replace(hook, "    if (adBlockEnabled) cleanKnownPromotions(r);\n\n" + hook, 1)
    target.write_text(s)
    extra.write_bytes((Path(__file__).parent / "enhanced_filter.js").read_bytes())
    print("Applied conservative ad-renderer filter")
if __name__ == "__main__": main()
