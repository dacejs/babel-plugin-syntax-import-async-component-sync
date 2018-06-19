# babel-plugin-syntax-import-async-component-sync

一个将 `import()` + `asyncComponent` 异步 react 组件加载转化为同步组件的 babel 语法插件，需要和 `babel-plugin-syntax-dynamic-import` 配合使用。

在 webpack 做前后端同构的工程中，`router.js` 也是同构的，这个文件会在服务器端和浏览器端分别被调用。

为了让前端代码拆分打包，`router.js` 通常会用 `import()` 来做动态加载（其实就是 webpack 的 code-splitting 拆分标示），而为了让拆分的代码（通常是一个页面组件）在渲染前获取到组件初始化的数据，我们会封装一个高阶组件来调用页面组件，同时在高阶组件中完成异步数据获取工作。

这里 `import()` + `asyncComponent` 就存在一个矛盾：
- 浏览器端渲染时希望执行的异步请求和渲染
- 服务器端渲染时希望执行的是同步请求和渲染，只有同步，服务器才能渲染首页网页并将获取的数据拍到 HTML 中，以确保浏览器端的 redux 和服务器端的 redux 保持一致。

为了屏蔽前后端的代码差异，故使用该插件做代码转换
- 浏览器端代码使用 `babel-plugin-syntax-dynamic-import` 转换，让 `webpack` 支持 `import()`
- 服务器端代码使用该插件转换，让 `node` 支持 `import()` 并执行同步操作

## 安装
```
npm i babel-plugin-syntax-import-async-component-sync
```

## 用法

### .babelrc (推荐)
```json
{
  "env": {
    "client": {
      "plugins": [
        "syntax-dynamic-import"
      ]
    },
    "server": {
      "plugins": [
        "syntax-import-async-component-sync"
      ]
    }
  }
}
```

### CLI
```
$ babel --plugins syntax-import-async-component-sync script.js
```

### Node API
```js
require('babel-core').transform('code', {
  plugins: ['syntax-import-async-component-sync']
});
```

## 示例代码
### routes.js 源文件
```js
import App from './layout/App';
import asyncComponent from './components/AsyncComponent';
import NotFoundPage from './pages/NotFoundPage';

export default [
  {
    component: App,
    routes: [
      {
        path: '/',
        exact: true,
        component: asyncComponent(() => import(/* webpackChunkName: "home" */'./pages/HomePage'))
      },
      {
        path: '/users',
        component: asyncComponent(() => import(/* webpackChunkName: "users" */'./pages/UsersListPage'))
      },
      {
        path: '/posts',
        component: asyncComponent(() => import(/* webpackChunkName: "posts" */'./pages/PostsListPage'))
      },
      {
        component: NotFoundPage
      }
    ]
  }
]
```

### 服务器端转换后的代码
```js
import App from './layout/App';
import asyncComponent from './components/AsyncComponent';
import NotFoundPage from './pages/NotFoundPage';

export default [{
  component: App,
  routes: [{
    path: '/',
    exact: true,
    component: function () {
      const component = require('./pages/HomePage');
      return component.default || component;
    }()
  }, {
    path: '/users',
    component: function () {
      const component = require('./pages/UsersListPage');
      return component.default || component;
    }()
  }, {
    path: '/posts',
    component: function () {
      const component = require('./pages/PostsListPage');
      return component.default || component;
    }()
  }, {
    component: NotFoundPage
  }]
}];
```

### 浏览器端转换后的代码
```js
import App from './layout/App';
import asyncComponent from './components/AsyncComponent';
import NotFoundPage from './pages/NotFoundPage';

export default [{
  component: App,
  routes: [{
    path: '/',
    exact: true,
    component: asyncComponent(() => Promise.resolve().then(() => require('./pages/HomePage')))
  }, {
    path: '/users',
    component: asyncComponent(() => Promise.resolve().then(() => require('./pages/UsersListPage')))
  }, {
    path: '/posts',
    component: asyncComponent(() => Promise.resolve().then(() => require('./pages/PostsListPage')))
  }, {
    component: NotFoundPage
  }]
}];
```
