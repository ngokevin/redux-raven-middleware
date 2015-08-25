import assert from 'assert';
import Raven from 'raven-js';
import sinon from 'sinon';

import createRavenMiddleware from './index';


sinon.stub(Raven, 'config', () => {
  return {install: () => {}}
});

const stubStore = {
  getState: () => ({})
};

const mockNextHandler = action => {
  if (action.error) {
    throw new Error('Test Error');
  }
  return () => {};
};


describe('createRavenMiddleware', () => {
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

  it('catches error', () => {
    const actionHandler = createRavenMiddleware('abc')(stubStore)(action => {
      if (action.error) {
        throw new Error('Test Error');
      }
    });
    console.log(actionHandler({error: true}));
  });
});
