import sqlite3
from pathlib import Path
from typing import Generator

from symdexer.symbols import iter_symbols
from symdexer.modules import walk_modules, Module


__all__ = "make_cache", "search_cache"


def make_cache(file: Path, paths: list[Path]):
    with sqlite3.connect(file) as db:
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
            for module in walk_modules(path):
                cache_module(db, module)

        db.commit()


def cache_module(db: sqlite3.Connection, module: Module):
    for symbol, sym_type in iter_symbols(module):
        db.execute(
            "INSERT OR IGNORE INTO Symbol (name, type, module) VALUES (?, ? ,?)",
            (symbol, sym_type, module.name),
        )


def search_cache(file: Path, symbols: list[str], order: list[str]) -> Generator[tuple[str, str], None, None]:
    with sqlite3.connect(file) as db:
        orders = " OR ".join("type = ?" for _ in order)
        patterns = " OR ".join("name LIKE ?" for _ in symbols)
        cursor = db.execute(
            f"""
            SELECT GROUP_CONCAT(name, ", ") as names, module
            FROM Symbol
            WHERE ({patterns}) AND ({orders})
            GROUP BY
                module
            ORDER BY
                LENGTH(module) + LENGTH(names) ASC
            """,
            (*symbols, *order),
        )
        return cursor.fetchall()
