import * as vscode from 'vscode';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
	const collection = vscode.languages.createDiagnosticCollection('rust comment');
	if (vscode.window.activeTextEditor) {
		updateDiagnostics(vscode.window.activeTextEditor.document, collection);
	}
	context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => {
		if (editor) {
			updateDiagnostics(editor.document, collection);
		}
	}));
	context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(event => {
		updateDiagnostics(event.document, collection)
	}));
	context.subscriptions.push(
		vscode.workspace.onDidCloseTextDocument(doc => collection.delete(doc.uri))
	);
}

function updateDiagnostics(document: vscode.TextDocument, collection: vscode.DiagnosticCollection): void {
	if (document && document.languageId === "rust") {
		const diagnostics = [];
		for (let i = 0; i < document.lineCount; i += 1) {
			const line = document.lineAt(i);
			const text = line.text;
			let rangeStartChar;
			if (text.trimStart().startsWith("//")) {
				if (text.trimStart().length > 80) {
					rangeStartChar = text.length - text.trimStart().length + 80;
				}
				if (text.length > 100) {
					rangeStartChar = rangeStartChar ? Math.min(rangeStartChar, 100) : 100;
				}
			}
			if (rangeStartChar) {
				diagnostics.push({
					code: "rust comment",
					message: 'comment width exceeds maximum',
					range: new vscode.Range(new vscode.Position(i, rangeStartChar), line.range.end),
					severity: vscode.DiagnosticSeverity.Information,
				})
			}
		}
		collection.set(document.uri, diagnostics);
	}
}