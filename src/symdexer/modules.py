from __future__ import annotations

from pathlib import Path
from typing import Iterator
from functools import lru_cache
from dataclasses import dataclass


@dataclass(frozen=True)
class Module:
    path: Path
    name: str

    @property
    @lru_cache(maxsize=None)
    def path_str(self) -> str:
        return str(self.path.resolve())

    @property
    @lru_cache(maxsize=None)
    def mtime(self) -> int:
        return int(self.path.stat().st_mtime)

    @property
    @lru_cache(maxsize=True)
    def info(self) -> tuple[str, str, int]:
        return self.name, self.path_str, self.mtime


def walk_modules(path: Path, prefix: str = "") -> Iterator[Module]:
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
