# git-config

Guld configuration helper manages git config files.

### Example Output

```
$ guld-config list
user.username=isysd
user.signingkey=C7EA0E59D0660BF6848614B6441BDDD420F44729
commit.gpgsign=true
alias.pushall=!git remote | xargs -L1 -I R git push R $2
host.github=isysd
host.bitbucket=isysd
host.gitlab=isysd
core.testing4=true
core.repositoryformatversion=0
core.filemode=true
core.bare=false
core.logallrefupdates=true
```

### Install

```
npm i -g guld-config
```

### Usage

```
// async
// assume it's empty
var cfg = await getConfig('local') // {}
cfg.core.test = true
setConfig('cfg.core.test', true)
var cfg = await getConfig('local') // {core: {test: true}}
```

##### Node

```
const { guldName, getConfig, setConfig, unsetConfig } = require('guld-config')
```

##### CLI

```
  Usage: guld-config [options] [command]

  Options:

    -V, --version             output the version number
    --global                  Use the global config file
    --local                   Use the local config file
    --system                  Use the system config file.
    -f, --file <config-file>  Use the given config file.
    -h, --help                output usage information

  Commands:

    name                      Get the guld name of the current user.
    get <key>                 Get a config by key.
    set <key> <value>         Set a config key to the given value.
    unset                     Get the distro, if linux OS.
    list                      List all config key/value pairs.
```

