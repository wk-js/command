const { Command, Parameters } = require('../js/Command')

Command.init()
Command.create('list', 'ls')
Command.execute()