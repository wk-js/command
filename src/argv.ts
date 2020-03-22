import { WKOptions } from "./types"

const WK_REG = /^--wk\./
const EQUAL_REG = /=/

export function parse(argv: string[]): [WKOptions, string[]] {
  const _argv: string[] = []
  const _wk: WKOptions = {
    commands: 'Commands.yml',
    verbose: false,
    debug: false,
  }

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];

    if (WK_REG.test(a)) {
      const parameter = a.replace(WK_REG, '')
      let [key, value] = parameter.split(EQUAL_REG)

      switch (key as keyof WKOptions) {
        case "debug":
          {
            _wk.debug = true
            break
          }

        case "verbose":
          {
            _wk.verbose = true
            break
          }

        case "commands":
          {
            if (typeof value !== 'string') {
              value = argv[i + 1]
              i++
            }
            _wk.commands = value
            break
          }
      }

      continue
    }

    _argv.push(a)
  }

  return [_wk, _argv]
}