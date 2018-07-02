const { getFS } = require('guld-fs')
const { getName } = require('guld-user')
const spawn = require('guld-spawn')
const { getConfig } = require('guld-git-config')
const { decryptFile, encryptToFile } = require('keyring-gpg')
const path = require('path')
const home = require('user-home')
var fs
var guldname

async function init (gname, keys, p) {
  fs = fs || await getFS()
  gname = gname || guldname || await getName()
  p = p || gname
  if (typeof keys === 'undefined') {
    var cfg = await getConfig('merged', gname)
    keys = [cfg.user.signingkey]
  } else if (typeof keys === 'string') keys = [keys]
  try {
    await fs.stats(path.join(home, '.password-store', '.gpg-id'))
  } catch (e) {
    if (keys.length > 0) {
      await spawn('pass', '', ['init', ...keys])
      await spawn('pass', '', ['git', 'init'])
    }
    await spawn('pass', '', ['init', ...keys, '-p', gname])
    await spawn('pass', '', ['git', 'init', gname])
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
  if (!p.endsWith('.gpg')) p = `${p}.gpg`
  guldname = guldname || await getName()
  var cfg = await getConfig('merged', guldname)
  return encryptToFile(val, path.join(home, '.password-store', p), cfg.user.signingkey)
  // TODO git add commit up
}

function parsePass (raw) {
  var a
  var arr = raw.split('\n')
  if (!Array.isArray(arr)) arr = [arr]
  var pass = {'password': arr.shift()}
  while (arr.length > 0) {
    a = arr.shift()
    if (a.startsWith('login')) pass['login'] = a.replace('login: ', '').trim()
    else if (a.startsWith('user')) {
      if (!pass.hasOwnProperty('login')) pass['login'] = a.replace('user: ', '').trim()
    } else if (a.startsWith('url')) pass['url'] = a.replace('url: ', '').trim()
    else {
      var kv
      if (a.indexOf(':') > -1) {
        kv = a.split(':')
      } else kv = [a]
      var key = kv[0].trim()
      pass[key] = pass[key] || ''
      var val = a.replace(`${key}: `, '').trim()
      pass[key] = `${pass[key]}\n${val}`.trim()
    }
  }
  return pass
}

function stringifyPass (pass) {
  var str = ``
  if (typeof pass === 'string') return pass
  else if (pass.password) str = `${pass.password}\n`
  for (var key in pass) {
    if (key === undefined || key === 'password' || key.length === 0) continue
    var val = pass[key] || ''
    str = `${str}${key}: ${val}\n`
  }
  return str.trim()
}

async function merge (p, val) {
  var orig = parsePass(await show(p))
  var merged = Object.assign(orig, val)
  return insert(p, stringifyPass(merged))
}

module.exports = {
  init: init,
  insert: insert,
  show: show,
  merge: merge,
  parsePass: parsePass,
  stringifyPass: stringifyPass
}
