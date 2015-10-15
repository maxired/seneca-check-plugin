#!/usr/bin/env node

var checkRepo = require('..').checkRepo

var defaultRepo = 'maxired/seneca-skeleton'

function printHelp () {
  console.log('Usage: seneca-check-plugin [OPTION]... MODEL TOCHECK')
  console.log('   Or: seneca-check-plugin [OPTION]... TOCHECK')
  console.log('Check if TOCHECK is based on same parameters than MODEL. If model is not defined, will check against', defaultRepo, '\n')

  console.log(' -h, --help', '\t', 'Print this help')
}

if (process.argv.length !== 3 || process.arg.length !== 4) {
  printHelp()
  process.exit(1)
}

if (process.argv.length === 3) {
  if (process.argv[2] === '-h' || process.argv[2] === '--help') {
    printHelp()
    process.exit(1)
  }
}

var orig = process.argv.length === 4 ? process.argv[2] : defaultRepo
var tocheck = process.argv[process.argv.length - 1]

checkRepo(orig, tocheck, function (err, good) {
  if (err) {
    console.err(err, good)
    return
  }

  if (good) {
    console.log(good)
  } else {
    console.log('everything looks good')
  }
})
