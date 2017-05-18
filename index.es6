import Raven from 'raven-js';
import createRavenMiddleware from 'raven-for-redux';

export default function createMiddleware(dsn, cfg={}, options={}) {
  /*
    Function that generates a crash reporter for Sentry.

    dsn - private Sentry DSN.
    cfg - object to configure Raven.
    options - customize extra data sent to sentry
      actionTransformer - tranform the action object to send; default to identity function
      stateTransformer - transform the state object to send; default to identity function
      breadcrumbDataFromAction - derive a breadcrumb `data` object from each action; default to noop
      breadcrumbCategory - category for redux action breadcrumbs; default "redux"
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

  options.breadcrumbCategory = options.breadcrumbCategory || "redux";

  return createRavenMiddleware(Raven, options);
}
