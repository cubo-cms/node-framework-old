/** @package        @cubo-cms/node-framework
  * @module         /lib/Helper/Log.mjs
  * @version        0.3.21
  * @copyright      2020 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        MIT license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

/** TODO:
  *   - The intention is to use this only for console or text file logging
  *   - Need to add methods to make this possible
  **/

// Define colors for different types of messages
const logColors = {
  bright: { color: "\x1b[1m" },   // Bright
  debug: { color: "\x1b[35m" },   // Magenta
  dim: { color: "\x1b[2m" },      // Dim
  error: { color: "\x1b[31m" },   // Red
  info: { color: "\x1b[36m" },    // Cyan
  reset: { color: "\x1b[0m" },    // Reset to normal
  success: { color: "\x1b[32m" }, // Green
  warning: { color: "\x1b[33m" }  // Yellow
};

/** @function normalize(data)
  * Makes sure there is an object with required fields
  * @param {string||object} data
  * @param {string} type - error type
  * @return {object}
  **/
function normalize(data, type = 'debug') {
  let returnData = {};
  if(typeof data === 'string') {
    returnData.message = data;
    returnData.type = type;
  } else if(typeof data === 'object') {
    returnData.message = data.message || 'Unknown error';
    returnData.type = data.type || type;
  } else {
    returnData.message = 'Unknown error';
    returnData.type = type;
  }
  returnData.time = new Date().getTime();
  return returnData;
}
/** @function formatted(data)
  * Outputs the data formatted with fancy colors
  * @param {string||object} data
  * @param {string} type - error type
  * @return {string}
  **/
function formatted(data, type = 'debug') {
  data = normalize(data, type);
  let output =
    (Log.default.colorize ? logColors['dim'].color : '') +
    (Log.default.useLocale ? new Date(data.time).toLocaleString(Log.default.locale) : new Date(data.time).toISOString()) +
    (Log.default.colorize ? logColors['reset'].color : '') + ' ' +
    (Log.default.colorize ? logColors[data.type].color + data.type + logColors['reset'].color : data.type) + ': ' +
    data.message;
  return output;
}

export default class Log {
  /** @static @property {object} default - holds default values
    **/
  static default = {
    colorize: false,                            // Use colors in log
    useLocale: false,                           // Show date using locale
    locale: new Intl.Locale('nl-NL', { timezone: 'America/Curacao' }),
    suppressType: ['info', 'debug'],                // Suppress message types
    suppressSource: []                                // Restrict classes that can log
  };
  /** @static @function debug(data)
    * Writes debug message to console
    * @param {object} data
    **/
  static debug(data) {
    if(!this.default.suppressType.includes('debug') && !this.default.suppressSource.includes(data.source)) {
      console.debug(formatted(data, 'debug'));
      if(data.payload) {
        console.group();
        console.log(data.payload);
        console.groupEnd();
      }
    }
  }
  /** @static @function error(data)
    * Writes error message to console
    * @param {object} data
    **/
  static error(data) {
    if(!this.default.suppressType.includes('error') && !this.default.suppressSource.includes(data.source)) {
      console.debug(formatted(data, 'error'));
      if(data.payload) {
        console.group();
        console.log(data.payload);
        console.groupEnd();
      }
    }
  }
  /** @static @function info(data)
    * Writes info message to console
    * @param {object} data
    **/
  static info(data) {
    if(!this.default.suppressType.includes('info') && !this.default.suppressSource.includes(data.source)) {
      console.info(formatted(data, 'info'));
      if(data.payload) {
        console.group();
        console.log(data.payload);
        console.groupEnd();
      }
    }
  }
  /** @static @function success(data)
    * Writes success message to console
    * @param {object} data
    **/
  static success(data) {
    if(!this.default.suppressType.includes('success') && !this.default.suppressSource.includes(data.source)) {
      console.log(formatted(data, 'success'));
      if(data.payload) {
        console.group();
        console.log(data.payload);
        console.groupEnd();
      }
    }
  }
  /** @static @function warning(data)
    * Writes warning message to console
    * @param {object} data
    **/
  static warning(data) {
    if(!this.default.suppressType.includes('warning') && !this.default.suppressSource.includes(data.source)) {
      console.warn(formatted(data, 'warning'));
      if(data.payload) {
        console.group();
        console.log(data.payload);
        console.groupEnd();
      }
    }
  }
}
