import { workspace } from "vscode";
import logger from "../utils/logger";
import * as path from "path";
import * as fs from "fs";

async function buildScripts() {
  try {
    const workspaceFolder = workspace.workspaceFolders?.[0]?.uri.fsPath;
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

export { buildScripts };
