/** @package        @cubo-cms/node-framework
  * @module         /lib/Router.mjs
  * @version        0.3.20
  * @copyright      2020 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        MIT license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import Core from './Core.mjs';
import Log from './Log.mjs';

import JResponse from './helper/JResponse.mjs';

export default class Router extends Core {
  /** @property {object} default - holds default values
    **/
  default = {
    route: {
      'GET /': { dataType: 'Accesslevel' },
      'GET /favicon.ico': { dataType: 'AccessLevel', method: 'skip' },
      'GET /{dataType}': {},
      'GET /{dataType}:{id}': {},
      'GET /{dataType}/:{id}': {},
      'GET /{dataType}/{filter}:{id}': {},
      'GET /{dataType}/{filter}/:{id}': {},
      'POST /User/authenticate': { dataType: 'User', method: 'authenticate' }
    }
  }

  /** @constructor (data)
    * Class constructor
    * @param {string|object} data - instance data to store
    **/
  constructor(data = {}) {
    super(data);
  }

  /** @function parse(request)
    * Parses a requested URL and returns parsed data
    * @param {object} request - request to be processed
    * @return {object}
    **/
  parse(request) {
    Log.info({ message: `Router parses request`, source: this.name, payload: `${request.method} ${request.path}` });
    const url = new URL(request.path, 'https://localhost');
    const requestURL = request.method + ' ' + url.pathname;
    let data = {};
    // Store payload
    if(request.contentType === 'application/json') {
      data.payload = JSON.parse(request.payload);
    } else if(request.contentType === 'application/x-www-form-urlencoded') {
      data.payload = {};
      let postedParams = new URLSearchParams(querystring.unescape(request.payload));
      for(const [property, value] of postedParams) {
        data.payload[property] = value;
      }
    }
    // Store parsed query properties
    for(const [property, value] of url.searchParams) {
      data[property] = value;
    }
    let regexRoute = /^([A-Z]+)\s\/([^/:?]+)?([/:]+)?([^/:?]+)?([/:]+)?([^/:?]+)?([/:]+)?([^/:?]+)?([/:]+)?([^/:?]+)?$/g;
    let regexProp = /^\{([\w_-]+)\}$/g;
    let parsedData = {};
    let foundRoute = false;
    // Now start comparing each possible route with the url
    for(const [route, routeData] of Object.entries(this.get('route'))) {
      let matchRequest = [...requestURL.matchAll(regexRoute)][0] || [];
      let matchRoute = [...route.matchAll(regexRoute)][0] || [];
      let matched = true;
      for(let i = 1; i < matchRoute.length && matched; i++) {
        if(matchRoute[i] && matchRoute[i].match(regexProp)) {
          if(matchRequest[i]) {
            parsedData[matchRoute[i].replace(regexProp, '$1')] = matchRequest[i];
          } else {
            matched = false;
          }
        } else {
          matched &= (matchRoute[i] === matchRequest[i]);
        }
      }
      if(matched) {
        Object.assign(parsedData, routeData);
        foundRoute = true;
        break;
      } else {
        parsedData = {};
      }
    }
    if(foundRoute && parsedData.method != 'skip') {
      data.method = request.method.toLowerCase();
      Object.assign(data, parsedData);
      Log.info({ message: `Router returns results`, source: this.name, payload: data });
      return JResponse.success({ data: data });
    } else {
      return JResponse.respond('notFound');
    }
  }
}
