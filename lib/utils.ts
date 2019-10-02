import { SpawnOptions, spawn } from "child_process";

export interface Parameters {
  a: string[],
  o: Record<string, string|boolean>
}

export function parse(argv: string[]) {

  const parameters: Record<string, string|boolean> = {}

  let key = ''
  let keyRegex = /^-{1,2}/
  let index = 0

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg.match(keyRegex)) {
      const split = arg.split(/=/)
      key = split[0].replace(keyRegex, '')

      if (split[1]) {
        parameters[key] = split[1]
      } else if (argv[i+1] && !argv[i+1].match(keyRegex)) {
        parameters[key] = argv[i+1]
        i++
      } else {
        parameters[key] = true
      }

      continue
    } else {
      parameters[index] = arg
      index++
    }
  }

  return parameters

}

export function execute(command: string, args?: string[], options?: SpawnOptions) {
  return new Promise<[number, string]>((resolve, reject) => {
    const ps = spawn(command, args, options)

    ps.on('error', reject)
    ps.on('exit', (code, signal) => {
      resolve([code, signal])
    })
  })
}