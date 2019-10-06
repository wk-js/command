import chalk from 'chalk';
import { pad } from 'lol/js/string'

export function command(command: string, cwd: string) {
  console.log(chalk.grey('> From'), cwd);
  console.log(chalk.grey('> Running'), command);
  console.log("");
  console.log("");
}

export function warn(...args: any[]) {
  console.log(chalk.yellow('[warn]'), ...args);
}

export function err(...args: any[]) {
  console.log(chalk.red('[err]'), ...args);
}

export function list(args: any[], type = 'default') {
  let length = 0
  let gap = 3

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (Array.isArray(arg)) {
      if (arg[0].length > length) length = arg[0].length
    } else {
      if (arg.length > length) length = arg.length
    }
  }

  length += gap

  for (let j = 0; j < args.length; j++) {
    const arg = args[j];

    let str = chalk.grey('*') + ' '

    if (Array.isArray(arg)) {
      str += pad(arg[0], length, ' ', true)

      if (type == 'default') {
        str += chalk.grey(arg[1])
      } else if (type == 'success') {
        str += arg[1] ? chalk.green('Success') : chalk.red('Failed')
      }
    } else {
      str += arg
    }

    console.log(str)
  }
}