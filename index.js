'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports['default'] = createMiddleware;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _ravenJs = require('raven-js');

var _ravenJs2 = _interopRequireDefault(_ravenJs);

function createMiddleware(dsn) {
  var cfg = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
  var opt = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  /*
    Function that generates a crash reporter for Sentry.
     dsn - private Sentry DSN.
    cfg - object to configure Raven.
    opt - object with extra configuration to send with captureException.
  */
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

  return function (store) {
    return function (next) {
      return function (action) {
        try {
          return next(action);
        } catch (err) {
          console.error('[redux-raven-middleware] Reporting error to Sentry:', err);

          // Allow the user to extend, but not replace, extra.
          var extra = _extends({
            action: action,
            state: store.getState()
          }, opt.extra || {});
          delete opt.extra;

          // Send the report.
          console.log(store.getState());
          _ravenJs2['default'].captureException(err, _extends({
            extra: extra
          }, opt));
        }
      };
    };
  };
}

module.exports = exports['default'];
