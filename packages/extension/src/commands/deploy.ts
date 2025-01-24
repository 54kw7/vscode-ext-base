import * as vscode from "vscode";
import * as cp from "child_process";
import * as path from "path";
import * as fs from "fs";
import { NodeSSH } from "node-ssh";
import Logger from "../utils/logger";

const ssh = new NodeSSH();

const logger = new Logger("Deploy Logs");
logger.show();

export function registerCommand() {
  return vscode.commands.registerCommand("project-helper.build_deploy", () => {
    vscode.window.showInformationMessage("Hello from Command!");
    buildAndDeploy();
  });
}

// 缓存密码的变量
let cachedPassword: string | undefined;

// 动态获取密码
async function getPassword(): Promise<string> {
  if (!cachedPassword) {
    logger.info("需要输入服务器密码");

    cachedPassword = await vscode.window.showInputBox({
      prompt: "输入服务器密码",
      password: true,
      ignoreFocusOut: true,
    });
    if (!cachedPassword) {
      throw new Error("密码必填！");
    }
  }
  return cachedPassword;
}

// 主函数
export async function buildAndDeploy() {
  try {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceFolder) {
      logger.errorBox(`没有打开的项目`);
      return;
    }

    // Step 1: 读取 package.json 文件，列出打包命令
    const packageJsonPath = path.join(workspaceFolder, "package.json");
    if (!fs.existsSync(packageJsonPath)) {
      logger.errorBox(`没有找到package.json文件`);
      return;
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    const scripts = packageJson.scripts;
    if (!scripts) {
      logger.errorBox("package.json文件内没有找到scripts");
      return;
    }

    const scriptKeys = Object.keys(scripts);
    console.log("🚀 ~ buildAndDeploy ~ scriptKeys:", scriptKeys)
    const selectedScript = await vscode.window.showQuickPick(scriptKeys, {
      placeHolder: "选择执行命令",
    });

    if (!selectedScript || selectedScript === "dev") {
      return; // 用户取消选择
    }

    logger.info(`开始执行:npm run ${selectedScript}`);

    // Step 2: 执行打包命令
    const buildProcess = cp.spawn("npm", ["run", selectedScript], {
      cwd: workspaceFolder,
      shell: true,
    });

    buildProcess.stdout?.on("data", (data) => {
      logger.info(`${data.toString()}`);
    });

    buildProcess.stderr?.on("data", (data) => {
      const message = data.toString().trim();

      if (message.toLowerCase().includes("error")) {
        logger.errorBox(`${message}`);
      } else {
        logger.info(`${message}`);
      }
    });

    const buildExitCode = await new Promise<number>((resolve) =>
      buildProcess.on("close", resolve)
    );

    if (buildExitCode !== 0) {
      vscode.window.showErrorMessage(
        `Build process failed with exit code ${buildExitCode}.`
      );
      logger.errorBox(`构建失败，错误代码：${buildExitCode}`);
      return;
    }

    logger.info(`打包完成`);
    logger.info(`准备上传`);

    const now = new Date();
    const deployDir = `dev_${now.getFullYear()}${String(
      now.getMonth() + 1
    ).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}_${String(
      now.getHours()
    ).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(
      now.getSeconds()
    ).padStart(2, "0")}`;

    // Step 3: 上传文件到服务器
    const deployConfig = {
      host: "123.56.64.211",
      port: 6666,
      username: "web",
      remotePath: `/alidata/server/vue/test`,
    };

    try {
      const localBuildPath = path.join(workspaceFolder, "dist"); // 假设打包输出到 dist
      if (!fs.existsSync(localBuildPath)) {
        logger.errorBox(`没有找到打包后的文件夹: ${localBuildPath}`);
        return;
      }

      const password = await getPassword();
      await ssh.connect({
        host: deployConfig.host,
        port: deployConfig.port,
        username: deployConfig.username,
        password,
      });

      logger.info("开始上传");

      //   await uploadWithProgress(
      //     localBuildPath,
      //     `${deployConfig.remotePath}/${deployDir}`
      //   );

      await deployWithSCP(
        deployConfig,
        localBuildPath,
        `${deployConfig.remotePath}/${deployDir}`
      );
    } catch (error) {
      logger.error(`上传错误: ${error}`);
      cachedPassword = "";
      const retry = await vscode.window.showQuickPick(["重试", "取消"], {
        placeHolder: "连接或上传失败，重试?",
      });
      if (retry !== "重试") {
        return;
      }
    }

    // Step 4: 设置软连接
    ssh
      .execCommand(`ln -sfn ./${deployDir} ./publish`, {
        cwd: `${deployConfig.remotePath}`,
      })
      .then(function (result) {
        logger.infoBox(`部署完成${deployDir}`);
      });

    logger.info(`访问地址确认部署`);
    logger.info(`地址：`);

    await vscode.env.openExternal(
      vscode.Uri.parse(
        "http://123.56.64.211:12020/noticeContent?id=1871421796144324609"
      )
    );

    ssh.dispose();
  } catch (error) {
    logger.errorBox(`意外错误:${error}`);
  }
}

async function uploadWithProgress(localDir: any, remoteDir: any) {
  const files = fs.readdirSync(localDir);
  const totalFiles = files.length;
  let uploadedCount = 0;

  for (const file of files) {
    const localFilePath = path.join(localDir, file);
    const remoteFilePath = `${remoteDir}/${file}`;

    if (fs.lstatSync(localFilePath).isDirectory()) {
      // 如果是子目录，可以递归处理
      await uploadWithProgress(localFilePath, remoteFilePath);
    } else {
      try {
        await ssh.putFile(localFilePath, remoteFilePath);
        uploadedCount++;
        logger.info(`[进度]: 已上传 ${uploadedCount}/${totalFiles}: ${file}`);
      } catch (error) {
        logger.error(`上传失败 ${file}:${error}`);
      }
    }
  }
}

async function deployWithSCP(config: any, localPath: any, remotePath: any) {
  try {
    logger.info(`开始连接服务器...`);

    // logger.info(`SSH 连接成功`);

    // 耗时计算
    const startTime = Date.now();

    logger.info(`开始通过 SCP 上传文件夹...`);
    const scpCommand = `scp -r -P ${config.port} ${localPath} ${config.username}@${config.host}:${remotePath}`;
    const result = await ssh.execCommand(scpCommand, {
      cwd: process.cwd(),
    });
    console.log("🚀 ~ deployWithSCP ~ result:", result);

    if (result.stderr) {
      throw new Error(`SCP 上传失败: ${result.stderr}`);
    }

    const endTime = Date.now();
    const elapsed = ((endTime - startTime) / 1000).toFixed(2); // 耗时秒数
    logger.info(`文件夹上传完成，耗时 ${elapsed} 秒`);

    logger.info(`部署完成`);
  } catch (error) {
    logger.error(`部署失败: ${error}`);
  }
}
