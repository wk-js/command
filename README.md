# wk

## Full configuration file

`Command.toml/command.toml`
```toml
imports = [ "../others.toml" ] # Import other commands
importGlobals = true # Import commands from ~/.wk/**/*.{toml,json}

[commands]
hello = "echo 'Hello World'"

[commands.welcome]
command = "echo 'Welcome John'"
description = "Display a welcome message" # Add a task description

[commands.age]
command = "echo"
args = [ "How", "old", "are", "you?" ] # Pass command arguments

[commands.your_age]
command = "echo 'I am ${age}.'"
dependsOn = [ 'welcome', 'age' ] # Add dependent task, executed in serie
variables = { age = 39 } # Add variables

[commands.system]
command = "echo 'I do know my OS.'"
conditions = [ # Override a task with a condition
  { platform = "linux", override = { command = "I am on linux" } }
]

[commands.webpack]
command = "webpack"
binPath = "./node_modules/.bin" # Set binary path

[commands.pwd]
command = "pwd"
cwd = "../my/cwd/path" # Change CWD

[commands.ls]
command = "ls -ll"
visible = false # Hide the task from list. Only visible with --wk.verbose

[aliases]
user_path = "pwd" # Alias to "pwd" command

# Alias can overide task attributes
[aliases.my_age]
command = "your_age"
variables = { age = 29 }

# Register task executed in parallels
[concurrents]
start = [ "hello", "your_age" ]
```

## wk parameters

* `--wk.commands=[PATH]`   Set commands file path
* `--wk.global`            Import global tasks. Can accept "false" to disable
* `--wk.verbose`           Display error stack

## Transfer arguments

```toml
[commands]
hello = "echo 'Hello '"
node = "node"
```

```sh
wk hello John
> Hello John
wk node --version
> v8.10.0
```

## Variables

Can be used on following fields:
* name
* command
* cwd
* cmd
* binPath
* description
* args
* dependsOn

```toml
[commands.hello]
command = "echo 'Hello ${name}!'"
variables = { name = "John" }
```

```sh
wk hello
> Hello John!
wk hello --var.name Mark
> Hello Mark!
```

### Variables with concurrents

```toml
[commands]
echo = "echo"
welcome = "echo 'Welcome'"

[concurrents]
start = [ "welcome", "echo 'Hello ${name}!'" ]
```

```sh
wk start --var.name John
> Welcome
> Hello John!
```