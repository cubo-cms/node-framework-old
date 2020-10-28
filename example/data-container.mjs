import Cubo from '../namespace.mjs';

class Country extends Cubo.Core {
  constructor(data) {
    super(data);
  }
}

const France = new Country({
  continent: 'Europe',
  language: 'French',
  capital: 'Paris',
  currency: 'Euro'
});

France.loaded((obj) => {
  console.log(obj);
});

const Germany = new Country({
  continent: 'Europe',
  capital: 'Berlin'
});

Germany.apply({ language: 'German', currency: 'Euro' });

Germany.loaded((obj) => {
  console.log(obj);
});
