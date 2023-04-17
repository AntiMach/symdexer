from __future__ import annotations

import ast
from pathlib import Path


IMPORTS = "imports"
DEFINES = "defines"
ASSIGNS = "assigns"
SYM_TYPES = [IMPORTS, DEFINES, ASSIGNS]


def _imports(node: ast.AST):
    for alias in node.names:
        yield alias.name, IMPORTS


def _defines(node: ast.AST):
    yield node.name, DEFINES


def _assigns(node: ast.AST):
    for target in node.targets:
        if isinstance(target, ast.Name):
            yield target.id, ASSIGNS


SYM_MAP = {
    ast.Assign: _assigns,
    ast.FunctionDef: _defines,
    ast.ClassDef: _defines,
    ast.Import: _imports,
    ast.ImportFrom: _imports,
}


def iter_symbols(path: Path):
    # sourcery skip: use-named-expression
    try:
        root = ast.parse(path.read_text("utf-8"))
    except SyntaxError:
        return

    for node in ast.iter_child_nodes(root):
        func = SYM_MAP.get(type(node))
        if func:
            yield from func(node)
