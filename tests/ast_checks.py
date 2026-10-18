"""What the source checks share: finding calls to built-ins however they are named."""

import ast
from collections.abc import Iterator


def builtin_calls(tree: ast.Module, wanted: set[str]) -> Iterator[tuple[int, str]]:
    """`(line, name)` for each call of a wanted built-in: plain (`open()`), qualified
    (`builtins.open()`, through `import builtins as b` too) or through an alias
    (`from builtins import open as o`)."""
    modules = {"builtins"}
    aliases: dict[str, str] = {}
    for node in ast.walk(tree):
        match node:
            case ast.Import(names=names):
                modules |= {a.asname for a in names if a.name == "builtins" and a.asname}
            case ast.ImportFrom(module="builtins", names=names):
                aliases |= {a.asname or a.name: a.name for a in names}
            case _:
                pass
    for node in ast.walk(tree):
        match node:
            case ast.Call(func=ast.Name(id=name)) if aliases.get(name, name) in wanted:
                yield node.lineno, aliases.get(name, name)
            case ast.Call(func=ast.Attribute(attr=name, value=ast.Name(id=module))) if (
                module in modules and name in wanted
            ):
                yield node.lineno, name
            case _:
                pass
