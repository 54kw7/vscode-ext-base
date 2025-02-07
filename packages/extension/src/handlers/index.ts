import { commands, ExtensionContext, window } from "vscode";
import { Deferred } from "@jsonrpc-rx/server";
import logger from "../utils/logger";
import { build } from "../core";

export const getHandlers = (context: ExtensionContext) => {
  return {
    ...{
      showInformationMessage: (message: string) => {
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
    // build and deploy
    ...{
      getBuildScript: async () => {
        const commands = (await build.buildScripts()) || [];
        const buildCommands = commands.filter((command) =>
          command.includes("build")
        );

        return buildCommands;
      },
      execDeploy: async (config: any) => {
        console.log("🚀 ~ execDeploy: ~ config:", config);
        logger.show();
      },
    },
  };
};
