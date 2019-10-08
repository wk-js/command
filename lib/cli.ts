import { create_list, print_tasks, print_help, print_results, isCommand } from './cli/utils';
import { parse } from "./utils";
import { Runner } from './runner';
import * as Log from './log';
import { load, lookup, Config } from './importer';

async function cli(taskName: string, command: string, argv: Record<string, string|boolean>) {
  let config: Config

  const importGlobals = typeof argv['wk.global'] == 'boolean' ? argv['wk.global'] as boolean : false

  if (argv['wk.commands']) {
    config = await load(argv['wk.commands'] as string, importGlobals)
  } else {
    config = await lookup(importGlobals)
  }

  const runner = new Runner(create_list(config, argv))

  if (typeof taskName == 'string' && taskName.length > 0) {
    const results = runner.run(command)
    print_results(await results)
    return results
  } else {
    print_help()
    process.stdout.write('\n')
    print_tasks(runner.tasks, argv['wk.verbose'] as boolean)
  }
}

async function main() {
  const argvs    = process.argv.slice(2)
  const taskName = isCommand(argvs[0]) ? argvs[0] : ''
  const parsed   = parse(argvs.slice(taskName.length > 0 ? 1 : 0))

  Log.silent(parsed['wk.verbose.0'] as boolean)

  try {
    await cli(taskName, argvs.join(' '), parsed)
  } catch(e) {
    if (parsed['wk.verbose']) {
      Log.err(e)
    } else {
      Log.err(e.message)
    }
  }
}

main()
process.on('SIGINT', () => {})