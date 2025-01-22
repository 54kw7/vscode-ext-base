"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractViewProvider = void 0;
const vscode_1 = require("vscode");
const fs_1 = require("fs");
const path_1 = require("path");
const html_modifier_1 = require("html-modifier");
const server_1 = require("@jsonrpc-rx/server");
class AbstractViewProvider {
    context;
    handlers;
    wiewProviderOptions;
    // 这个是在前端应用插入代码的标识，用于在 index.html 文件适应的位置插入内容
    static WEBVIEW_INJECT_IN_MARK = "__webview_public_path__";
    /**
     * 构造方法
     * @param context 该插件的上下文，在插件激活时可以获取
     * @param handlers jsonrpc-rx 中的处理逻辑的配置
     * @param wiewProviderOptions 相关配置
     */
    constructor(context, handlers, wiewProviderOptions) {
        this.context = context;
        this.handlers = handlers;
        this.wiewProviderOptions = wiewProviderOptions;
    }
    exposeHandlers(webview) {
        const jsonrpcServer = new server_1.JsonrpcServer(webview.postMessage.bind(webview), webview.onDidReceiveMessage.bind(webview));
        (0, server_1.expose)(jsonrpcServer, this.handlers);
    }
    /**
     * 处理前端应用 index.html 文件的方法
     * @param webview vscode.Webview 类型，指向 vscode.WebviewView 的一个属性：webview
     * @returns 处理好的 index.html 文本内容
     */
    async getWebviewHtml(webview) {
        const { distDir, indexPath } = this.wiewProviderOptions;
        // 前端应用的打包结果所在的目录，形如：https://file%2B.vscode-resource.vscode-cdn.net/d%3A/AAAAA/self/vscode-webview-example/packages/extension/out/view-vue
        const webviewUri = webview
            .asWebviewUri(vscode_1.Uri.joinPath(this.context.extensionUri, distDir))
            .toString();
        // 需要在前端应用中插入的脚本，目的是：将上述 webviewUri 所指的目录告知前端应用，前端应用在定位资源时需要
        const injectInContent = `<script> window.${AbstractViewProvider.WEBVIEW_INJECT_IN_MARK} = "${webviewUri}"</script>`;
        const htmlPath = (0, path_1.join)(this.context.extensionPath, indexPath);
        // 读取 index.html 文件内容
        const htmlText = (0, fs_1.readFileSync)(htmlPath).toString();
        // 使用 html-modifier 库来处理读取的内容，主要的作用是：1、将 script、link 标签中的 src、href 的值，重新赋予正确的值，2、将上述 injectInContent 的内容插入读取的内容中
        return await (0, html_modifier_1.modifyHtml)(htmlText, {
            onopentag(name, attribs) {
                if (name === "script") {
                    attribs.src = (0, path_1.join)(webviewUri, attribs.src);
                }
                if (name === "link") {
                    attribs.href = (0, path_1.join)(webviewUri, attribs.href);
                }
                return { name, attribs };
            },
            oncomment(data) {
                const hasMark = data
                    ?.toString()
                    .toLowerCase()
                    .includes(AbstractViewProvider.WEBVIEW_INJECT_IN_MARK);
                return hasMark
                    ? { data: injectInContent, clearComment: true }
                    : { data };
            },
        });
    }
}
exports.AbstractViewProvider = AbstractViewProvider;
//# sourceMappingURL=abstract.js.map