# Symdexer (Python)

A python utilitly for quickly indexing symbols over specific, hard to index, directory trees.

CLI Written in Python, extension written in TypeScript.

*[Repository](https://github.com/antimach/symdexer)*

## Features

Initialize symbol indexing configuration on your current workspace.

Update or reset the index cache for symbol lookup.

Instantly find the best import for the selected word.

## Requirements

To run this extension, you must have `Python 3.7` or higher installed.

## Extension Settings

This extension provides the following configurations:

* `symdexer.interpreter`: Specifies python interpreters to look for.
* `symdexer.venvDir`: Specifies the current virtual environment's path.
* `symdexer.useVenv`: Specifies if the current virtual environment's path should be used.
* `symdexer.cacheFile`: Specifies the cache's file location.
* `symdexer.packages`: Specifies the packages to index.
* `symdexer.import/locate.fuzzy`: Specifies if searching for symbols should be through a pattern or not.
* `symdexer.import/locate.types`: Specifies the symbol types to present.

## Known Issues

None that I know of yet.

## Release Notes

### [1.1.0]

- Improved item selection.
- Improved error messages.
- Added specific fuzzy/types configs.
- Added option to specify python interpreters.
- Added option to use the virtual environment directory.

### [1.0.2]

- Added backwards compatibility for Python.

### [1.0.1]

- Changed the way imports are looked for.
- Removed the need to install symdexer manually.
- Removed symdexer.useVenv.

### [1.0.0]

- Initial release.
