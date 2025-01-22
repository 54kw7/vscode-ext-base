"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewProviderPanel = void 0;
const abstract_1 = require("./abstract");
class ViewProviderPanel extends abstract_1.AbstractViewProvider {
    constructor(context, handlers) {
        super(context, handlers, {
            distDir: "out/webview",
            indexPath: "out/webview/index.html",
        });
    }
    async resolveWebviewView(webviewView) {
        const { webview } = webviewView;
        webview.options = {
            enableScripts: true,
            localResourceRoots: [this.context.extensionUri],
        };
        this.exposeHandlers(webview);
        webview.html = await this.getWebviewHtml(webview);
    }
}
exports.ViewProviderPanel = ViewProviderPanel;
//# sourceMappingURL=panel-view.js.map