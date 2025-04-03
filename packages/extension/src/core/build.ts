import { env, Uri, window, workspace } from "vscode";
import logger from "../utils/logger";
import * as path from "path";
import * as fs from "fs";
import * as cp from "child_process";
import SSH2Promise from "ssh2-promise";

const workspaceFolder = workspace.workspaceFolders?.[0]?.uri.fsPath || "";
const remoteDir = "/alidata/server/vue/";

async function scripts() {
  try {
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
    return scriptKeys;
  } catch (error) {
    logger.errorBox(`获取scripts失败: ${error}`);
  }
}

async function pack(config: any) {
  try {
    logger.info(`开始执行:npm run ${config.script} ${config.args}`);

    const buildProcess = cp.spawn("npm", ["run", config.script, config.args], {
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
      window.showErrorMessage(
        `Build process failed with exit code ${buildExitCode}.`
      );
      logger.errorBox(`构建失败，错误代码：${buildExitCode}`);
      return;
    }

    logger.info(`打包完成`);
  } catch (error) {
    logger.errorBox(`获取scripts失败: ${error}`);
  }
}

async function upload(deployConfig: any) {
  const ssh = new SSH2Promise({
    host: deployConfig.host,
    port: deployConfig.port,
    username: deployConfig.username,
    password: deployConfig.password,
  });

  try {
    logger.info(`准备上传`);

    const localBuildPath = path.join(workspaceFolder, "dist"); // 假设打包输出到 dist
    if (!fs.existsSync(localBuildPath)) {
      logger.errorBox(`没有找到打包后的文件夹: ${localBuildPath}`);
      return;
    }

    await ssh.connect();
    console.log("🚀 ~ upload ~ deployConfig:", deployConfig);

    logger.info("开始上传");

    const now = new Date();
    const deployDir = `release/v${now.getFullYear()}${String(
      now.getMonth() + 1
    ).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}_${String(
      now.getHours()
    ).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(
      now.getSeconds()
    ).padStart(2, "0")}`;
    await ssh.exec(
      `cd ${remoteDir}${deployConfig.remotePath} && mkdir -p ${deployDir}`
    );
    await uploadWithProgress(
      ssh,
      localBuildPath,
      `${remoteDir}${deployConfig.remotePath}/${deployDir}`
    );
    logger.info("上传完成，正在配置...");
    await link(ssh, deployConfig, deployDir);
  } catch (error) {
    logger.error(`上传错误: ${error}`);
    const retry = await window.showQuickPick(["重试", "取消"], {
      placeHolder: "连接或上传失败，重试?",
    });
    if (retry !== "重试") {
      return;
    }
  } finally {
    ssh.close();
  }
}

async function link(ssh: SSH2Promise, deployConfig: any, deployDir: string) {
  try {
    const { remotePath, url } = deployConfig;
    await ssh.exec(
      `cd ${remoteDir}${remotePath} && ln -sfn ./${deployDir} ./publish`
    );
    await embedLink(ssh, deployConfig, deployDir);
    logger.infoBox(`部署完成${deployDir}`);

    logger.info(`访问地址确认部署`);
    logger.info(`地址：${url}`);

    await env.openExternal(Uri.parse(url));
  } catch (error) {
    logger.errorBox(`意外错误:${error}`);
  }
}

async function embedLink(
  ssh: SSH2Promise,
  deployConfig: any,
  deployDir: string
) {
  try {
    const { remotePath, embedProjects } = deployConfig;

    for (const embedProject of embedProjects) {
      await ssh.exec(
        ` cd ${remoteDir}${remotePath}/publish && ln -sfn ${remoteDir}${remotePath}/${embedProject} ./${embedProject}`
      );
    }
  } catch (error) {
    logger.errorBox(`意外错误:${error}`);
  }
}

async function uploadWithProgress(
  ssh: SSH2Promise,
  localDir: string,
  remoteDir: string
) {
  const files = fs.readdirSync(localDir);
  const totalFiles = files.length;
  let uploadedCount = 0;

  for (const file of files) {
    const localFilePath = path.join(localDir, file);
    console.log("🚀 ~ uploadWithProgress ~ localFilePath:", localFilePath);
    const remoteFilePath = `${remoteDir}/${file}`;

    console.log("🚀 ~ uploadWithProgress ~ remoteFilePath:", remoteFilePath);
    if (fs.lstatSync(localFilePath).isDirectory()) {
      // 如果是子目录，可以递归处理
      await ssh.exec(`mkdir -p ${remoteFilePath}`);
      await uploadWithProgress(ssh, localFilePath, remoteFilePath);
    } else {
      try {
        await ssh.sftp().fastPut(localFilePath, remoteFilePath);
        uploadedCount++;
        logger.info(`[进度]: 已上传 ${uploadedCount}/${totalFiles}: ${file}`);
      } catch (error) {
        logger.error(`上传失败 ${file}:${error}`);
      }
    }
  }
}

export { scripts, pack, upload, link };
