import { env, Uri, window, workspace } from "vscode";
import logger from "../utils/logger";
import * as path from "path";
import * as fs from "fs";
import * as cp from "child_process";
import { NodeSSH } from "node-ssh";

const ssh = new NodeSSH();

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
  try {
    logger.info(`准备上传`);

    const localBuildPath = path.join(workspaceFolder, "dist"); // 假设打包输出到 dist
    if (!fs.existsSync(localBuildPath)) {
      logger.errorBox(`没有找到打包后的文件夹: ${localBuildPath}`);
      return;
    }

    const { host, port, username, password, remotePath } = deployConfig;
    await ssh.connect({
      host,
      port,
      username,
      password,
    });
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

    // await deployWithSCP(deployConfig, localBuildPath);
    await uploadWithProgress(
      localBuildPath,
      `${remoteDir}${remotePath}/${deployDir}`
    );
    logger.info("上传完成，正在配置...");
    await link(deployConfig, deployDir);
  } catch (error) {
    logger.error(`上传错误: ${error}`);
    const retry = await window.showQuickPick(["重试", "取消"], {
      placeHolder: "连接或上传失败，重试?",
    });
    if (retry !== "重试") {
      return;
    }
  }
}

async function link(deployConfig: any, deployDir: string) {
  try {
    const { remotePath, url } = deployConfig;
    ssh
      .execCommand(`ln -sfn ./${deployDir} ./publish`, {
        cwd: `${remoteDir}${remotePath}`,
      })
      .then(async function (result) {
        await embedLink(deployConfig, deployDir);
        logger.infoBox(`部署完成${deployDir}`);
      });

    logger.info(`访问地址确认部署`);
    logger.info(`地址：${url}`);

    await env.openExternal(Uri.parse(url));

    ssh.dispose();
  } catch (error) {
    logger.errorBox(`意外错误:${error}`);
  }
}

async function embedLink(deployConfig: any, deployDir: string) {
  try {
    const { remotePath, embedProjects } = deployConfig;

    for (const embedProject of embedProjects) {
      await ssh.execCommand(
        `ln -sfn ${remoteDir}${remotePath}/${embedProject} ./${embedProject}`,
        {
          cwd: `${remoteDir}${remotePath}/publish`,
        }
      );
    }

    // await ssh.execCommand(`ln -sfn ./${deployDir} ./publish`, {
    //   cwd: `${remoteDir}${remotePath}`,
    // });
  } catch (error) {
    logger.errorBox(`意外错误:${error}`);
  }
}

async function deployWithSCP(config: any, localPath: any) {
  try {
    logger.info(`开始连接服务器...`);

    // logger.info(`SSH 连接成功`);

    const now = new Date();
    const deployDir = `dev_${now.getFullYear()}${String(
      now.getMonth() + 1
    ).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}_${String(
      now.getHours()
    ).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(
      now.getSeconds()
    ).padStart(2, "0")}`;

    // 耗时计算
    const startTime = Date.now();

    const { port, username, host, remotePath } = config;

    logger.info(`开始上传文件夹...`);
    // const scpCommand = `scp -r -P ${port} ${localPath} ${username}@${host}:${remoteDir}${remotePath}/${deployDir}`;
    // const scpCommand = `scp -r -P 6666 /Users/yongliangzhao/Projects/JiuZhou/university-product-recruit/dist web@localhost:/alidata/server/vue/test/dev_20250210_131734`;
    const scpCommand = "cd /alidata/server/vue/test && ls -a";
    console.log("🚀 ~ deployWithSCP ~ scpCommand:", process.cwd());
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

    logger.info("上传完成，正在配置...");
    await link(config, deployDir);
  } catch (error) {
    logger.error(`部署失败: ${error}`);
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

export { scripts, pack, upload, link };
