export type Bot = {
  send: (prompt: string) => Promise<string>
}
