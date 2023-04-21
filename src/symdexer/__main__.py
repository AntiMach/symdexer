from __future__ import annotations

from typing import Iterator

from symdexer.cache import Cache
from symdexer.parser import Arguments, parse_args


def main():
    args = parse_args()

    if args.command == "index":
        cmd = index_command
    elif args.command == "import":
        cmd = import_command
    elif args.command == "locate":
        cmd = locate_command

    for line in cmd(args):
        print(line)


def index_command(args: Arguments) -> Iterator[str]:
    if args.reset and args.cache.is_file():
        args.cache.unlink()

    with Cache(args.cache) as cache:
        if args.reset:
            cache.init()

        for module in cache.update(args.packages):
            yield f"Indexing {module.name}"

    yield "Done indexing"


def import_command(args: Arguments) -> Iterator[str]:
    if not args.cache.is_file():
        raise FileNotFoundError(f"Cache `{args.cache}` not found.")

    with Cache(args.cache) as cache:
        search = cache.grouped if args.group else cache.ungrouped

        for name, module, _ in search(args.symbols, args.types, args.fuzzy):
            yield f"from {module} import {name}"


def locate_command(args: Arguments) -> Iterator[str]:
    if not args.cache.is_file():
        raise FileNotFoundError(f"Cache `{args.cache}` not found.")

    with Cache(args.cache) as cache:
        search = cache.grouped if args.group else cache.ungrouped

        for values in search(args.symbols, args.types, args.fuzzy):
            yield from values


if __name__ == "__main__":
    main()
