import Raven from 'raven-js';

const identity = stuff => stuff;

export default function createMiddleware(dsn, cfg={}, options={}) {
  /*
    Function that generates a crash reporter for Sentry.

    dsn - private Sentry DSN.
    cfg - object to configure Raven.
    options - customize extra data sent to sentry
      actionTransformer - tranform the action object to send; default to identity function
      stateTransformer - transform the state object to send; default to identity function
      logger - the logger to use for logging; default to console.error
  */
  if (!Raven.isSetup()) {
    if (!dsn) {
      // Skip this middleware if there is no DSN.
      console.error('[redux-raven-middleware] Sentry DSN required.');
      return store => next => action => {
        return next(action);
      };
    }
    Raven.config(dsn, cfg).install();
  }

  return store => next => action => {
    const {
      actionTransformer = identity,
      stateTransformer = identity,
      logger = console.error.bind(console, '[redux-raven-middleware] Reporting error to Sentry:')
    } = options;
    try {
      Raven.captureBreadcrumb({
        category: 'redux',
        message: action.type
      });

      return next(action);
    } catch (err) {
      logger(err);

      // Send the report.
      Raven.captureException(err, {
        extra: {
          action: actionTransformer(action),
          state: stateTransformer(store.getState()),
        }
      });
    }
  }
}
