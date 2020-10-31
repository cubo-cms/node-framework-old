/** @package        @cubo-cms/node-framework
  * @module         /lib/Core/Server.mjs
  * @version        0.3.20
  * @copyright      2020 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        MIT license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import http2 from 'http2';

import Core from '../Core.mjs';
import JResponse from '../Helper/JResponse.mjs';
import Log from '../Helper/Log.mjs';

export default class Server extends Core {
  /** @property {object} default - holds defaults specific for this instance
    **/
  default = {
    port: 8000
  };

  /** @function list(port,process)
    * Starts listening on specified port
    * @param {int} port
    * @param {function} processor
    **/
  listen(port = undefined, processor) {
    this.set('port', port, this.get('port'));
    this.loadFile('cert', this.get('cert'))
      .then(() => {
        return this.loadFile('key', this.get('key'))
      }).then(() => {
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
                response.statusCode = result.statusCode;
                response.setHeader('Content-Type', result.contentType || 'text/plain');
                response.setHeader('X-Powered-By', 'Cubo CMS');
                if(result.cookie)
                  response.setHeader('Set-Cookie', result.cookie);
                if(result.data) {
                  response.write(typeof result.data === 'string' ? result.data : JSON.stringify(result.data));
                } else {
                  response.write(result.message);
                }
                response.end();
              }).catch((error) => {
                console.log(error);
                response.statusCode = error.statusCode || 500;
                response.setHeader('Content-Type', error.contentType || 'text/plain');
                response.setHeader('X-Powered-By', 'Cubo CMS');
                if(error.cookie)
                  response.setHeader('Set-Cookie', error.cookie);
                if(error.data) {
                  response.write(typeof error.data === 'string' ? error.data : JSON.stringify(error.data));
                } else {
                  response.write(error.message);
                }
                response.end();
              });
          }).on('error', (error) => {
            console.debug(error);
            let { statusCode, message } = JResponse.status['error'];
            response.statusCode = statusCode;
            response.write(`${error}\n`);
            response.end();
          });
        }).listen(this.get('port'), () => {
          Log.success({ message: `Server listens on port ${this.get('port')}`, source: this.name });
        });
      });
  }
}
