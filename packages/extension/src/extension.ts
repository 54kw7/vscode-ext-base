import { commands, ExtensionContext, window, ViewColumn, Uri } from "vscode";
import { ViewProviderSidebar } from "./provider/sidebar-view";
import { ViewProviderPanel } from "./provider/panel-view";
import { getHandlers } from "./handlers";

export function activate(context: ExtensionContext) {
  console.log('Congratulations, your extension "extension" is now active!');

  const handlers = getHandlers(context);

  const viewProvidersidebar = new ViewProviderSidebar(context, handlers);
  const sidebarViewDisposable = window.registerWebviewViewProvider(
    "sidebar-view-container",
    viewProvidersidebar,
    { webviewOptions: { retainContextWhenHidden: true } }
  );

  const panelViewDisposable = commands.registerCommand(
    "panel-view-container.show",
    () => {
      const viewProviderPanel = new ViewProviderPanel(context, handlers);
      const panel = window.createWebviewPanel(
        "panel-view-container",
        "Panel View",
        ViewColumn.One,
        {
          retainContextWhenHidden: true,
        }
      );
      panel.iconPath = Uri.file(context.asAbsolutePath("assets/workspace.svg"));
      viewProviderPanel.resolveWebviewView(panel);
    }
  );

  const disposable = commands.registerCommand("extension.helloWorld", () => {
    window.showInformationMessage("Hello World from extension!");
  });

  context.subscriptions.push(
    sidebarViewDisposable,
    panelViewDisposable,
    disposable
  );
}

export function deactivate() {}
