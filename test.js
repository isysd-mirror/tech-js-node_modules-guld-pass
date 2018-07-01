/* eslint-env node, mocha */
const assert = require('chai').assert
const { getName, getFullName, exists, validate} = require('./index.js')
const { getConfig, setConfig, unsetConfig, writeConfig} = require('guld-git-config')
const global = require('window-or-global')
const path = require('path')
const home = require('user-home')
const { getFS } = require('guld-fs')
var fs
var guldname
var fullname

describe('guld-config', function () {
  before(async function () {
    guldname = await getName()
  })
  describe('getName', function () {
    after(async function () {
      delete process.env.GULDNAME
      delete global.GULDNAME
      guldname = await getName()
    })
    it('USER env', async function () {
      guldname = await getName()
      assert.exists(guldname)
      assert.equal(guldname, process.env.USER)
    })
    it('cached', async function () {
      process.env.GULDNAME = 'testuser'
      guldname = await getName()
      assert.exists(guldname)
      assert.equal(guldname, process.env.USER)
    })
    it('GULDNAME env', async function () {
      delete global.GULDNAME
      guldname = await getName()
      assert.exists(guldname)
      assert.equal(guldname, process.env.GULDNAME)
    })
  })
  describe('getFullName', function () {
    before(async function () {
      delete global.GULDFULLNAME
      this.origcfg = await getConfig('global')
      await unsetConfig('user.name', 'global')
    })
    after(async function () {
      delete global.GULDFULLNAME
      fullname = await getFullName()
      await writeConfig(this.origcfg, 'global')
    })
    it('empty', async function () {
      fullname = await getFullName()
      assert.notExists(fullname)
      assert.equal(fullname, )
    })
    it('configured', async function () {
      await setConfig('user.name', 'Test User', 'global')
      fullname = await getFullName()
      assert.exists(fullname)
      assert.equal(fullname, 'Test User')
    })
    it('cached', async function () {
      await unsetConfig('user.name', 'global')
      fullname = await getFullName()
      assert.exists(fullname)
      assert.equal(fullname, 'Test User')
    })
  })
  describe('validate', function () {
    it('empty', async function () {
      assert.isTrue(validate())
    })
    it('too short', async function () {
      assert.throws(() => validate(''), RangeError)
    })
    it('bad chars', async function () {
      assert.throws(() => validate('!!!!'), RangeError)
    })
    it('too long', async function () {
      assert.throws(() => validate('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'), RangeError)
    })
  })
  describe('exists', function () {
    before(async function () {
      fs = fs || await getFS()
      fs.rename(path.join(home, '.blocktree', 'isysd'), path.join(home, '.blocktree', 'isysd.bak'))
    })
    after(async function () {
      fs = fs || await getFS()
      fs.rename(path.join(home, '.blocktree', 'isysd.bak'), path.join(home, '.blocktree', 'isysd'))
    })
    it('empty', async function () {
      es = await exists()
      assert.isTrue(es)
    }).timeout(4000)
    it('remote', async function () {
      es = await exists('isysd')
      assert.isTrue(es)
    }).timeout(4000)
    it('does not exists', async function () {
      var es = await exists('i-eat-shit-no-one-uses-me')
      assert.isNotTrue(es)
    }).timeout(4000)
  })
})
