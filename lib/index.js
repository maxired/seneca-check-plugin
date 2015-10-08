
var fs = require('extfs')
var path = require('path')
var Promise = require('promise')
var async = require('async')
var clone = require('nodegit').Clone.clone

var repo = 'rjrodger/seneca-vcache'

var deleteFolder = function (folder) {
  return function () {
    var promise = new Promise(function (resolve, reject) {
      fs.exists(folder, function (exists) {
        if (!exists) return resolve()
        fs.remove(folder, function (err) {
          if (err) return reject(err)
          return resolve()
        })
      })
    })
    return promise
  }
}

var cloneRepo = function (repo, folder) {
  return function () {
    return clone('https://github.com/' + repo, folder, null)
  }
}

var checkFile = function (filename) {
  return function () {
    var promise = new Promise(function (resolve, reject) {
      fs.exists(path.join('tmp', filename), function (exists) {
        return exists ? resolve() : reject('file not found ' + filename)
      })
    })
    return promise
  }
}

var listRecursiveFile = function (folder) {
  return function () {
    var filesPath = []
    var promise = new Promise(function (resolve, reject) {
      fs.readdir(folder, function (err, files) {
        if (err) { return reject(err) }
        async.each(files, function (file, cb) {
          var currentFile = path.join(folder, file)
          fs.stat(currentFile, function (err, stat) {
            if (err) { return cb(err) }
            if (stat.isFile()) {
              filesPath.push(currentFile)
              cb(null, file)
            } else {
              console.log('file is', file)
              if (['.git', 'node_modules'].indexOf(file) > -1) {
                return cb()
              }
              listRecursiveFile(currentFile)().then(function (files) {
                files.forEach(function (file) {
                  filesPath.push(file)
                })
                cb(null, filesPath)
              })
            }
          })
        }, function () {
          resolve(filesPath)
        })
      })
    })
    return promise
  }
}


var checkFiles,
  toCheckFiles

deleteFolder('tmp')()
 .then(deleteFolder('check'))
 .then(cloneRepo('maxired/seneca-skeleton', 'check'))
 .then(cloneRepo(repo, 'tmp'))
 .then(listRecursiveFile('check')).then(function (filepath) {
   checkFiles = filepath
 })
 .then(listRecursiveFile('tmp')).then(function (filepath) {
   toCheckFiles = filepath
 })
 /* .then(checkFile('.eslintrc'))
 .then(checkFile('.travis.yml'))
 .then(checkFile('lib'))
 .then(checkFile('test'))
 .then(checkFile('LICENCE'))
 .then(checkFile('Readme.md'))
 */
 .then(
  function () {
    console.log('toto', checkFiles, toCheckFiles)
  }).catch(function (err) {
    console.log(err)
  })

/*
clone
// Clone a given repository into a specific folder.

npm.load(undefined, function (err) {
  if (err) { return console.log(err) }
  npm.commands.install([packageName + '@' + packageVersion], function (err, packagee) {
    if (err) { return console.log(err) }

    var mod = require(packageName)
    if (!mod) { return console.log(err) }

    var filesToCheck = ['.eslintrc', '.travis.yml', 'lib', 'test']

    async.forEach(filesToCheck, function (fileToCheck, cb) {
      var fileLocation = path.join(pathPrefix, fileToCheck)
      fs.exists(fileLocation, function (exists) {
        if (exists) { return cb() }
        console.log('package', packageName, 'has no file/folder', fileToCheck)
        cb()
      })
    }, function () {
      console.log('done')
    })
  })
})
*/
