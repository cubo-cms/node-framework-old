
import Core from './lib/Core.mjs';

let a = new Core({ a:'a', b:'b' });

console.log(a);

let b = Core.create({ c:'c' });

console.log(b);
