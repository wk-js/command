import { create_list, list_tasks, pass_args, help } from './cli/utils';
import { parse } from "./utils";
import { Runner } from './runner';
import { Task } from './task';
import * as Log from './log';
import { CommandRecord, load, lookup } from './importer';

const argv = parse(process.argv.slice(2))

async function main() {
  let commands: CommandRecord

  const importGlobals = typeof argv['wk.noglobal'] == 'boolean' ? !argv['wk.noglobal'] as boolean : true

  if (argv['wk.commands']) {
    commands = await load(argv['wk.commands'] as string, importGlobals)
  } else {
    commands = await lookup(importGlobals)
  }

  const runner = new Runner(create_list(commands))

  if (typeof argv['0'] == 'string') {
    return runner.run(argv['0'] as string, (task: Task) => {
      pass_args(task, argv)
    })
  } else {
    help()
    process.stdout.write('\n')
    list_tasks(runner.tasks, argv['wk.verbose'] as boolean)
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