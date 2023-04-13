from argparse import ArgumentParser

from symdexer.symbols import SYM_TYPES
from symdexer.settings import load_settings
from symdexer.cache import make_cache, search_cache


def find_command(settings_p: str, symbols: list[str], order: list[str]):
    settings = load_settings(settings_p)

    if not settings.cache.exists():
        make_cache(settings.cache, settings.packages)

    for name, module in search_cache(settings.cache, symbols, order or settings.order):
        yield f"from {module} import {name}"


def reset_cache_command(settings_p: str):
    settings = load_settings(settings_p)

    make_cache(settings.cache, settings.packages)

    yield "cache reseted"


def init_settings_command(settings_p: str):
    with open(settings_p, "w", encoding="utf-8") as fp:
        fp.write('cache = "symdex.db"\n')
        fp.write('default_order = ["defines", "assigns", "imports"]\n')
        fp.write("\n")
        fp.write("[packages]\n")
        fp.write('package_name = "path/to/package"\n')

    yield f"initialized {settings_p}"


def main():
    parser = ArgumentParser("symdexer")

    parser.add_argument(
        "-s",
        "--settings",
        dest="settings",
        metavar="file",
        default="symdexer.toml",
        help="Name of the file to load the settings from",
    )

    subp = parser.add_subparsers(required=True, dest="command")

    find = subp.add_parser("find", help="Searches the cache for symbols matching a list of patterns")

    find.add_argument("patterns", metavar="PATTERN", nargs="+", help="The patterns to look for")

    find.add_argument("-o", "--order", metavar="SYM_TYPE", choices=list(SYM_TYPES), nargs="+")

    subp.add_parser("reset-cache", help="Determines if the cache should be reset or not")

    subp.add_parser("init", help="Creates a new configuration file")

    args = parser.parse_args()

    if args.command == "find":
        res = find_command(args.settings, args.patterns, args.order)
    elif args.command == "reset-cache":
        res = reset_cache_command(args.settings)
    elif args.command == "init":
        res = init_settings_command(args.settings)

    for line in res:
        print(line)
