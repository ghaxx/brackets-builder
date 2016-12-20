# Brackets Script Builder

Forked from <https://github.com/ghaxx/brackets-script-builder>

For new features, see the changelog below.

Allows to run programs contained in one file (can be used for Scala, Java, Python, Ruby, Node, C++, Bash, PHP) from Brackets and display results in panel. It is possible to create own build systems via 'Edit > Script Builder Configuration' menu item and editing opened JSON file (you need to restart Brackets afterwards).

Based on [Brackets Builder](http://github.com/Vhornets/brackets-builder).

Keyboard shortcuts:

- F9 = Run script.
- F10 = Compile script.
- Shift-F10 = Run compiled script.

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
- Add new 'tack' button to panel.
  - Tack on = Hide panel on file change (default setting).
  - Tack off = Keep panel open on file change.
- Change F11 keyboard shortcut to Shift-F10 (for better OS X compatibility).

## Environment Variables

- $PATH = The current files directory.
- $PROJ_ROOT = The current projects root directory.
- $FILE = The current files name (including extension).
- $BASE_FILE = The current files name (excluding extension).
- $FULL_FILE = The current files full path (including extension).
