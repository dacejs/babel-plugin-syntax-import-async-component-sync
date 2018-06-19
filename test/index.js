const should = require('should');
const babel = require('babel-core');
const options = {
  plugins: [
    'syntax-dynamic-import',
    '.'
  ]
};
const result = babel.transform(`
  module.exports = [
    {
      path: '/',
      exact: true,
      component: asyncComponent(() => import(/* webpackChunkName: "home" */'./pages/home'))
    },
    {
      path: '/user',
      exact: true,
      component: asyncComponent(() => import(/* webpackChunkName: "user" */'./pages/user'))
    },
    {
      error: () => import(/* webpackChunkName: "user" */'./pages/user')
    }
  ];
`, options);


const json = eval(result.code);

describe('transform()', () => {
  it('Module with ES6 syntax', async () => {
    json[0].should.have.property('component', 'home');
  });
  it('Module with ES5 syntax', async () => {
    json[1].should.have.property('component', 'user');
  });
});
