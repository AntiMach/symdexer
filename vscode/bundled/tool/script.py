import os
import sys
from pathlib import Path

# sourcery skip: use-named-expression
venv_dir = os.getenv("VENV_DIR")

if venv_dir:
    site_packages = Path(".") / venv_dir / "lib" / "site-packages"
    sys.path.insert(0, str(site_packages.resolve()))

bundled_libs = Path(__file__).parent.parent / "libs"
sys.path.insert(0, str(bundled_libs.resolve()))

from symdexer.__main__ import main

main()
