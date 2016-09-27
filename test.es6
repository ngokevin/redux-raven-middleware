import assert from 'assert';
import _jsdom from 'jsdom';
import mochaJsdom from 'mocha-jsdom';
import sinon from 'sinon';


// Need jsdom since Raven uses `window.setTimeout` because specifying `window`
// is totally necessary.
global.document = _jsdom.jsdom('<html><body></body></html>');
global.window = document.parentWindow;
global.navigator = window.navigator;
const jsdom = mochaJsdom.bind(this, {skipWindowCheck: true});


const stubStore = {
  getState: () => ({test: 'test'})
};

const mockNextHandler = action => {
  if (action.error) {
    throw new Error('Test Error');
  }
};


describe('createRavenMiddleware', () => {
  jsdom();
  const createRavenMiddleware = require('./index');
  const Raven = require('raven-js');
  const ravenSpy = sinon.spy(Raven, 'captureException');

  beforeEach(() => {
    sinon.stub(Raven, 'config', () => {
      return {install: () => {}}
    });
  });
  afterEach(() => {
    Raven.config.restore();
    ravenSpy.reset();
  });

  it('returns middleware', () => {
    assert.equal(createRavenMiddleware.constructor, Function);
  });

  it('middleware returns nextHandler', () => {
    const nextHandler = createRavenMiddleware('abc')(stubStore);
    assert.equal(nextHandler.constructor, Function);
  });

  it('nextHandler returns actionHandler', () => {
    const actionHandler = createRavenMiddleware('abc')(stubStore)();
    assert.equal(actionHandler.constructor, Function);
    assert.equal(actionHandler.length, 1);
  });

  it('configures Raven', done => {
    Raven.config.restore();
    sinon.stub(Raven, 'config', (dsn, cfg) => {
      assert.equal(dsn, 'abc');
      assert.deepEqual(cfg, {tags: {test: 'test'}});
      done();

      return {install: () => {}};
    });
    createRavenMiddleware('abc', {tags: {test: 'test'}})
  });

  it('reports error', () => {
    createRavenMiddleware('abc')(stubStore)(mockNextHandler)({error: true});

    assert.equal(ravenSpy.args[0][0].constructor, Error);
    assert.equal(ravenSpy.args[0][0].message, 'Test Error');
    assert.deepEqual(ravenSpy.args[0][1].extra.action, {error: true});
    assert.deepEqual(ravenSpy.args[0][1].extra.state, {test: 'test'});
  });

  it('reports error with transformed state and action', () => {
    const actionTransformer = action => action.error
    const stateTransformer = state => state.test
    const cfg = {}
    const opts = { actionTransformer, stateTransformer }
    createRavenMiddleware('abc', cfg, opts)(stubStore)(mockNextHandler)({error: true});

    assert.equal(ravenSpy.args[0][0].constructor, Error);
    assert.equal(ravenSpy.args[0][0].message, 'Test Error');
    assert.equal(ravenSpy.args[0][1].extra.action, true);
    assert.equal(ravenSpy.args[0][1].extra.state, 'test');
  });

  it('logs via custom logger', () => {
    const logger = sinon.spy()
    const cfg = {}
    const opts = { logger }
    createRavenMiddleware('abc', cfg, opts)(stubStore)(mockNextHandler)({error: true});

    assert.equal(ravenSpy.args[0][0].constructor, Error);
    assert.equal(ravenSpy.args[0][0].message, 'Test Error');
    assert.deepEqual(ravenSpy.args[0][1].extra.action, {error: true});
    assert.deepEqual(ravenSpy.args[0][1].extra.state, {test: 'test'});
    assert(logger.calledOnce, 'logs one message')
    assert.equal(logger.args[0][0], ravenSpy.args[0][0])
  });
});
