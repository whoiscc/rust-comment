import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	let savedDecoration: vscode.TextEditorDecorationType | undefined;

	const disposable = vscode.window.onDidChangeTextEditorSelection((event) => {
		const document = event.textEditor.document;
		if (document.languageId !== 'rust') {
			return;
		}

		if (savedDecoration) {
			savedDecoration.dispose();
		}

		const line = event.selections[0].active.line;
		const text = document.lineAt(line).text;
		const indentLength = text.search(/\S/);
		if (indentLength === -1 || !text.slice(indentLength).startsWith("//")) {
			return;
		}

		const currentLength = text.length - indentLength;
		const quota = Math.min(80 - currentLength, 100 - text.length)
		console.log(`highlighting line ${line + 1} in ${document.fileName}, quota = ${quota}`);
		let decorationOptions;
		let decorationRange;
		let color = vscode.workspace.getConfiguration('rust-comment').get('backgroundColor', '#f7f0f5');
		if (quota > 0) {
			decorationOptions = {
				backgroundColor: color,
				after: {
					backgroundColor: color,
					color: color,
					height: "100%",
					contentText: "x".repeat(quota),
				}
			};
			decorationRange = new vscode.Range(line, indentLength, line, text.length);
		} else {
			decorationOptions = {
				backgroundColor: color,
			};
			decorationRange = new vscode.Range(line, indentLength, line, text.length + quota);
		}
		savedDecoration = vscode.window.createTextEditorDecorationType(decorationOptions);
		event.textEditor.setDecorations(savedDecoration, [decorationRange]);
	});
	context.subscriptions.push(disposable);
}
