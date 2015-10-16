#!/usr/bin/env node

var program = require('commander')

var Check = require('..')

var defaultRepo = 'maxired/seneca-skeleton'

program
  .version('0.0.1')
  .usage('[options] TOCHECK')
  .option('-m,--model <model>', 'The Repo we will check TOCHECK against', defaultRepo)
  .option('-f,--fix', 'Should we try to automattically solve some issues')
  .on('--help', function () {
    console.log('  Syntax for MODEL and TOCHECK :')
    console.log('    MODEL AND TOCHECK are github repository identifiant. They should follow the syntax Username/Repo.')
    console.log('    For example, the defaut MODEL is', defaultRepo)
    console.log('    It corresponds to the repo %s from user %s', defaultRepo.split('/')[1], defaultRepo.split('/')[0])
    console.log('    And can be access at https://github.com/%s', defaultRepo)
    console.log('')
    console.log('    if TOCHECK equal "continue", then the last check will be continued')
    console.log('')
    console.log('  Examples :')
    console.log('    seneca-check-plugin senecajs/seneca-level-store')
    console.log('    seneca-check-plugin continue')
    console.log('')
  })
  .parse(process.argv)

if (program.args.length !== 1) {
  program.help()
}

var tocheck = program.args[0]
var orig = program.model

var check = Check({fix: program.fix})

var checkMethod = check.checkRepo

if (tocheck === 'continue') {
  checkMethod = check.checkFolder
  orig = 'default'
  tocheck = 'to-check'
} else {
  if (tocheck.split('/').length !== 2) {
    program.help()
  }
}

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
