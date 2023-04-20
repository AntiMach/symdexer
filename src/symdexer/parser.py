from __future__ import annotations

import importlib
from pathlib import Path
from argparse import ArgumentParser, ArgumentTypeError, Namespace, _SubParsersAction

from symdexer.symbols import SYM_TYPES
from symdexer.__version__ import NAME, VERSION


class Arguments(Namespace):
    cache: Path
    command: str

    symbols: list[str]
    types: list[str]
    fuzzy: bool

    packages: list[Path]
    reset: bool


def _package_type(name: str) -> Path:
    path = Path(name)

    if path.exists():
        if path.is_dir() or (path.is_file() and path.suffix == ".py"):
            return path
        raise ArgumentTypeError(f"`{path}` is not a package")

    try:
        path = Path(importlib.import_module(name).__file__)
    except ImportError:
        raise ArgumentTypeError(f"`{name} is not a package`") from None

    if path.stem == "__init__":
        path = path.parent

    return path


def _index_parser(sub_parsers: _SubParsersAction[ArgumentParser]) -> None:
    parser = sub_parsers.add_parser(
        "index",
        help="Load symbols into cache",
    )

    parser.add_argument(
        "packages",
        metavar="PACKAGE",
        nargs="+",
        type=_package_type,
        help="The packages to add to cache. May be package names or paths",
    )
    parser.add_argument(
        "-r",
        "--reset",
        dest="reset",
        action="store_true",
        default=False,
        help="If the cache should be completely wiped",
    )


def _find_parser(sub_parsers: _SubParsersAction[ArgumentParser]) -> None:
    parser = sub_parsers.add_parser(
        "find",
        help="Searches the cache for symbols matching a list of patterns",
    )

    parser.add_argument(
        "symbols",
        metavar="SYMBOL",
        nargs="+",
        help="The symbols to look for",
    )
    parser.add_argument(
        "-f",
        "--fuzzy",
        dest="fuzzy",
        action="store_true",
        default=False,
        help="If the symbols should be searched based on a pattern",
    )
    parser.add_argument(
        "-t",
        "--types",
        dest="types",
        metavar="SYM_TYPE",
        choices=SYM_TYPES,
        default=SYM_TYPES,
        nargs="+",
        help="Symbol types to show",
    )


def _locate_parser(sub_parsers: _SubParsersAction[ArgumentParser]) -> None:
    parser = sub_parsers.add_parser(
        "locate",
        help="Locates the source paths of the modules where the given symbols reside",
    )

    parser.add_argument(
        "symbols",
        metavar="SYMBOL",
        nargs="+",
        help="The symbols to look for",
    )
    parser.add_argument(
        "-f",
        "--fuzzy",
        dest="fuzzy",
        action="store_true",
        default=False,
        help="If the symbols should be searched based on a pattern",
    )
    parser.add_argument(
        "-t",
        "--types",
        dest="types",
        metavar="SYM_TYPE",
        choices=SYM_TYPES,
        default=SYM_TYPES,
        nargs="+",
        help="Symbol types to show",
    )


def parse_args() -> Arguments:
    parser = ArgumentParser(NAME)

    parser.add_argument("-v", "--version", action="version", version=VERSION)

    parser.add_argument(
        "-c",
        "--cache-file",
        dest="cache",
        metavar="file",
        default=Path("symdex.db"),
        type=Path,
        help="Name of the cache to store to and load from. Defaults to `symdex.db`",
    )

    sub_parsers = parser.add_subparsers(required=True, dest="command")

    _index_parser(sub_parsers)
    _find_parser(sub_parsers)
    _locate_parser(sub_parsers)

    return parser.parse_args()
