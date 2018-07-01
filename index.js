const { getJS, setGlobal } = require('guld-env')
const { getFS } = require('guld-fs')
const { getName } = require('guld-user')
const spawn = require('guld-spawn')
const { getConfig } = require('guld-git-config')
const { decryptFile, encryptToFile } = require('keyring-gpg')
const global = require('window-or-global')
const path = require('path')
const home = require('user-home')
var fs
var guldname

async function init (gname, keys, p) {
  fs = fs || await getFS()
  gname = gname || guldname || await getName()
  p = p || gname
  if (typeof keys === 'undefined') {
    cfg = await getConfig('merged', gname)
    keys = [cfg.user.signingkey]
  } else if (typeof keys === 'string') keys = [keys]
  try {
    await fs.stats(path.join(home, '.password-store', '.gpg-id'))
  } catch (e) {
    if (keys.length > 0) {
      console.log(await spawn('pass', '', ['init', ...keys]))
      console.log(await spawn('pass', '', ['git', 'init']))
    }
    console.log(await spawn('pass', '', ['init', ...keys, '-p', gname]))
    console.log(await spawn('pass', '', ['git', 'init', gname]))
  }
  // TODO git fork, submodule and remote setup, then git subdir
}

async function show (p, lineNum) {
  var pass = await decryptFile(path.join(home, '.password-store', `${p}.gpg`))
  if (pass) {
    if (lineNum !== undefined) {
      pass = pass.split('\n')
      return pass[lineNum - 1]
    } else return pass
  }
}

async function insert (p, val) {
  guldname = guldname || await getName()
  var cfg = await getConfig('merged', guldname)
  await encryptToFile(val, path.join(home, '.password-store', p), cfg.user.signingkey)
  // TODO git add commit up
}

module.exports = {
  init: init,
  insert: insert,
  show: show
}
