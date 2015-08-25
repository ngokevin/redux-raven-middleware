'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _ravenJs = require('raven-js');

var _ravenJs2 = _interopRequireDefault(_ravenJs);

var _sinon = require('sinon');

var _sinon2 = _interopRequireDefault(_sinon);

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

_sinon2['default'].stub(_ravenJs2['default'], 'config', function () {
  return { install: function install() {} };
});

var stubStore = {
  getState: function getState() {
    return {};
  }
};

var mockNextHandler = function mockNextHandler(action) {
  if (action.error) {
    throw new Error('Test Error');
  }
  return function () {};
};

describe('createRavenMiddleware', function () {
  it('returns middleware', function () {
    _assert2['default'].equal(_index2['default'].constructor, Function);
  });

  it('middleware returns nextHandler', function () {
    var nextHandler = (0, _index2['default'])('abc')(stubStore);
    _assert2['default'].equal(nextHandler.constructor, Function);
  });

  it('nextHandler returns actionHandler', function () {
    var actionHandler = (0, _index2['default'])('abc')(stubStore)();
    _assert2['default'].equal(actionHandler.constructor, Function);
    _assert2['default'].equal(actionHandler.length, 1);
  });

  it('catches error', function () {
    var actionHandler = (0, _index2['default'])('abc')(stubStore)(function (action) {
      if (action.error) {
        throw new Error('Test Error');
      }
    });
    console.log(actionHandler({ error: true }));
  });
});
