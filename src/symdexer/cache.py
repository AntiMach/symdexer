import sqlite3
from pathlib import Path
from typing import Generator

from symdexer.symbols import iter_symbols
from symdexer.modules import walk_modules, Module


class Cache:
    def __init__(self, path: Path):
        self.path = path

    def __enter__(self):
        self.db = sqlite3.connect(self.path).__enter__()
        return self

    def __exit__(self, *args, **kwargs):
        self.db.__exit__(*args, **kwargs)

    def reset(self):
        self.db.executescript(
            """
            DROP TABLE IF EXISTS Module;

            DROP TABLE IF EXISTS Symbol;

            CREATE TABLE Module (
                name TEXT PRIMARY KEY,
                path TEXT NOT NULL,
                changed NUMBER NOT NULL
            );

            CREATE TABLE Symbol (
                name TEXT NOT NULL,
                type TEXT NOT NULL,
                module TEXT NOT NULL REFERENCES Module(name),
                UNIQUE (name, type, module)
            );
            """
        )

    def update(self, packages: list[Path]):
        for path in packages:
            for module in walk_modules(path):
                self._cache_module(module)

        self.db.commit()

    def _cache_module(self, module: Module):
        moduleInfo = module.name, str(module.path.resolve()), module.mtime

        # guard clause that returns when the module being indexed
        # hasn't changed location or mtime since last index
        if self.db.execute(
            """
            SELECT name
            FROM Module
            WHERE name = ? AND (path != ? OR changed != ?)
            """,
            moduleInfo,
        ).fetchall():
            return

        self.db.execute(
            """
            INSERT OR IGNORE INTO Module (name, path, changed)
            VALUES (?, ? ,?)
            """,
            moduleInfo,
        )

        for symbol, sym_type in iter_symbols(module.path):
            self.db.execute(
                """
                INSERT OR IGNORE INTO Symbol (name, type, module)
                VALUES (?, ? ,?)
                """,
                (symbol, sym_type, module.name),
            )

    def search(self, symbols: list[str], fuzzy: bool, types: list[str]) -> Generator[tuple[str, str, str], None, None]:
        symbol_t = "Symbol.name LIKE ?" if fuzzy else "Symbol.name = ?"
        symbols_t = " OR ".join(symbol_t for _ in symbols)
        types_t = " OR ".join("type = ?" for _ in types)

        cursor = self.db.execute(
            f"""
            SELECT GROUP_CONCAT(Symbol.name, ", ") as names, module, path
            FROM Symbol
            INNER JOIN Module ON module = Module.name
            WHERE ({symbols_t}) AND ({types_t})
            GROUP BY
                module
            ORDER BY
                LENGTH(module) + LENGTH(names) ASC
            """,
            (*symbols, *types),
        )

        return cursor.fetchall()
