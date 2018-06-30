const { getJS, setGlobal } = require('guld-env')
const { getConfig, setConfig } = require('guld-git-config')
const global = require('window-or-global')

async function getName () {
  var cfg
  if (global.GULDNAME && typeof global.GULDNAME !== 'undefined' && global.GULDNAME.length > 0) {
    return global.GULDNAME
  } else if (getJS().startsWith('node')) {
    if (process.env.GULDNAME && typeof process.env.GULDNAME !== 'undefined' && process.env.GULDNAME.length > 0) {
      return setGlobal('GULDNAME', process.env.GULDNAME)
    } else {
      cfg = await getConfig('global')
      if (cfg && cfg.user && cfg.user.username) return setGlobal('GULDNAME', cfg.user.username)
      if (process.env.USER) return setGlobal('GULDNAME', process.env.USER)
    }
  } else {
    cfg = await getConfig('global')
    if (cfg && cfg.user && cfg.user.username) return setGlobal('GULDNAME', cfg.user.username)
  }
  return setGlobal('GULDNAME', 'guld')
}

async function getFullName () {
  var cfg
  if (global.GULDFULLNAME && typeof global.GULDFULLNAME !== 'undefined' && global.GULDFULLNAME.length > 0) {
    return global.GULDFULLNAME
  } else {
    cfg = await getConfig('global')
    if (cfg && cfg.user && cfg.user.name) return setGlobal('GULDFULLNAME', cfg.user.name)
  }
}

module.exports = {
  getName: getName,
  getFullName: getFullName
}
