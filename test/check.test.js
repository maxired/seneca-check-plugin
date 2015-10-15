'use strict'

var Lab = require('lab')

var lab = exports.lab = Lab.script()
var describe = lab.describe
var it = lab.it

var Check = require('..')

var assert = require('assert')
var _ = require('lodash')

describe('Check', function () {
  it('has 2 methodes', function (done) {
    assert.ok(Check.checkRepo)
    assert.ok(_.isFunction(Check.checkRepo))
    assert.ok(Check.checkFolder)
    assert.ok(_.isFunction(Check.checkFolder))
    done()
  })
})
