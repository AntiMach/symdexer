from __future__ import annotations

from pathlib import Path
from typing import Generator
from dataclasses import dataclass
from functools import lru_cache


@dataclass(frozen=True)
class Module:
    path: Path
    name: str

    @property
    @lru_cache(maxsize=None)
    def mtime(self):
        return int(self.path.stat().st_mtime)


def walk_modules(path: Path, prefix: str = "") -> Generator[Module, None, None]:
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
