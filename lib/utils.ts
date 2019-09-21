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
      key = arg.replace(keyRegex, '')

      const next = argv[i+1]

      if (next && !next.match(keyRegex)) {
        parameters[key] = next
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

export function execute(command: string, args: string[], options: SpawnOptions) {
  return new Promise<[number, string]>((resolve, reject) => {
    const ps = spawn(command, args, {
      shell: true,
      stdio: "inherit"
    })

    ps.on('error', reject)
    ps.on('exit', (code, signal) => {
      resolve([code, signal])
    })
  })
}