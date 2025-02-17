import {
  ExtensionContext,
  Uri,
  ViewColumn,
  WebviewPanel,
  window,
} from "vscode";
import { HandlerConfig } from "@jsonrpc-rx/server";
import { AbstractViewProvider } from "./abstract";

export class ViewProviderPanel extends AbstractViewProvider {
  private static currentPanel: WebviewPanel | undefined;

  constructor(context: ExtensionContext, handlers: HandlerConfig) {
    super(
      context,
      handlers,
      {
        distDir: "out/webview",
        indexPath: "out/webview/index.html",
      },
      "panel"
    );
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

  public static show(context: ExtensionContext, handlers: HandlerConfig) {
    if (ViewProviderPanel.currentPanel) {
      ViewProviderPanel.currentPanel.reveal(ViewColumn.One);
    } else {
      const panel = window.createWebviewPanel(
        "panel-view-container",
        "magic kit",
        ViewColumn.One,
        {
          enableScripts: true,
          localResourceRoots: [context.extensionUri],
        }
      );
      panel.iconPath = Uri.file(context.asAbsolutePath("assets/capsule.svg"));
      const provider = new ViewProviderPanel(context, handlers);
      provider.resolveWebviewView(panel);

      ViewProviderPanel.currentPanel = panel;

      panel.onDidDispose(() => {
        ViewProviderPanel.currentPanel = undefined;
      });
    }
  }
}
