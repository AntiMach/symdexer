from pathlib import Path
from argparse import ArgumentParser

from symdexer.version import VERSION
from symdexer.cache import Cache
from symdexer.symbols import SYM_TYPES
from symdexer.types import package_type


def search_cache(cache_p: Path, symbols: list[str], fuzzy: bool, types: list[str]):
    if not cache_p.is_file():
        raise FileNotFoundError(f"Cache `{cache_p}` not found.")

    with Cache(cache_p) as cache:
        yield from cache.search(symbols, fuzzy, types)


def find_command(cache_p: Path, symbols: list[str], fuzzy: bool, types: list[str]) -> None:
    for names, module, _ in search_cache(cache_p, symbols, fuzzy):
        yield f"from {module} import {names}"


def locate_command(cache_p: Path, symbols: list[str], fuzzy: bool, types: list[str]) -> None:
    for _, module, path in search_cache(cache_p, symbols, fuzzy):
        yield module
        yield path


def index_command(cache_p: Path, packages: list[Path], reset: bool):
    if not cache_p.exists():
        reset = True

    with Cache(cache_p) as cache:
        if reset:
            cache.reset()
        cache.update(packages)

    yield "Done indexing"


def main():
    parser = ArgumentParser("symdexer")

    parser.add_argument("-v", "--version", action="version", version=VERSION)

    parser.add_argument(
        "-c",
        "--cache-file",
        dest="cache",
        metavar="file",
        default="symdex.db",
        type=Path,
        help="Name of the cache to store to and load from. Defaults to `symdex.db`",
    )

    sub_parsers = parser.add_subparsers(required=True, dest="command")

    find_parser = sub_parsers.add_parser(
        "find",
        help="Searches the cache for symbols matching a list of patterns",
    )
    find_parser.add_argument(
        "symbols",
        metavar="SYMBOL",
        nargs="+",
        help="The symbols to look for",
    )
    find_parser.add_argument(
        "-f",
        "--fuzzy",
        dest="fuzzy",
        action="store_true",
        default=False,
        help="If the symbols should be searched based on a pattern",
    )
    find_parser.add_argument(
        "-t",
        "--types",
        dest="types",
        metavar="SYM_TYPE",
        choices=SYM_TYPES,
        default=SYM_TYPES,
        nargs="+",
        help="Symbol types to show",
    )

    locate_parser = sub_parsers.add_parser(
        "locate",
        help="Locates the source paths of the modules where the given symbols reside",
    )
    locate_parser.add_argument(
        "symbols",
        metavar="SYMBOL",
        nargs="+",
        help="The symbols to look for",
    )
    locate_parser.add_argument(
        "-f",
        "--fuzzy",
        dest="fuzzy",
        action="store_true",
        default=False,
        help="If the symbols should be searched based on a pattern",
    )
    locate_parser.add_argument(
        "-t",
        "--types",
        dest="types",
        metavar="SYM_TYPE",
        choices=SYM_TYPES,
        default=SYM_TYPES,
        nargs="+",
        help="Symbol types to show",
    )

    cache_parser = sub_parsers.add_parser(
        "index",
        help="Load symbols into cache",
    )
    cache_parser.add_argument(
        "-r",
        "--reset",
        dest="reset",
        action="store_true",
        default=False,
        help="If the cache should be completely wiped",
    )
    cache_parser.add_argument(
        "packages",
        metavar="PACKAGE",
        nargs="+",
        type=package_type,
        help="The packages to add to cache. May be package names or paths",
    )

    args = parser.parse_args()

    if args.command == "index":
        res = index_command(args.cache, args.packages, args.reset)
    elif args.command == "find":
        res = find_command(args.cache, args.symbols, args.fuzzy, args.types)

    for line in res:
        print(line)
