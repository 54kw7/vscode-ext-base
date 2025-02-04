import { JsonrpcClient, wrap, type MessageReceiver, type MessageSender } from '@jsonrpc-rx/client'

const vscodeApi = (window as any).acquireVsCodeApi()

const msgSender: MessageSender = vscodeApi.postMessage.bind(vscodeApi)
const msgReceiver: MessageReceiver = (handler: any) =>
  window.addEventListener('message', (evt) => handler(evt.data))

const jsonrpcClient = new JsonrpcClient(msgSender, msgReceiver)

export const useHandlers = () => wrap<any>(jsonrpcClient)
