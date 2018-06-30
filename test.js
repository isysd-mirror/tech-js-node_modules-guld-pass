/* eslint-env node, mocha */
const assert = require('chai').assert
const { getName, getFullName} = require('./index.js')
const { getConfig, setConfig, unsetConfig, writeConfig} = require('guld-git-config')
const global = require('window-or-global')
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
})
