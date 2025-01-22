"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode_1 = require("vscode");
const sidebar_view_1 = require("./provider/sidebar-view");
const panel_view_1 = require("./provider/panel-view");
const handlers_1 = require("./handlers");
function activate(context) {
    console.log('Congratulations, your extension "extension" is now active!');
    const handlers = (0, handlers_1.getHandlers)(context);
    const viewProvidersidebar = new sidebar_view_1.ViewProviderSidebar(context, handlers);
    const sidebarViewDisposable = vscode_1.window.registerWebviewViewProvider("sidebar-view-container", viewProvidersidebar, { webviewOptions: { retainContextWhenHidden: true } });
    const panelViewDisposable = vscode_1.commands.registerCommand("panel-view-container.show", () => {
        const viewProviderPanel = new panel_view_1.ViewProviderPanel(context, handlers);
        const panel = vscode_1.window.createWebviewPanel("panel-view-container", "Panel View", vscode_1.ViewColumn.One, {
            retainContextWhenHidden: true,
        });
        viewProviderPanel.resolveWebviewView(panel);
    });
    const disposable = vscode_1.commands.registerCommand("extension.helloWorld", () => {
        vscode_1.window.showInformationMessage("Hello World from extension!");
    });
    context.subscriptions.push(disposable, sidebarViewDisposable, panelViewDisposable);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map