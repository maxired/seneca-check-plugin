'use strict'

var Lab = require('lab')

var lab = exports.lab = Lab.script()
var describe = lab.describe
var it = lab.it

var Check = require('..')
var check
var assert = require('assert')
var _ = require('lodash')

describe('Check', function () {
  it('is a Function', function (done) {
    assert.ok(Check)
    assert.ok(_.isFunction(Check))
    done()
  })

  it('can be initated synchronously', function (done) {
    check = Check()
    done()
  })

  it('check has 2 methodes', function (done) {
    assert.ok(check.checkRepo)
    assert.ok(_.isFunction(check.checkRepo))
    assert.ok(check.checkFolder)
    assert.ok(_.isFunction(check.checkFolder))
    done()
  })

  it('can be initated with params synchronously', function (done) {
    check = Check({})
    done()
  })

  it('can be initated with params synchronously', function (done) {
    check = Check({fix: true})
    done()
  })
})
