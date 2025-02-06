import { commands, ExtensionContext, window } from "vscode";
import { ViewProviderSidebar } from "./provider/sidebar-view";
import { getHandlers } from "./handlers";

import * as fs from "fs";
import * as path from "path";

export function activate(context: ExtensionContext) {
  console.log('Congratulations, your extension "extension" is now active!');

  const handlers = getHandlers(context);

  const viewProvidersidebar = new ViewProviderSidebar(context, handlers);
  const sidebarViewDisposable = window.registerWebviewViewProvider(
    "sidebar-view-container",
    viewProvidersidebar,
    { webviewOptions: { retainContextWhenHidden: true } }
  );

  const disposable = commands.registerCommand("extension.helloWorld", () => {
    window.showInformationMessage("Hello World from extension!");
  });

  context.subscriptions.push(sidebarViewDisposable, disposable);

  const commandsDir = path.join(__dirname, "commands");
  fs.readdirSync(commandsDir).forEach((file) => {
    console.log("🚀 ~ fs.readdirSync ~ file:", file);
    const commandModule = require(path.join(commandsDir, file));
    if (commandModule.registerCommand) {
      context.subscriptions.push(commandModule.registerCommand(context));
    }
  });
}

export function deactivate() {}
