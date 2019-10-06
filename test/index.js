const { TaskList } = require('../js/task-list')

const Runner = TaskList.create()
Runner.register('list', 'ls')
Runner.register('list-test', 'ls').cwd('./tests').dependsOn('list')
Runner.run('list-test')