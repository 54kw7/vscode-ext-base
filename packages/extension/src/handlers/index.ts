import { commands, ExtensionContext, window } from "vscode";
import { Deferred } from "@jsonrpc-rx/server";

export const getHandlers = (context: ExtensionContext) => {
  return {
    ...{
      showInformationMessage: (message: string) => {
        // return commands.executeCommand("vscode.showInformationMessage", message);
        return window.showInformationMessage(message);
      },
    },
    // 指令
    ...{
      execCommand: (command: string, ...rest: any[]) => {
        const { promise, reject, resolve } = new Deferred<any>();
        commands.executeCommand(command, ...rest).then(resolve, reject);
        return promise;
      },
    },
    ...{
      getBuildScript: () => {
        return ["dev", "build", "serve"];
      },
    },
  };
};
