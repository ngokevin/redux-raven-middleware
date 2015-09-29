'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _jsdom2 = require('jsdom');

var _jsdom3 = _interopRequireDefault(_jsdom2);

var _mochaJsdom = require('mocha-jsdom');

var _mochaJsdom2 = _interopRequireDefault(_mochaJsdom);

var _sinon = require('sinon');

var _sinon2 = _interopRequireDefault(_sinon);

// Need jsdom since Raven uses `window.setTimeout` because specifying `window`
// is totally necessary.
global.document = _jsdom3['default'].jsdom('<html><body></body></html>');
global.window = document.parentWindow;
global.navigator = window.navigator;
var jsdom = _mochaJsdom2['default'].bind(undefined, { skipWindowCheck: true });

var stubStore = {
  getState: function getState() {
    return { test: 'test' };
  }
};

var mockNextHandler = function mockNextHandler(action) {
  if (action.error) {
    throw new Error('Test Error');
  }
};

describe('createRavenMiddleware', function () {
  jsdom();
  var createRavenMiddleware = require('./index');
  var Raven = require('raven-js');

  beforeEach(function () {
    _sinon2['default'].stub(Raven, 'config', function () {
      return { install: function install() {} };
    });
  });
  afterEach(function () {
    Raven.config.restore();
  });

  it('returns middleware', function () {
    _assert2['default'].equal(createRavenMiddleware.constructor, Function);
  });

  it('middleware returns nextHandler', function () {
    var nextHandler = createRavenMiddleware('abc')(stubStore);
    _assert2['default'].equal(nextHandler.constructor, Function);
  });

  it('nextHandler returns actionHandler', function () {
    var actionHandler = createRavenMiddleware('abc')(stubStore)();
    _assert2['default'].equal(actionHandler.constructor, Function);
    _assert2['default'].equal(actionHandler.length, 1);
  });

  it('configures Raven', function (done) {
    Raven.config.restore();
    _sinon2['default'].stub(Raven, 'config', function (dsn, cfg) {
      _assert2['default'].equal(dsn, 'abc');
      _assert2['default'].deepEqual(cfg, { tags: { test: 'test' } });
      done();

      return { install: function install() {} };
    });
    createRavenMiddleware('abc', { tags: { test: 'test' } });
  });

  it('reports error', function () {
    var ravenSpy = _sinon2['default'].spy(Raven, 'captureException');
    createRavenMiddleware('abc')(stubStore)(mockNextHandler)({ error: true });

    _assert2['default'].equal(ravenSpy.args[0][0].constructor, Error);
    _assert2['default'].equal(ravenSpy.args[0][0].message, 'Test Error');
    _assert2['default'].deepEqual(ravenSpy.args[0][1].extra.action, { error: true });
    _assert2['default'].deepEqual(ravenSpy.args[0][1].extra.state, { test: 'test' });
  });
});
