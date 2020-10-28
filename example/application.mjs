import Cubo from '../namespace.mjs';

const app = new Cubo.Application('#/application.json');

app.loaded((obj) => {
  console.log(obj);
});
