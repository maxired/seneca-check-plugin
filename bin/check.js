#!/usr/bin/env node

var checkRepo = require('..').checkRepo
var checkFolder = require('..').checkFolder

var defaultRepo = 'maxired/seneca-skeleton'

var checkMethod = checkRepo

function printHelp () {
  console.log('Usage: seneca-check-plugin [OPTION]... MODEL TOCHECK')
  console.log('   Or: seneca-check-plugin [OPTION]... TOCHECK')
  console.log('   Or: seneca-check-plugin continue')
  console.log('Check if TOCHECK is based on same parameters than MODEL. If model is not defined, default model is', defaultRepo, '\n')

  console.log('Syntax for MODEL and TOCHECK :')
  console.log('MODEL AND TOCHECK are github repository identifiant. They should follow the syntax Username/Repo.')
  console.log('For example, the defaut MODEL is', defaultRepo)
  console.log('It corresponds to the repo %s from user %s', defaultRepo.split('/')[1], defaultRepo.split('/')[0])
  console.log('And can be access at https://github.com/%s', defaultRepo)
}

if (process.argv.length !== 3 && process.argv.length !== 4) {
  printHelp()
  process.exit(1)
}

if (process.argv.length === 3) {
  if (process.argv[2] === '-h' || process.argv[2] === '--help' || process.argv[2].indexOf('/') === -1) {
    if (process.argv[2] === 'continue') {
      checkMethod = checkFolder
      orig = 'default'
      tocheck = 'to-check'
    } else {
      printHelp()
      process.exit(1)
    }
  }
}

var orig = process.argv.length === 4 ? process.argv[2] : defaultRepo
var tocheck = process.argv[process.argv.length - 1]

checkMethod(orig, tocheck, function (err, good) {
  if (err) {
    console.error(err, good)
    return
  }

  if (good) {
    console.log(good)
  } else {
    console.log('everything looks good')
  }
})
