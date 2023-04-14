# Symdexer (Python)

A python utilitly for quickly indexing symbols over specific, hard to index, directory trees.

Written in Python (CLI) and TypeScript (VSC Extension).

**[Repository](https://github.com/antimach/symdexer)**

**[PyPi](https://pypi.org/project/symdexer/)**

## Features

Initialize symbol indexing configuration on your current workspace.

Create/Reset the index cache for symbol lookup.

Instantly find the best import for the word the cursor is over.

## Requirements

To run this extension, you must have at least `Python 3.11` installed and the
`symdexer` pip package installed.

```sh
# install symdexer
pip install symdexer
# check if symdexer was installed successully
symdexer -h
```

`symdexer` must be accessible via the environment's PATH.

## Extension Settings

This extension provides the following configuration:

* `symdexer.configFile`: Specifies a file to use at the root of a workspace

## Known Issues

Very specific at what it does still.

*And quite possibly more than that*.

## Release Notes

### 1.0.0

Initial release
