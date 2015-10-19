var fs = require('extfs')
var path = require('path')
var Promise = require('promise')
var async = require('async')
var clone = require('nodegit').Clone.clone
var _ = require('lodash')
var fsx = require('fs-extra')

var keysToCheck = ['main', 'scripts.test',
  'devDependencies.seneca',
  'peerDependencies.seneca',
  'devDependencies.lab',
  'devDependencies.eslint-config-standard',
  'devDependencies.eslint-plugin-standard']

var populate = function (json, keys) {
  var obj = {}
  keys.forEach(function (key) {
    var content = key.split('.').reduce(function (memo, part) {
      return memo[part] || {}
    }, json)
    obj[key] = content
  })
  return obj
}

var override = function (obj, keysvalue) {
  _.each(keysvalue, function (v, k) {
    var parts = k.split('.')
    parts.reduce(function (memo, k, index) {
      if (index !== (parts.length - 1)) {
        memo[k] = memo[k] || {}
        return memo[k]
      } else {
        memo[k] = v
      }
    }, obj)
  })
  return obj
}

var getPackageJson = function (folder) {
  return function () {
    var promise = new Promise(function (resolve, reject) {
      fs.readFile(path.join(folder, 'package.json'), 'utf-8', function (err, data) {
        if (err) { return reject(err) }
        try {
          var json = JSON.parse(data)
        } catch (e) {
          return reject('package.json not valid JSON')
        }
        return resolve(json)
      })
    })
    return promise
  }
}

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
    var opts = {
      fetchOpts: {
        callbacks: {
          certificateCheck: function () {
            return 1
          }
        }
      }
    }
    return clone('https://github.com/' + repo + '.git', folder, opts)
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
              if (['.git', 'node_modules', 'test'].indexOf(file) > -1) {
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

var start = function () {
  return new Promise(function (resolve, reject) {
    resolve()
  })
}

module.exports = function (params) {
  params = params || {}
  var fixmode = params.fix || false

  function checkFolderFunc (checkFolder, toCheckFolder, cb) {
    return start()
      .then(listRecursiveFile(toCheckFolder))
      .then(function (filepath) {
        toCheckFiles = filepath
      })

      .then(listRecursiveFile(checkFolder))
      .then(function (filepath) {
        checkFiles = filepath
      })
      .then(function () {
        checkFiles = checkFiles.map(function (file) {
          return file.split('/').slice(checkFolder.split('/').length).join('/')
        })

        toCheckFiles = toCheckFiles.map(function (file) {
          return file.split('/').slice(toCheckFolder.split('/').length).join('/')
        })
      }).then(function () {
        var notFound
        return new Promise(function (resolve, reject) {
          notFound = checkFiles.reduce(function (memo, file) {
            if (toCheckFiles.indexOf(file) === -1) {
              memo.push(file)
            }
            return memo
          }, [])

          return notFound.length > 0 ? reject('files not found ' + notFound) : resolve()
        }).catch(function (reason) {
          return new Promise(function (resolve, reject) {
            if (!fixmode) return reject(reason)
            fsx.ensureDir(path.join(checkFolder, 'lib'), function () {
              async.every(notFound, function (file, cb) {
                if (file !== 'lib/index.js') {
                  fsx.copy(path.join(checkFolder, file), path.join(toCheckFolder, file), function (err) {
                    cb(err == null)
                  })
                } else {
                  // we might try to solve lib/index.js problem
                  // one file in lib ?

                  var dirs = ['lib', '']

                  async.some(dirs, function (dir, cb) {
                    fs.readdir(path.join(toCheckFolder, dir), function (err, files) {
                      if (err || !files || files.length === 0) {
                        return cb(false)
                      }

                      var jsfile = files.length === 1 ? files : files.filter(function (file) {
                        return file.slice(-3) === '.js'
                      })

                      if (jsfile.length === 1) {
                        // bingo, lets move the file
                        fsx.move(path.join(toCheckFolder, dir, files[0]), path.join(toCheckFolder, 'lib', 'index.js'), function (err) {
                          return cb(err == null)
                        })
                      } else {
                        cb(false)
                      }
                    })
                  }, function (result) {
                    if (result === true) {
                      cb(true)
                    } else {
                      // lets try to get value from package.json

                      getPackageJson(toCheckFolder)().then(function (json) {
                        console.log('json', json)

                        if (json && json.main) {
                          fsx.move(path.join(toCheckFolder, json.main), path.join(toCheckFolder, 'lib', 'index.js'), function (err) {
                            return cb(err == null)
                          })
                        }
                      })
                    }
                  })
                }
              }, function (success) {
                console.log('success is', success, notFound)
                reject(notFound)
              })
            })
          })
        })
      }
    ).then(
      function () {
        // check package.json
        var origJson, packJson

        return getPackageJson(checkFolder)().then(function (json, err) {
          origJson = json
        }).then(getPackageJson(toCheckFolder)).then(function (json, err) {
          packJson = json
        }).then(function () {
          return new Promise(function (resolve, reject) {
            var checkKeys = populate(origJson, keysToCheck)
            var toCheckKeys = populate(packJson, keysToCheck)

            var toReject = []
            _.each(checkKeys, function (value, key) {
              if (value !== toCheckKeys[key]) {
                if (_.isEqual(toCheckKeys[key], {})) {
                  return toReject.push('key ' + key + ' is not defined in package,json, value should be : ' + value)
                } else {
                  return toReject.push(key + ' is not good : ' + value + '!=' + toCheckKeys[key])
                }
              }
            })
            return toReject.length === 0 ? resolve(checkKeys) : reject(toReject.join('\n'))
          })
        }).catch(function (reason) {
          return new Promise(function (resolve, reject) {
            if (!fixmode) { return reject(reason) }

            var newPackage = override(packJson, populate(origJson, keysToCheck))

            console.log('new packages is', newPackage)
            fs.writeFile(path.join(toCheckFolder, 'package.json'), JSON.stringify(newPackage, null, '  '), 'utf-8', function (err) {
              if (err) {
                reject('fixing package.json failed : ' + err)
              } else {
                resolve()
              }
            })
          })
        })
      }).then(
      function (good) {
        cb()
      }

    ).catch(function (err) {
      cb(err)
    })
  }

  function checkRepoFunc (checkRepo, repo, cb) {
    var checkFolder = 'default'
    var toCheckFolder = 'to-check'

    start()
      .then(deleteFolder(toCheckFolder))
      .then(cloneRepo(repo, toCheckFolder))
      .then(deleteFolder(checkFolder))
      .then(cloneRepo(checkRepo, checkFolder))
      .then(function () { return checkFolderFunc(checkFolder, toCheckFolder, cb) })
      .catch(function (err) { console.log(err) })
  }

  return {
    checkRepo: checkRepoFunc,
    checkFolder: checkFolderFunc
  }
}
