import tomllib
import importlib
from pathlib import Path
from dataclasses import dataclass

from symdexer.symbols import SYM_TYPES


__all__ = "Settings", "load_settings"


@dataclass
class Settings:
    cache: Path
    order: list[str]
    packages: list[Path]


def load_settings(file: str):
    path = Path(file)

    if not path.is_file():
        raise FileNotFoundError(f"settings file `{file}` does not exist")

    with path.open("rb") as fp:
        data = tomllib.load(fp)

        if any(sym_type not in SYM_TYPES for sym_type in data["default_order"]):
            raise ValueError(f"invalid symbol type in order, values must be {list(SYM_TYPES)}")

        return Settings(Path(data["cache"]), data["default_order"], list(load_packages(data["packages"])))


def load_packages(packages: dict[str, str]):
    for name, path in packages.items():
        if path:
            p = Path(path)

            if not p.is_dir():
                raise ImportError(f"package `{name}` must be a folder")

            yield p
            continue

        p = Path(importlib.import_module(name).__file__)

        if not p.is_file() or p.name.lower() != "__init__.py":
            raise ImportError(f"module `{name}` is not a package")

        yield p.parent
