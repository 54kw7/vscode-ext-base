import { commands } from "vscode";
import { ViewProviderPanel } from "../provider/panel-view";
import { getHandlers } from "../handlers";

export function registerCommand(context: any) {
  const handlers = getHandlers(context);

  return commands.registerCommand("panel-view-container.show", () => {
    ViewProviderPanel.show(context, handlers);
  });
}
