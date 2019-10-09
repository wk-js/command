export type ARGv = Record<string, string|boolean>

export function parse(argv: string[]) {

  const parameters: ARGv = {}

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

  Object.defineProperty(parameters, '___argv', {
    enumerable: false,
    writable: false,
    configurable: false,
    value: argv.join(' ')
  })

  return parameters

}

export function filter(argv: ARGv, regex: RegExp, omit = false) {
  const argv_arr: string[] = []
  const parameters: ARGv = {}

  Object.keys(argv)
  .forEach(key => {
    if ((omit && !key.match(regex)) || (!omit && key.match(regex))) {
      const new_key = key.replace(regex, '')
      parameters[new_key] = argv[key]

      if (isNaN(parseInt(key))) {
        argv_arr.push(`--${new_key}=${argv[key]}`)
      } else {
        argv_arr.push(argv[key] as string)
      }
    }
  })

  Object.defineProperty(parameters, '___argv', {
    enumerable: false,
    writable: false,
    configurable: false,
    value: argv_arr.join(' ')
  })

  return parameters
}
