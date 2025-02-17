const vscode = require('vscode');
const crypto = require('crypto');

// 生成项目标识符
export async function generateProjectId() {
    const workspacePath = vscode.workspace.rootPath;
    if (!workspacePath) {
        return null;
    }

    const hash = crypto.createHash('sha256');
    hash.update(workspacePath); // 使用项目路径生成哈希
    return hash.digest('hex'); // 返回哈希值作为标识符
}

// // 获取存储的项目标识符
// function getProjectId(context) {
//     const workspacePath = vscode.workspace.rootPath;
//     if (!workspacePath) {
//         return null;
//     }

//     // 从 workspaceState 获取项目 ID，如果没有存储过，则生成并存储
//     let projectId = context.workspaceState.get('project.id');
//     if (!projectId) {
//         projectId = generateProjectId(workspacePath);
//         context.workspaceState.update('project.id', projectId);
//     }

//     return projectId;
// }
