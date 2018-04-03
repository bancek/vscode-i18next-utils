import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as assert from 'assert';

import * as vscode from 'vscode';

import { translatable } from '../src/translatable';

type Range = [[number, number], [number, number]];

interface Case {
    input: string;
    range: Range;
    output: string;
}

const cases: Case[] = [{
    input:
`<template>
    <div>
        <span>It's a text</span>
    </div>
</template>`,
    range: [[2, 14], [2, 25]],
    output:
`<template>
    <div>
        <span>{{ $t('It\\\'s a text') }}</span>
    </div>
</template>`
}, {
    input:
`<template>
    <div>
        <span>It's a text</span>
    </div>
</template>

<script>
export default {
    computed: {
        title() {
            return 'My title';
        },
    },
};
</script>`,
    range: [[10, 20], [10, 28]],
    output:
`<template>
    <div>
        <span>It's a text</span>
    </div>
</template>

<script>
export default {
    computed: {
        title() {
            return this.$t('My title');
        },
    },
};
</script>`
}, {
    input:
`<template>
    <div>
        <span>It's a text</span>
    </div>
</template>

<script>
export default {
    computed: {
        title() {
            return 'My title';
        },
    },
};
</script>`,
    range: [[10, 19], [10, 29]],
    output:
`<template>
    <div>
        <span>It's a text</span>
    </div>
</template>

<script>
export default {
    computed: {
        title() {
            return this.$t('My title');
        },
    },
};
</script>`
}, {
    input:
`<template>
    <div>
        <text-field label="Label" />
    </div>
</template>`,
    range: [[2, 27], [2, 32]],
    output:
`<template>
    <div>
        <text-field :label="$t('Label')" />
    </div>
</template>`
}];

function runCase(input: string, range: Range) {
    let testFilePath = path.join(os.tmpdir(), 'translatable-' + (Math.random() * 100000) + '.vue');

    fs.writeFileSync(testFilePath, input);

    return vscode.workspace.openTextDocument(testFilePath).then((document) => {
        return vscode.window.showTextDocument(document).then((editor) => {
            editor.selection = new vscode.Selection(new vscode.Position(range[0][0], range[0][1]), new vscode.Position(range[1][0], range[1][1]));

            translatable();

            return new Promise((resolve) => {
                setTimeout(resolve, 200);
            }).then(() => {
                return editor.document.getText();
            });
        });
    });
}

suite('translatable', () => {
    test('translatable', () => {
        return cases.reduce((p, c) => {
            return p.then(() => {
                return runCase(c.input, c.range).then(output => {
                    assert.equal(output, c.output);
                });
            })
        }, Promise.resolve());
    });
});
