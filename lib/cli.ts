import { create_list, print_tasks, print_help, print_results } from './cli/utils';
import { parse } from "./utils";
import { Runner } from './runner';
import * as Log from './log';
import { load, lookup, Config } from './importer';

const command = process.argv.slice(2)
const argv = parse(command)

async function main() {
  let config: Config

  const importGlobals = typeof argv['wk.global'] == 'boolean' ? argv['wk.global'] as boolean : false

  if (argv['wk.commands']) {
    config = await load(argv['wk.commands'] as string, importGlobals)
  } else {
    config = await lookup(importGlobals)
  }

  const runner = new Runner(create_list(config))

  if (typeof argv['0'] == 'string') {
    const results = runner.run(command.join(" "))
    print_results(await results)
    return results
  } else {
    print_help()
    process.stdout.write('\n')
    print_tasks(runner.tasks, argv['wk.verbose'] as boolean)
  }
}

main()
.catch((e) => {
  if (argv['wk.verbose']) {
    Log.err(e)
  } else {
    Log.err(e.message)
  }
})

process.on('SIGINT', () => {})