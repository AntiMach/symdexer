import tomllib
from pathlib import Path
from dataclasses import dataclass

from symdexer.symbols import SYM_TYPES


__all__ = "Settings", "load_settings"


@dataclass
class Settings:
    cache: Path
    order: list[str]
    packages: dict[str, Path]


def load_settings(file: str):
    path = Path(file)

    if not path.is_file():
        with path.open("w", encoding="utf-8") as fp:
            fp.write('cache = "symdex.db"\n')
            fp.write('order = ["defines", "assigns", "imports"]\n')
            fp.write("\n")
            fp.write("[packages]\n")
            fp.write('package_name = "path/to/package"\n')

    with path.open("rb") as fp:
        data = tomllib.load(fp)

        if any(sym_type not in SYM_TYPES for sym_type in data["order"]):
            raise ValueError(f"invalid symbol type in order, values must be {list(SYM_TYPES)}")

        return Settings(
            Path(data["cache"]), data["order"], {name: Path(path) for name, path in data["packages"].items()}
        )
