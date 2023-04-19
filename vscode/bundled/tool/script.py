import os
import sys
from pathlib import Path

site_packages: Path = Path(".") / os.getenv("VENV_DIR") / "lib" / "site-packages"
bundled_libs: Path = Path(__file__).parent.parent / "libs"

sys.path.insert(0, str(site_packages.resolve()))
sys.path.insert(0, str(bundled_libs.resolve()))

from symdexer.main import main

main()
