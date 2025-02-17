const fs = require("fs");
const path = require("path");
const os = require("os");

class ConfigStorage {
  private configDir: any;
  private configFile: any;

  constructor() {
    // 根据操作系统设置本地存储路径
    this.configDir = path.join(os.homedir(), ".vscode-magic-kit");
    if (!fs.existsSync(this.configDir)) {
      fs.mkdirSync(this.configDir);
    }
    this.configFile = path.join(this.configDir, "config.json");
  }

  // 读取配置文件
  readConfig() {
    if (fs.existsSync(this.configFile)) {
      const rawData = fs.readFileSync(this.configFile);
      return JSON.parse(rawData);
    }
    return {}; // 如果文件不存在，返回空对象
  }

  // 写入配置
  writeConfig(data: any) {
    const rawData = JSON.stringify(data, null, 2); // 格式化输出
    fs.writeFileSync(this.configFile, rawData);
  }

  // 存储单个键值对
  save(key: string | number, value: any) {
    const config = this.readConfig();
    config[key] = value;
    this.writeConfig(config);
  }

  // 获取单个键值对
  get(key: string | number) {
    const config = this.readConfig();
    return config[key];
  }

  // 删除键值对
  delete(key: string | number) {
    const config = this.readConfig();
    delete config[key];
    this.writeConfig(config);
  }
}

const configStorage = new ConfigStorage();

module.exports = configStorage;

export default configStorage;
