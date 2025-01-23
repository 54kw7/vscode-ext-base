import { ExtensionContext, WebviewPanel } from "vscode";
import { HandlerConfig } from "@jsonrpc-rx/server";
import { AbstractViewProvider } from "./abstract";

export class ViewProviderPanel extends AbstractViewProvider {
  constructor(context: ExtensionContext, handlers: HandlerConfig) {
    super(context, handlers, {
      distDir: "out/webview",
      indexPath: "out/webview/index.html",
    });
  }

  async resolveWebviewView(webviewView: WebviewPanel) {
    const { webview } = webviewView;
    webview.options = {
      enableScripts: true,
      localResourceRoots: [this.context.extensionUri],
    };
    this.exposeHandlers(webview);
    webview.html = await this.getWebviewHtml(webview);
  }
}
