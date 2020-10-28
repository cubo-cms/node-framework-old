/** @package        @cubo-cms/node-framework
  * @module         /lib/Server.mjs
  * @version        0.3.20
  * @copyright      2020 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        MIT license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import http2 from 'http2';

import Core from './Core.mjs';
import Log from './Log.mjs';

import JResponse from './helper/JResponse.mjs';

export default class Server extends Core {
  /** @property {object} default - holds defaults specific for this instance
    **/
  default = {
    port: 8000
  };

  /** @constructor (data)
    * Class constructor
    * @param {string|object} data - instance data to store
    **/
  constructor(data = {}) {
    super(data);
    Log.success(`Server is initiated`);
  }

  /** @function list(port,process)
    * Starts listening on specified port
    * @param {int} port
    * @param {function} processor
    **/
  listen(port = undefined, processor) {
    this.set('port', port, this.get('port'));
    this.loadFile('cert', this.get('cert'), 'certLoaded');
    this.loadFile('key', this.get('key'), 'keyLoaded');
    this.once('keyLoaded', () => {
      this.server = http2.createSecureServer(this.data, (request, response) => {
        let payload = [];
        request.on('data', (chunk) => {
          payload.push(chunk);
        }).on('end', () => {
          payload = Buffer.concat(payload).toString();
          processor({ headers: request.headers, method: request.method, url: request.url, payload: payload })
            .then((result) => {
              /*
              response.statusCode = result.status ? Core.status[result.status].code : result.ok ? 200 : 400;
              response.setHeader('Content-Type', result.contentType || 'text/plain');
              response.setHeader('X-Powered-By', 'Cubo CMS');
              response.setHeader('Set-Cookie', result.cookie);
              if(result.status === 'success') {
                response.setHeader('Content-Length', Buffer.byteLength(result.data || ''));
                response.write(result.data || '');
              } else {
                result.data = Core.status[result.status].message + '\n' || '';
                response.setHeader('Content-Length', Buffer.byteLength(result.data || ''));
                response.write(result.data || '');
              }*/
              response.statusCode = 200;
              response.write('THE END');
              response.end();
            }).catch((error) => {
              console.debug(error);
              let { statusCode, message } = JResponse.status['error'];
              response.statusCode = statusCode;
              response.write(`${message}: ${error}\n`);
              response.end();
            });
        }).on('error', (error) => {
          console.debug(error);
          let { statusCode, message } = JResponse.status['error'];
          response.statusCode = statusCode;
          response.write(`${message}: ${error}\n`);
          response.end();
        });
      }).listen(this.get('port'), () => {
        Log.success({ message: `Server starts listening on port ${this.get('port')}`, type: 'success', class: this.name });
      });
//      process('request');
    });
  }
}
