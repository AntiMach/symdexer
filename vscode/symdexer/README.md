# Symdexer (Python)

A python utilitly for quickly indexing symbols over specific, hard to index, directory trees.

CLI Written in Python, extension written in TypeScript.

*[Repository](https://github.com/antimach/symdexer)*

## Features

Initialize symbol indexing configuration on your current workspace.

Update or reset the index cache for symbol lookup.

Instantly find the best import for the word the cursor is over.

## Requirements

To run this extension, you must have at least `Python 3.11` installed and the
`symdexer` pip package installed.

```sh
# install symdexer
pip install -U symdexer==0.2.3
# check if symdexer was installed successully
symdexer -v
```

`symdexer` must be accessible via the environment's PATH.

## Extension Settings

This extension provides the following configurations:

* `symdexer.cacheFile`: Specifies the cache's file location
* `symdexer.packages`: Specifies the packages to index
* `symdexer.types`: Specifies the symbol types to present
* `symdexer.fuzzy`: Specifies if searching for symbols should be through a pattern or not
* `symdexer.useVenv`: Specifies if the extension should search for packages on the current virtual environment
* `symdexer.venvDir`: Specifies the current virtual environment's path

## Known Issues

Very specific at what it does still.

*And quite possibly more than that*.

## Release Notes

### 1.0.0

* Initial release
