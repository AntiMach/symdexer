from argparse import ArgumentParser

from symdexer.cache import make_cache, search_cache
from symdexer.settings import load_settings


def main():
    parser = ArgumentParser("python -m symdexer")

    parser.add_argument(
        "symbol",
        metavar="SYMBOL",
        help="The name of a symbol, can be a class, function, assignment or import",
    )

    parser.add_argument(
        "-s",
        "--settings",
        dest="settings",
        metavar="file",
        default="symdexer.toml",
        help="Name of the file to load the settings from",
    )

    parser.add_argument(
        "-r",
        "--reset-cache",
        dest="reset",
        action="store_true",
        default=False,
        help="Determines if the cache should be reset or not",
    )

    args = parser.parse_args()

    settings = load_settings(args.settings)

    if args.reset or not settings.cache.exists():
        make_cache(settings.cache, settings.packages)

    for name, module in search_cache(settings.cache, args.symbol, settings.order):
        print(f"from {module} import {name}")


if __name__ == "__main__":
    main()
