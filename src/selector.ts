import * as vscode from 'vscode';

import { AutoUseContext } from './autoUseContext';
import { AutoUseRegex } from './autoUseRegex';

interface ModuleSubObject {
    packageName: string,
    subList: string[],
}

export class Selector {
    constructor(private context: AutoUseContext) { }

    private getRangesByRegex(regex: RegExp): vscode.Range[] {
        const fullText = this.getFullText();

        if (fullText === '') { return []; }

        const matches = fullText.matchAll(regex);

        return [...matches].reduce((ranges: vscode.Range[], match) => {
            const startIndex = match.index !== undefined ? match.index : 0;
            const endIndex = match.index !== undefined ? match.index + match[0].length : 0;
            const startPosition = this.context.editor.document.positionAt(startIndex);
            const endPosition = this.context.editor.document.positionAt(endIndex);
            ranges.push(new vscode.Range(startPosition, endPosition));
            return ranges;
        }, []);
    }

    public getFullText(): string {
        return this.context.editor.document.getText();
    }

    public getSelectText(): string {
        const document = this.context.editor.document;
        if (document === undefined) { return ''; }
        return document.getText(this.context.editor.selection);
    }

    public async insertUseStatements(useStatements: string[]): Promise<boolean> {
        const ranges = this.getRangesByRegex(AutoUseRegex.PACKAGE);

        // insert use statement next line of 'package' if package name is defined, otherwise first line
        const endPosition = ranges.length > 0
            ? new vscode.Position(ranges[0].end.line + 1, 0)
            : new vscode.Position(0, 0);

        return this.context.editor.edit(e => useStatements.forEach(useStatement => e.insert(endPosition, useStatement + "\n")));
    }

    public getFullyQualifiedModules(): string[] | undefined {
        const fullText = this.getFullText();

        // avoid matching `use` and `package` statements for sub module match
        const fullTextExcludePackageAndUse = fullText.replace(AutoUseRegex.PACKAGE, '').replace(AutoUseRegex.USE, '');

        const methodModuleMatches = fullTextExcludePackageAndUse.matchAll(AutoUseRegex.METHOD_MODULE);
        const methodModules = [...methodModuleMatches].map(mmm => mmm[0].replace('->', ''));
        const uniqueMethodModules = new Set(methodModules);

        const subModuleMatches = fullTextExcludePackageAndUse.matchAll(AutoUseRegex.SUB_MODULE);
        const subModules = [...subModuleMatches].map(smm => smm[1]);
        const uniqueSubModules = new Set(subModules);

        return [...uniqueMethodModules, ...uniqueSubModules].sort();
    }

    public getDeclaredModule(): string[] | undefined {
        const fullText = this.getFullText();
        const useMatches = [...fullText.matchAll(AutoUseRegex.USE)];
        return useMatches?.map(um => um[1]);
    }

    public getDeclaredModuleSub(): ModuleSubObject[] | undefined {
        const fullText = this.getFullText();
        const useSubMatches = [...fullText.matchAll(AutoUseRegex.USE_SUB)];

        return useSubMatches?.map(usm => {
            const packageName = usm[1];

            const subList = usm[3]
                .split(/\s/)
                .filter(s => s !== '');

            const obj: ModuleSubObject = {
                packageName,
                subList
            };

            return obj;
        });
    }

    public async deleteByRegex(regex: RegExp): Promise<boolean> {
        const ranges = this.getRangesByRegex(regex);

        if (ranges === []) { return Promise.reject('not match'); }

        return this.context.editor.edit(e => ranges.forEach(range => e.delete(range)));
    }
}