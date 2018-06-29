/* eslint-env node, mocha */
const assert = require('chai').assert
const { getConfigPath, guldName, getConfig, writeConfig, mergeConfig, setConfig, unsetConfig, setupConfig } = require('./index.js')
const global = require('window-or-global')
const { getFS } = require('guld-fs')
var fs
var guldname

async function runSetGet (scope) {
  this[scope] = await getConfig(scope)
  assert.notExists(this[scope].testflag)
  this[scope].core = this[scope].core || {}
  this[scope].core.testflag = true
  await writeConfig(this[scope], scope)
  this[scope] = await getConfig(scope)
  assert.exists(this[scope].core.testflag)
  delete this[scope].core.testflag
  await writeConfig(this[scope], scope)
}

describe('guld-config', function () {
  before(async function () {
    guldname = await guldName()
  })
  describe('guldName', function () {
    after(async function () {
      delete process.env.GULDNAME
      delete global.GULDNAME
      guldname = await guldName()
    })
    it('USER env', async function () {
      guldname = await guldName()
      assert.exists(guldname)
      assert.equal(guldname, process.env.USER)
    })
    it('cached', async function () {
      process.env.GULDNAME = 'testuser'
      guldname = await guldName()
      assert.exists(guldname)
      assert.equal(guldname, process.env.USER)
    })
    it('GULDNAME env', async function () {
      delete global.GULDNAME
      guldname = await guldName()
      assert.exists(guldname)
      assert.equal(guldname, process.env.GULDNAME)
    })
  })
  describe('getConfigPath', function () {
    it('local', async function () {
      this.local = await getConfigPath('local')
      assert.exists(this.local)
      assert.isTrue(this.local.endsWith('guld-config/.git/config'))
    })
    it('global', async function () {
      this.global = await getConfigPath('global')
      assert.exists(this.global)
      assert.isTrue(this.global.endsWith('.gitconfig'))
    })
    it('system', async function () {
      this.system = await getConfigPath('system')
      assert.exists(this.system)
      assert.isTrue(this.system.endsWith('/etc/gitconfig'))
    })
    it('public', async function () {
      this.pub = await getConfigPath('public')
      assert.exists(this.pub)
      assert.isTrue(this.pub.endsWith(`dotfiles/${guldname}/.gitconfig`))
    })
    it('public other', async function () {
      this.pub = await getConfigPath('public', 'other')
      assert.exists(this.pub)
      assert.isTrue(this.pub.endsWith(`dotfiles/other/.gitconfig`))
    })
  })
  describe('setupConfig', function () {
    before(async function () {
      fs = fs || await getFS()
      var gpath = await getConfigPath('global')
      await fs.rename(gpath, `${gpath}.bak`).catch()
      gpath = await getConfigPath('public')
      await fs.rename(gpath, `${gpath}.bak`).catch()
    })
    after(async function () {
      var gpath = await getConfigPath('global')
      await fs.rename(`${gpath}.bak`, gpath).catch()
      gpath = await getConfigPath('public')
      await fs.rename(`${gpath}.bak`, gpath).catch()
    })
    it('empty', async function () {
      await setupConfig({user: {username: guldname}})
      var pub = await getConfig('public')
      assert.equal(pub.user.username, guldname)
      var glob = await getConfig('global')
      assert.equal(glob.user.username, guldname)
    })
    it('merge flat', async function () {
      await setupConfig({core: {testing2: true}})
      var pub = await getConfig('public')
      assert.isTrue(pub.core.testing2)
      var glob = await getConfig('global')
      assert.isTrue(glob.core.testing2)
    })
    it('merge waterfall', async function () {
      await mergeConfig({core: {testing3: true}}, 'public')
      await setupConfig({core: {testing4: true}})
      var pub = await getConfig('public')
      assert.isTrue(pub.core.testing3)
      assert.isTrue(pub.core.testing4)
      var glob = await getConfig('global')
      assert.isTrue(glob.core.testing3)
      assert.isTrue(glob.core.testing4)
    })
  })
  describe('getConfig', function () {
    it('local', async function () {
      this.local = await getConfig('local')
      assert.exists(this.local)
      assert.isTrue(this.local.hasOwnProperty('core'))
    })
    it('global', async function () {
      this.global = await getConfig('global')
      assert.exists(this.global)
      assert.isTrue(this.global.hasOwnProperty('user'))
    })
    it('public', async function () {
      this.pub = await getConfig('public')
      assert.exists(this.pub)
      assert.isTrue(this.pub.hasOwnProperty('user'))
    })
    it('public other', async function () {
      this.pub = await getConfig('public', 'fake_other').catch()
    })
  })
  describe('writeConfig', function () {
    it('local', async function () {
      await runSetGet('local')
    })
    it('global', async function () {
      await runSetGet('global')
    })
    it('public', async function () {
      await runSetGet('public')
    })
    it('public other', async function () {
      await runSetGet('public', 'fake_other')
    })
  })
  describe('setConfig', function () {
    before(async function () {
      fs = fs || await getFS()
      var gpath = await getConfigPath('local')
      await fs.rename(gpath, `${gpath}.bak`).catch()
    })
    after(async function () {
      var gpath = await getConfigPath('local')
      await fs.rename(`${gpath}.bak`, gpath).catch()
    })
    it('local', async function () {
      this.local = await setConfig('core.test', true, 'local')
      assert.exists(this.local)
      assert.isTrue(this.local)
      this.local = await getConfig('local')
      assert.isTrue(this.local.core.test)
    })
  })
  describe('unsetConfig', function () {
    before(async function () {
      fs = fs || await getFS()
      var gpath = await getConfigPath('local')
      await fs.rename(gpath, `${gpath}.bak`).catch()
    })
    after(async function () {
      var gpath = await getConfigPath('local')
      await fs.rename(`${gpath}.bak`, gpath).catch()
    })
    it('local', async function () {
      this.local = await setConfig('core.test', true, 'local')
      assert.exists(this.local)
      assert.isTrue(this.local)
      await unsetConfig('core.test', 'local')
      this.local = await getConfig('local')
      assert.notExists(this.local.core)
    })
  })
})
