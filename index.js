'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = createMiddleware;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _ravenJs = require('raven-js');

var _ravenJs2 = _interopRequireDefault(_ravenJs);

var identity = function identity(stuff) {
  return stuff;
};

function createMiddleware(dsn) {
  var cfg = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  /*
    Function that generates a crash reporter for Sentry.
     dsn - private Sentry DSN.
    cfg - object to configure Raven.
    options - customize extra data sent to sentry
      actionTransformer - tranform the action object to send; default to identity function
      stateTransformer - transform the state object to send; default to identity function
      logger - the logger to use for logging; default to console.error
      enableBreadcrumbsCapture - whether to send breadcrumbs as part of request; default to true
  */
  if (!_ravenJs2['default'].isSetup()) {
    if (!dsn) {
      // Skip this middleware if there is no DSN.
      console.error('[redux-raven-middleware] Sentry DSN required.');
      return function (store) {
        return function (next) {
          return function (action) {
            next(action);
          };
        };
      };
    }
    _ravenJs2['default'].config(dsn, cfg).install();
  }

  return function (store) {
    return function (next) {
      return function (action) {
        var _options$actionTransformer = options.actionTransformer;
        var actionTransformer = _options$actionTransformer === undefined ? identity : _options$actionTransformer;
        var _options$stateTransformer = options.stateTransformer;
        var stateTransformer = _options$stateTransformer === undefined ? identity : _options$stateTransformer;
        var _options$logger = options.logger;
        var logger = _options$logger === undefined ? console.error.bind(console, '[redux-raven-middleware] Reporting error to Sentry:') : _options$logger;
        var _options$enableBreadcrumbsCapture = options.enableBreadcrumbsCapture;
        var enableBreadcrumbsCapture = _options$enableBreadcrumbsCapture === undefined ? true : _options$enableBreadcrumbsCapture;

        try {
          if (enableBreadcrumbsCapture) {
            _ravenJs2['default'].captureBreadcrumb({
              category: 'redux',
              message: action.type
            });
          }

          return next(action);
        } catch (err) {
          logger(err);

          // Send the report.
          _ravenJs2['default'].captureException(err, {
            extra: {
              action: actionTransformer(action),
              state: stateTransformer(store.getState())
            }
          });
        }
      };
    };
  };
}

module.exports = exports['default'];
