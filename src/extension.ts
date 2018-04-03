'use strict';

import * as vscode from 'vscode';

import { translatable } from './translatable';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.translatable', () => {
        translatable();
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
}
