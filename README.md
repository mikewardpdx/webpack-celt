# Creative Exchange With Webpack
This custom webpack plugin is meant as a replacement for the Gulp-based [@sxa/celt](https://sitecore.myget.org/feed/sc-npm-packages/package/npm/@sxa/celt).

The webpack plugin utilizes the same Sitecore Powershell-powered API endpoints, but reduces complexity and dovetails into prototyping tools, such as [Storybook](https://storybook.js.org/).

Setup is largely the same as the with `@sxa/celt`.

**Note:** this package is meant for Sitcore SXA 9.3+ as it utilizes the `pre-optimized.min.**` files for CSS and JS.

## Theme File Structure
The folder structure is largely up to the development team, but a popular convention is as follows:
```
theme/
|───-/scriban/
|   |───Promo/
|       |───Default/
|           |  default.scriban
|───plugins/
|   |   Uploader.js
|───src/
|   |───scripts/
|   |      some-component.js
|   |      ...
|   |───styles/
|   |      index.scss
|   entry.js
|   package.json
|   serverOptions.json
|   webpack.config.js
```

## Example entry.js
```js
import './src/styles/index.scss'; // single entry point
import './src/scripts/some-component.js';
```

## Example package.json
```json
{
  ...
  "scripts": {
    "build": "webpack -p"
  },
  "devDependencies": {
    "@babel/core": "^7.10.2",
    "@babel/preset-env": "^7.10.2",
    "axios": "^0.19.2",
    "babel-loader": "^8.1.0",
    "babel-preset-vue": "^2.0.2",
    "css-loader": "^3.5.3",
    "glob": "^7.1.6",
    "mini-css-extract-plugin": "^0.9.0",
    "node-sass": "^4.14.1",
    "sass-loader": "^8.0.2",
    "style-loader": "^1.2.1",
    "webpack": "^4.43.0",
    "webpack-cli": "^3.3.11"
  }
}
```

## Example serverOptions.json
```json
{
  "server": "http://localhost:44001",
  "themePath": "\\Themes\\Your tenant folder\\Your site folder\\Your theme",
  "siteMetadata": {
    "siteId": "{EC8BB75C-169A-4CE6-983A-BB48ED77BE4C}",
    "database": "master"
  },
  "user": "sitecore\\admin",
  "password": "b",
  "assets": [
    {
      "src": "./dist/pre-optimized-min.css",
      "path": "styles"
    },
    {
      "src": "./dist/pre-optimized-min.js",
      "path": "Scripts"
    }
  ]
}
```

## Example webpack.config.js
```js
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const Uploader = require('./plugins/Uploader'); // Where the magic happens

module.exports = {
  entry: './entry.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'pre-optimized-min.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
      	exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: { presets: ['@babel/preset-env'] }
        }
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ]
      }
    ]
  },
  stats: {
    modules: false
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'pre-optimized-min.css',
    }),
    new Uploader()
  ]
};
```

## Coming Soon...
- Documentation will be expanded after further testing
- This plugin will be created as an npm module for easier installation
