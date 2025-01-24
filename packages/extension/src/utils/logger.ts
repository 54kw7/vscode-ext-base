import * as vscode from "vscode";

class Logger {
  private outputChannel: vscode.OutputChannel;

  constructor(channelName: string) {
    this.outputChannel = vscode.window.createOutputChannel(channelName);
  }

  //   private formatTimestamp(): string {
  //     const now = new Date();
  //     return now.toISOString().replace("T", " ").replace("Z", "");
  //   }

  private formatTimestamp(): string {
    const now = new Date();
    const offsetMs = now.getTimezoneOffset() * 60000; // 本地时区偏移毫秒数
    const localTime = new Date(now.getTime() - offsetMs);
    return localTime.toISOString().replace("T", " ").slice(0, 19); // 输出格式：YYYY-MM-DD HH:mm:ss
  }

  private log(level: string, message: string, duration?: number) {
    const timestamp = this.formatTimestamp();
    const durationInfo = duration !== undefined ? ` [${duration}ms]` : "";
    this.outputChannel.appendLine(
      `[${level}][${timestamp}]${message}${durationInfo}`
    );
  }

  infoBox(message: string, duration?: number) {
    this.log("INFO", message, duration);
    vscode.window.showInformationMessage(message);
  }

  errorBox(message: string, duration?: number) {
    this.log("ERROR", message, duration);
    vscode.window.showErrorMessage(message);
  }

  info(message: string, duration?: number) {
    this.log("INFO", message, duration);
  }

  error(message: string, duration?: number) {
    this.log("ERROR", message, duration);
  }

  debug(message: string, duration?: number) {
    this.log("DEBUG", message, duration);
  }

  show() {
    this.outputChannel.show(true);
  }
}

export default Logger;
