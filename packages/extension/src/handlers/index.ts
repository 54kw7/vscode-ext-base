import { commands, ExtensionContext, window } from "vscode";
import { Deferred } from "@jsonrpc-rx/server";
import logger from "../utils/logger";
import { build, storage } from "../core";
import { generateProjectId } from "../utils/base";

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
        const commands = (await build.scripts()) || [];
        const buildCommands = commands.filter((command) =>
          command.includes("build")
        );

        return buildCommands;
      },
      execDeploy: async (config: any) => {
        storage.save("deployConfig", config);
        console.log("🚀 ~ execDeploy: ~ config:", config);
        logger.show();
        
        await build.pack(config);
        return await build.upload(config);
      },
      execUpload: async (config: any) => {
        const pid = await generateProjectId();
        storage.save(config.host, config);

        console.log("🚀 ~ execDeploy: ~ config:", config);
        logger.show();

        return await build.upload(config);
      },
      getEmbedProjects: async (config: any) => {
        const projects: any[] = [
          { label: "龙江PDF依赖", value: "pdf" },
          { label: "signView", value: "signView" },
          { label: "signWeb", value: "signWeb" },
          { label: "signature", value: "signature" },
          { label: "龙江工单", value: "workorder" },
          { label: "龙江职称微信", value: "weixin" },
          { label: "那曲职称", value: "zcps" },
        ];

        return projects;
      },
    },
  };
};

