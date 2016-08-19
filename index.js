'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = createMiddleware;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _ravenJs = require('raven-js');

var _ravenJs2 = _interopRequireDefault(_ravenJs);

function createMiddleware(dsn) {
  var cfg = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  /*
    Function that generates a crash reporter for Sentry.
     dsn - private Sentry DSN.
    cfg - object to configure Raven.
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
        try {
          _ravenJs2['default'].captureBreadcrumb({
            category: 'redux',
            message: action.type
          });

          return next(action);
        } catch (err) {
          console.error('[redux-raven-middleware] Reporting error to Sentry:', err);

          // Send the report.
          _ravenJs2['default'].captureException(err, {
            extra: {
              action: action,
              state: store.getState()
            }
          });
        }
      };
    };
  };
}

module.exports = exports['default'];
