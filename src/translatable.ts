'use strict';

import * as vscode from 'vscode';

export function translatable() {
    const editor = vscode.window.activeTextEditor;

    let range = editor.selection.start.isEqual(editor.selection.end) ?
        editor.document.lineAt(editor.selection.start.line).range :
        editor.selection;

    const startLine = range.start.line;

    let inTemplate = false;

    for (let i = 0; i < startLine; i++) {
        const line = editor.document.lineAt(i).text;

        if (/<template>/.test(line)) {
            inTemplate = true;
        } else if (/<\/template>/.test(line)) {
            inTemplate = false;
        }
    }

    let newText: string = null;

    if (inTemplate) {
        const text = editor.document.getText(range);

        if (range.start.line === range.end.line) {
            const line = editor.document.lineAt(range.start.line).text;

            if (
                line[range.start.character - 1] === '"' &&
                line[range.start.character - 2] === '=' &&
                line[range.end.character] === '"'
            ) {
                for (let i = range.start.character; i >= 0; i--) {
                    if (line[i] === ' ') {
                        const attr = line.substring(i + 1, range.start.character - 2);

                        range = new vscode.Range(
                            new vscode.Position(range.start.line, i + 1),
                            new vscode.Position(range.start.line, range.end.character + 1),
                        );

                        console.log('attr', attr);

                        newText = `:${attr}="$t('${text.replace(/'/g, '\\\'')}')"`;

                        break;
                    }
                }
            }
        }

        if (newText == null) {
            newText = `{{ $t('${text.replace(/'/g, '\\\'')}') }}`;
        }
    } else {
        if (range.start.character !== 0) {
            const before = editor.document.getText(new vscode.Range(
                new vscode.Position(range.start.line, range.start.character - 1),
                new vscode.Position(range.start.line, range.start.character),
            ));

            if (before === '\'' || before === '"') {
                range = new vscode.Range(
                    new vscode.Position(range.start.line, range.start.character - 1),
                    new vscode.Position(range.end.line, range.end.character),
                );
            }

            const after = editor.document.getText(new vscode.Range(
                new vscode.Position(range.end.line, range.end.character),
                new vscode.Position(range.end.line, range.end.character + 1),
            ));

            if (after === '\'' || after === '"') {
                range = new vscode.Range(
                    new vscode.Position(range.start.line, range.start.character),
                    new vscode.Position(range.end.line, range.end.character + 1),
                );
            }
        }

        const text = editor.document.getText(range).replace(/^['"]/, '').replace(/['"]$/, '');

        newText = `this.$t('${text.replace(/'/g, '\\\'')}')`;
    }

    editor.edit(editBuilder => {
        editBuilder.replace(range, newText);
    });

    editor.selection = new vscode.Selection(
        range.start,
        new vscode.Position(range.start.line, range.start.character + newText.length),
    );
}
