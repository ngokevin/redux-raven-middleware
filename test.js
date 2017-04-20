'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _sinon = require('sinon');

var _sinon2 = _interopRequireDefault(_sinon);

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
  var createRavenMiddleware = require('./index');
  var Raven = require('raven-js');
  var ravenSpy = _sinon2['default'].spy(Raven, 'captureException');

  beforeEach(function () {
    _sinon2['default'].stub(Raven, 'config', function () {
      return { install: function install() {} };
    });
  });
  afterEach(function () {
    Raven.config.restore();
    ravenSpy.reset();
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
    createRavenMiddleware('abc')(stubStore)(mockNextHandler)({ error: true });

    _assert2['default'].equal(ravenSpy.args[0][0].constructor, Error);
    _assert2['default'].equal(ravenSpy.args[0][0].message, 'Test Error');
    _assert2['default'].deepEqual(ravenSpy.args[0][1].extra.action, { error: true });
    _assert2['default'].deepEqual(ravenSpy.args[0][1].extra.state, { test: 'test' });
  });

  it('reports error with transformed state and action', function () {
    var actionTransformer = function actionTransformer(action) {
      return action.error;
    };
    var stateTransformer = function stateTransformer(state) {
      return state.test;
    };
    var cfg = {};
    var opts = { actionTransformer: actionTransformer, stateTransformer: stateTransformer };
    createRavenMiddleware('abc', cfg, opts)(stubStore)(mockNextHandler)({ error: true });

    _assert2['default'].equal(ravenSpy.args[0][0].constructor, Error);
    _assert2['default'].equal(ravenSpy.args[0][0].message, 'Test Error');
    _assert2['default'].equal(ravenSpy.args[0][1].extra.action, true);
    _assert2['default'].equal(ravenSpy.args[0][1].extra.state, 'test');
  });

  it('logs via custom logger', function () {
    var logger = _sinon2['default'].spy();
    var cfg = {};
    var opts = { logger: logger };
    createRavenMiddleware('abc', cfg, opts)(stubStore)(mockNextHandler)({ error: true });

    _assert2['default'].equal(ravenSpy.args[0][0].constructor, Error);
    _assert2['default'].equal(ravenSpy.args[0][0].message, 'Test Error');
    _assert2['default'].deepEqual(ravenSpy.args[0][1].extra.action, { error: true });
    _assert2['default'].deepEqual(ravenSpy.args[0][1].extra.state, { test: 'test' });
    (0, _assert2['default'])(logger.calledOnce, 'logs one message');
    _assert2['default'].equal(logger.args[0][0], ravenSpy.args[0][0]);
  });
});
