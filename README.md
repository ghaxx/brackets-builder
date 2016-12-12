# Brackets Script Builder

Forked from <https://github.com/ghaxx/brackets-script-builder>

Allows to run programs contained in one file (can be used for Scala, Java, Python, Ruby, Node, C++, Bash, PHP) from Brackets and display results in panel. It is possible to create own build systems via 'Edit > Script Builder Configuration' menu item and editing opened JSON file (you need to restart Brackets afterwards).

Based on Brackets Builder (http://github.com/Vhornets/brackets-builder).

Keyboard shortcuts:

- F9 to run current file as a script.
- F10 to compile current file.
- F11 to run compilation result.

***

## Changelog

- Update console logic.
  - Support quotes in output text.
  - Improve JSON output.
  - Word wrap output.
  - Make text selectable.
- Add new builder.json environment variable ($PROJ_ROOT).
- Add PHP to builder config.
- Add Bash to builder config.
- Lint code.
  - Include .jslintrc file.
- Remove menu error.
- Replace deprecated Brackets method.
- Hide panel on file change.

## Environment Variables

- $PATH = The current files directory.
- $PROJ_ROOT = The current projects root directory.
- $FILE = The current files name (including extension).
- $BASE_FILE = The current files name (excluding extension).
- $FULL_FILE = The current files full path (including extension).
