import sqlite3
from pathlib import Path
from typing import Generator

from symdexer.symbols import iter_symbols
from symdexer.modules import walk_modules, Module


__all__ = "make_cache", "search_cache"


def with_database(func):
    def wrapped(file: Path, *args, **kwargs):
        with sqlite3.connect(file) as db:
            return func(db, *args, **kwargs)

    return wrapped


@with_database
def make_cache(db: sqlite3.Connection, paths: list[Path]):
    db.executescript(
        """
        DROP TABLE IF EXISTS Symbol;

        CREATE TABLE Symbol (
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            module TEXT NOT NULL,
            UNIQUE (name, type, module)
        );
        """
    )

    for path in paths:
        if not path.is_dir():
            raise ValueError(f"package {path} is not a directory")

        for module in walk_modules(path):
            cache_module(db, module)

    db.commit()


def cache_module(db: sqlite3.Connection, module: Module):
    for symbol, sym_type in iter_symbols(module):
        db.execute(
            "INSERT OR IGNORE INTO Symbol (name, type, module) VALUES (?, ? ,?)",
            (symbol, sym_type, module.name),
        )


@with_database
def search_cache(db: sqlite3.Connection, symbol: str, order: list[str]) -> Generator[tuple[str, str], None, None]:
    for sym_type in order:
        cursor = db.execute(
            "SELECT name, module FROM Symbol WHERE name LIKE ? AND type = ?",
            (symbol, sym_type),
        )
        yield from cursor.fetchall()
