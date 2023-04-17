from __future__ import annotations

import importlib
from pathlib import Path
from argparse import ArgumentTypeError


def is_package(path: Path) -> bool:
    return path.is_dir() or (path.is_file() and path.suffix == ".py")


def package_type(name: str) -> Path:
    path = Path(name)

    if path.exists():
        if is_package(path):
            return path
        raise ArgumentTypeError(f"`{path}` does not lead to a package")

    try:
        path = Path(importlib.import_module(name).__file__)
    except ImportError:
        raise ArgumentTypeError(f"`{name} is not a package`") from None

    if path.stem == "__init__":
        path = path.parent

    return path
