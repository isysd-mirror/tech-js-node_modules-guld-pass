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

See [guld-config-cli](https://github.com/isysd/tech-js-node_modules-guld-config-cli).
