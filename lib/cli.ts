import { load, lookup, create_list, CommandRecord, list_tasks, pass_args, help } from './cli/utils';
import { parse } from "./utils";
import { Runner } from './runner';
import { Task } from './task';
import * as Log from './log';

const argv = parse(process.argv.slice(2))

async function main() {
  let commands: CommandRecord

  if (argv['wk.commands']) {
    commands = load(argv['wk.commands'] as string)
  } else {
    commands = lookup()
  }

  const runner = new Runner(create_list(commands))

  if (typeof argv['0'] == 'string') {
    return runner.run(argv['0'] as string, (task: Task) => {
      pass_args(task, argv)
    })
  } else {
    help()
    process.stdout.write('\n')
    list_tasks(runner.tasks)
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