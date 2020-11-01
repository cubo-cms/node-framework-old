/** @package        @cubo-cms/node-framework
  * @module         /lib/Controller/UserController.mjs
  * @version        0.3.21
  * @copyright      2020 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        MIT license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import crypto from 'crypto';

import Namespace from '../../Namespace.mjs';

const method = {
  authenticate: function() {
    return new Promise((resolve, reject) => {
      let payload = this.get('payload');
      if(payload && payload.id && payload.password) {
        Namespace.Model.create({ method: 'get', dataType: 'User', id: payload.id, show: 'id,password,userRole', hide: '_id' }, this)
          .then((model) => {
            model.invokeMethod().then((response) => {
              Namespace.UserController.verify(payload.password, response.data.password)
                .then((result) => {
                  const sessionData = {
                    user: response.data.id,
                    userRole: response.data.userRole
                  };
                  this.session = new Namespace.Session(sessionData);
                  this.session.accessToken = Namespace.Session.generateKey(Namespace.UserController.default.accessTokenSize);
                  resolve(Namespace.JResponse.respond('accepted', { data: { accessToken: this.session.accessToken } }));
                }).catch((result) => {
                  reject(Namespace.JResponse.respond('notAuthorized'));
                });
            }).catch((error) => {
              reject(Namespace.JResponse.respond('badRequest'));
            });
          }).catch((error) => {
            reject(Namespace.JResponse.respond('badRequest'));
          });
      } else {
        reject(Namespace.JResponse.respond('notAuthorized'));
      }
    });
  }
};

export default class UserController extends Namespace.Controller {
  /** @static @property {object} default - holds default settings for class
    **/
  static default = {
    accessTokenSize: 32,
    saltSize: 16
  };

  /** @constructor (data)
    * Class constructor
    * @param {string|object} data - instance data to store
    **/
  constructor(data = {}) {
    super(data);
    Object.assign(this.method, method);
  }

  /** @static @function hash(password)
    * Returns a password hash
    * @param {string} password
    * @return {Promise <string>}
    **/
  static hash(password) {
    return new Promise((resolve, reject) => {
      const salt = crypto.randomBytes(this.default.saltSize).toString("hex");
      crypto.scrypt(password, salt, 64, (error, derivedKey) => {
        if(error) reject(error);
        resolve(salt + ":" + derivedKey.toString('hex'));
      });
    });
  }
  /** @static @function verify(password,hash)
    * Verifies password
    * @param {string} password
    * @param {string} hash
    * @return {Promise <boolean>}
    **/
  static verify(password, hash) {
    return new Promise((resolve, reject) => {
      const [salt, key] = hash.split(":");
      crypto.scrypt(password, salt, 64, (error, derivedKey) => {
        if(error) reject(error);
        resolve(key == derivedKey.toString('hex'));
      });
    });
  }
}
