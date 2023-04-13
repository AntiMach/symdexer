from pathlib import Path
from typing import NamedTuple


__all__ = "Module", "walk_modules"


class Module(NamedTuple):
    path: Path
    name: str


def walk_modules(path: Path, prefix: str = ""):
    if not prefix:
        prefix = path.stem

    if path.is_file():
        if path.suffix == ".py":
            yield Module(path, prefix)
        return

    for subpath in path.iterdir():
        yield from walk_modules(
            subpath,
            prefix if subpath.stem == "__init__" else f"{prefix}.{subpath.stem}",
        )
