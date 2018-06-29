#!/usr/bin/env node
// eslint-disable-file no-console
const { guldName, getConfig, setConfig, unsetConfig } = require('./index.js')
const flat = require('flat')
const _get = require('lodash.get')
const program = require('commander')
const VERSION = require('./package.json').version

program
  // .usage('<key> Get a config by key (alias of get)')
  // .usage('<key> <value> Set a config key to the given value (alias of set)')
  .version(VERSION)
  .option('--global', 'Use the global config file')
  .option('--local', 'Use the local config file')
  .option('--system', 'Use the system config file.')
  .option('-f, --file <config-file>', 'Use the given config file.')
program
  .command('name')
  .description('Get the guld name of the current user.')
program
  .command('get <key>')
  .description('Get a config by key.')
program
  .command('set <key> <value>')
  .description('Set a config key to the given value.')
program
  .command('unset')
  .description('Get the distro, if linux OS.')
program
  .command('list')
  .description('List all config key/value pairs.')

program.parse(process.argv)

var scope
if (program.global) scope = 'global'
else if (program.system) scope = 'system'
else if (program.local) scope = 'local'
else if (program.file) scope = program.file
else scope = 'merged'
var cmd
if (program.args.length === 0) cmd = 'name'
else if (program.commands.map(c => c._name).indexOf(program.args[0]) !== -1) cmd = program.args.shift()
/* eslint-disable no-console */
switch (cmd) {
  case 'name':
    guldName().then(console.log)
    break
  case 'get':
    getConfig(scope).then(c => {
      var val = _get(c, program.args[0])
      if (val) console.log(val)
    })
    break
  case 'set':
    setConfig(program.args[0], program.args[1], scope).then(console.log)
    break
  case 'unset':
    unsetConfig(program.args[0], scope)
    break
  case 'list':
    getConfig(scope).then(conf => {
      var cfg = flat(conf)
      for (var c in cfg) {
        console.log(`${c}=${cfg[c]}`)
      }
    })
    break
  /* case 'setup':
    inquirer
      .prompt([
        {
          name: guldname,
          type: input,
          message: "What is your individual guld name?",
          default: await guldName()
        },
        {
          name: fullname,
          type: input,
          message: "What is your public full name? (optional)",
          default: await guldName()
        },
        {
          name: guldmail,
          type: input,
          message: "What is your public email address? (optional)"
        },
        {
          name: signingkey,
          type: input,
          message: "Which of these is your PGP key id? (blank for group)"
        }
      ])
      .then(answers => {
        answers.commit = {gpgsign: true}
        setupConfig(answers).then(c => {
          var cfg = flat(c)
          for (var c in cfg) {
            console.log(`${c}=${cfg[c]}`)
          }
        })
      })
    break */
  default:
    if (program.args.length === 1) {
      getConfig(scope).then(c => {
        var val = _get(c, program.args[0])
        if (val) console.log(val)
      })
    } else if (program.args.length === 2) {
      setConfig(program.args[0], program.args[1], scope).then(console.log)
    }
    break
}
/* eslint-enable no-console */
