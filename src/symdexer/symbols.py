import ast
from pathlib import Path


__all__ = "SYM_TYPES", "iter_symbols"


def import_map(node: ast.AST):
    if isinstance(node, (ast.Import, ast.ImportFrom)):
        for alias in node.names:
            yield alias.name


def define_map(node: ast.AST):
    if isinstance(node, (ast.FunctionDef, ast.ClassDef)):
        yield node.name


def assign_map(node: ast.AST):
    if isinstance(node, ast.Assign):
        for target in node.targets:
            if isinstance(target, ast.Name):
                yield target.id


SYM_TYPES = {"imports": import_map, "defines": define_map, "assigns": assign_map}


def iter_symbols(module: Path):
    try:
        root = ast.parse(module.read_text("utf-8"))
    except SyntaxError:
        return

    for node in ast.iter_child_nodes(root):
        for sym_type, map_func in SYM_TYPES.items():
            for symbol in map_func(node):
                yield symbol, sym_type
