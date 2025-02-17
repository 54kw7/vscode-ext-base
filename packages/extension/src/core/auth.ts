// import { SecretStorage } from 'vscode';
// import { NodeSSH } from 'node-ssh';

// export class AuthManager {
//   private static KEY = 'DEPLOY_CREDENTIALS';
//   private ssh = new NodeSSH();
//   private secrets: SecretStorage;

//   constructor(secrets: SecretStorage) {
//     this.secrets = secrets;
//   }

//   async getConnection(): Promise<NodeSSH> {
//     if (this.ssh.isConnected) return this.ssh;

//     // 尝试获取存储的凭据
//     let credentials = await this.secrets.get(AuthManager.KEY);
//     if (!credentials) {
//       credentials = await this.promptCredentials();
//     }

//     try {
//       await this.ssh.connect(JSON.parse(credentials));
//       return this.ssh;
//     } catch (err) {
//       // 处理认证失败
//       await this.secrets.delete(AuthManager.KEY);
//       throw new Error('认证失败，请重新输入凭据');
//     }
//   }

//   private async promptCredentials(): Promise<string> {
//     const host = await vscode.window.showInputBox({ prompt: '服务器地址' });
//     const username = await vscode.window.showInputBox({ prompt: '用户名' });
//     const password = await vscode.window.showInputBox({ 
//       prompt: '密码',
//       password: true
//     });

//     const credentials = JSON.stringify({ host, username, password });
//     await this.secrets.store(AuthManager.KEY, credentials);
//     return credentials;
//   }
// }