![Seneca](http://senecajs.org/files/assets/seneca-logo.png)
> A [Seneca.js][] tool to check plugins

# seneca-skeleton
[![Build Status][travis-badge]][travis-url]
[![Gitter][gitter-badge]][gitter-url]

[![js-standard-style][standard-badge]][standard-style]

A Seneca tool to check conformance of plugins with others

- __Version:__ 0.0.1
- __Node:__ 0.10, 0.12, 4

If you are new to Seneca in general, please take a look at [senecajs.org][]. We have everything from tutorials to sample apps to help get you up and running quickly.

If you're using this module, and need help, you can:

- Post a [github issue][],
- Tweet to [@senecajs][],
- Ask on the [Gitter][gitter-url].


## Install
To install, simply use npm. Remember you will need to install [Seneca.js][] if you haven't already.

```sh
npm install -g seneca-check-plugin
```

## Quick Example

Before started, be sure to be in a clean directory.
Running the script will create two directory, `default` and `to-check`

The goal
```bash
seneca-check-plugin <githubUsername/githubRepo>
```

If everything look goods you should see the following message: `everything looks good`

In case of error, it will be described in the command line
What you want do is going inside the `to-check` directory and fix your error

Then, go back in the previous directory and run
```bash
seneca-check-plugin continue
```

Proceed the same way as long as your have error.

Then, it says that your project is good. this is ONLY REGARDING BASIC ATTRIBUTES
**If you change anything to your code, or package.json, please run `npm install` and `npm test` before going further**

## Contributing
The [Senecajs org][] encourages open participation. If you feel you can help in any way, be it with
documentation, examples, extra testing, or new features please get in touch.

## License
Copyright Richard Rodger and other contributors 2015, Licensed under [MIT][].

[travis-badge]: https://travis-ci.org/maxired/seneca-check-plugin.png?branch=master
[travis-url]: https://travis-ci.org/maxired/seneca-check-plugin
[gitter-badge]: https://badges.gitter.im/Join%20Chat.svg
[gitter-url]: https://gitter.im/senecajs/seneca
[standard-badge]: https://raw.githubusercontent.com/feross/standard/master/badge.png
[standard-style]: https://github.com/feross/standard

[MIT]: ./LICENSE
[Senecajs org]: https://github.com/senecajs/
[senecajs.org]: http://senecajs.org/
[Seneca.js]: https://www.npmjs.com/package/seneca
[github issue]: https://github.com/maxired/seneca-check-plugin/issues
[@senecajs]: http://twitter.com/senecajs
