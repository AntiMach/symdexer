from __future__ import annotations

from typing import Iterator

from symdexer.cache import Cache
from symdexer.parser import Arguments, parse_args


def search_cache(args: Arguments):
    if not args.cache.is_file():
        raise FileNotFoundError(f"Cache `{args.cache}` not found.")

    with Cache(args.cache) as cache:
        return cache.search(args.symbols, args.types, args.fuzzy)


def index_command(args: Arguments) -> Iterator[str]:
    reset = args.reset or not args.cache.exists()

    with Cache(args.cache) as cache:
        if reset:
            cache.reset()
        cache.update(args.packages)

    yield "Done indexing"


def find_command(args: Arguments) -> Iterator[str]:
    for names, module, _ in search_cache(args):
        yield f"from {module} import {names}"


def locate_command(args: Arguments) -> Iterator[str]:
    for values in search_cache(args):
        yield from values


def main():
    args = parse_args()

    if args.command == "index":
        cmd = index_command
    elif args.command == "find":
        cmd = find_command
    elif args.command == "locate":
        cmd = locate_command

    for line in cmd(args):
        print(line)
