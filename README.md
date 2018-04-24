# generate-ui-tests

[![Travis][build-badge]][build]
[![npm package][npm-badge]][npm]
[![Coveralls][coveralls-badge]][coveralls]

What if one can generate enzyme tests for react which are full blown interaction tests. Like - render component -> get snapshot -> press this -> enter this text here -> add this -> delete this -> get snapshot? Yeah, i think it's possible.

![Alt text](./images/generate_tests_demo.gif?raw=true "Demo gif")

Prerequisites -

Your html elements (div, p, h1 etc.) will need to have a `data-test-id` attribute, or an `id` attribute.
You can use [this](https://github.com/mukeshsoni/codemods) codemod, [https://github.com/mukeshsoni/codemods](https://github.com/mukeshsoni/codemods), to add `data-test-id` attribute to all your html elements inside your jsx. You can modify all your components inside a folder by pointing `jscodeshift` to a folder.
The `data-test-id` attribute can be removed in the production build using this babel plugin - [babel-plugin-remove-data-test-id-attribute](https://github.com/mukeshsoni/babel-plugin-remove-data-test-id-attribute).

Once you have `data-test-id` attribute on every html element, you can wrap the component you want to generate UI tests on in the HOC provided by this component -

```
$ npm install generate-ui-tests -D

OR

$ yarn add generate-ui-tests
```

In the file where you are exporting your Component -

```
import testGenerator from 'generate-ui-tests'

class App extends React.Component {
  //
}

export default testGenerator(App)
```

Or at the place where you are consuming the component -

```
import App from 'path/to/app.js'

const NewApp = testGenerator(App)

//use as
<NewApp {...props} />
//instead of
<App {...props} />
```

That's it. Now you should see a floating yellow header which says "Automated tests for <YOUR_COMPONENT_NAME>". Click on the header to checkout the options to generate tests.

![Alt text](./images/floating_header.png?raw=true "Floating header")

![Alt text](./images/test_viewer_without_tets.png?raw=true "Test Viewer without tests")

Do some activity on your UI. Click 'Get test'. Click 'Copy to clipboard' to copy the test to your clipboard.

Right now, it only generates enzyme tests.

You will probably need to install these to get the generated tests running -

```
$ npm install jest babel-jest enzyme enzyme-adapter-react-16 enzyme-to-json babel-core --save-dev
```

[build-badge]: https://img.shields.io/travis/mukeshsoni/generate-ui-tests/master.png?style=flat-square
[build]: https://travis-ci.org/mukeshsoni/generate-ui-tests
[npm-badge]: https://img.shields.io/npm/v/generate-ui-tests.svg?style=flat-square
[npm]: https://www.npmjs.org/package/generate-ui-tests
[coveralls-badge]: https://img.shields.io/coveralls/mukeshsoni/generate-ui-tests/master.png?style=flat-square
[coveralls]: https://coveralls.io/github/mukeshsoni/generate-ui-tests
