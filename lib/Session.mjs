/** @package        @cubo-cms/node-framework
  * @module         /lib/Session.mjs
  * @version        0.3.20
  * @copyright      2020 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        MIT license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import crypto from 'crypto';

import Core from './Core.mjs';
import Log from './Log.mjs';
import Timer from './Timer.mjs';

export default class Session extends Core {
  /** @static @property {object} default - holds default settings for class
    **/
  static default = {
    cleanUpInterval: '1d',  // interval at which abandoned sessions are cleaned up
    keySize: 24             // default size of generated keys
  };
  /** @property {object} default - holds defaults specific for this instance
    **/
  default = {
    maxAge: '1h',           // maximum lifetime of session after last request
    user: 'nobody',         // default user when starting session
    userRole: 'guest'       // default user role when starting session
  };
  /** @constructor (data)
    * Class constructor
    * @param {string|object} data - instance data to store
    **/
  constructor(data = { sessionId: Session.generateKey() }) {
    super(data);
    this.set('sessionId', this.get('sessionId', Session.generateKey()));
    this.set('user', undefined);
    this.set('userRole', undefined);
    this.setLifetime(this.get('maxAge'));
    if(!global._session_) global._session_ = {};
    _session_[this.get('sessionId')] = this;
  }
  /** @function isAuthenticated()
    * Getter returns true if a session appears authenticated
    * @return {bool}
    **/
  get isAuthenticated() {
    return this.accessToken && this.expires > Date.now();
  }
  /** @function isGuest()
    * Getter returns true if a session appears unauthenticated
    * @return {bool}
    **/
  get isGuest() {
    return !this.isAuthenticated;
  }
  /** @function setAccessToken(maxAge)
    * Sets session lifetime
    * @param {int} keySize - no value clears the token
    * @return {string} - generated token
    **/
  setAccessToken(keySize = 0) {
    if(keySize) {
      return this.accessToken = Session.generateKey(keySize);
    } else {
      this.set('user', undefined);
      this.set('userRole', undefined);
      delete this.accessToken;
      return undefined;
    }
  }
  /** @function setLifetime(maxAge)
    * Sets session lifetime
    * @param {string} session
    **/
  setLifetime(maxAge = this.get('maxAge')) {
    this.expires = Date.now() + Timer.parse(maxAge);
  }
  /** static @function cleanUp(sessions)
    * Removes abandoned sessions that have expired
    * @param {object} sessions
    **/
  static cleanUp() {
    Log.info('Session starts cleaning up');
    if(!global._session_) return;
    for(const session of Object.keys(_session_)) {
      if(_session_[session].expires && _session_[session].expires < Date.now()) {
        delete _session_[session];
      }
    }
  }
  /** static @function find(accessToken)
    * Find session by access token
    * @param {string} accessToken
    * @return {object}
    **/
  static find(accessToken) {
    if(!global._session_) return undefined;
    for(const sessionId of Object.keys(_session_)) {
      if(_session_[sessionId].accessToken === accessToken && _session_[sessionId].expires > Date.now()) {
        return _session_[sessionId];
      }
    }
    return undefined;
  }
  /** @static @function generateKey(keySize)
    * Generates a random key of specified size
    * @param {int} keySize
    * @return {string}
    **/
  static generateKey(keySize = Session.default.keySize) {
    return crypto.randomBytes(keySize).toString('hex');
  }
  /** static @function get(sessionId)
    * Find session by session ID
    * @param {string} sessionId
    * @return {object}
    **/
  static get(sessionId) {
    if(!global._session_) return undefined;
    return _session_[sessionId];
  }
}