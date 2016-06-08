import Raven from 'raven-js';


export default function createMiddleware(dsn, cfg={}) {
  /*
    Function that generates a crash reporter for Sentry.

    dsn - private Sentry DSN.
    cfg - object to configure Raven.
  */
  if (!Raven.isSetup()) {
    if (!dsn) {
      // Skip this middleware if there is no DSN.
      console.error('[redux-raven-middleware] Sentry DSN required.');
      return store => next => action => {
        next(action);
      };
    }
    Raven.config(dsn, cfg).install();
  }

  return store => next => action => {
    try {
      return next(action);
    } catch (err) {
      console.error('[redux-raven-middleware] Reporting error to Sentry:',
                    err);

      // Send the report.
      Raven.captureException(err, {
        extra: {
          action: action,
          state: store.getState(),
        }
      });
    }
  }
}
