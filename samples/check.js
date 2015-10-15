var checkRepo = require('..').checkRepo

if (process.argv.length !== 4) {
  console.error('You should provide 2 arguments, both following the syntax <githubusername/githubrepo> ')
  process.exit(1)
}

console.log(process.argv)
var orig = process.argv[2]
var tocheck = process.argv[3]

checkRepo(orig, tocheck, function (err, good) {
  console.log(err, good)
})
