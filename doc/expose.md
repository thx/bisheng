title: UMD - Universal Module Definition
author:
  name: 墨智
  email: mozhi.gyy@alibaba-inc.com
output: expose.html
controls: true

--

# UMD
## Universal Module Definition

<http://bishengjs.com/>
<https://github.com/thx/BiSheng>
<https://github.com/thx/bisheng/blob/master/src/expose.js>

--
### UMD

    expose(id, dependencies, factory, globals)
    expose(id, factory, globals)
    expose(dependencies, factory, globals)
    expose(factory, globals)
    expose(factory)

--
### BiSheng.js

    (function(factory) {
        expose("bisheng", [ "handlebars" ], factory)
    }(
        function factory(Handlebars) {
            var BiSheng = ...
            return BiSheng
        }
    )

--
### CommonJS

    if (typeof module === 'object' && module.exports) {
        module.exports = factory()

--
### AMD

    } else if (typeof define === "function" && define.amd) {
        define(id?, dependencies?, factory)

--
### CMD

    } else if (typeof define === "function" && define.cmd) {
        define(id?, deps?, factory)

--
### KMD

    } else if (typeof KISSY != 'undefined') {
        window.define = function define(id, dependencies, factory) {
            function proxy( /*arguments*/ ) {
                var args = [].slice.call(arguments, 1, arguments.length)
                return factory.apply(window, args)
            }
            KISSY.add(id, proxy, {
                requires: dependencies
            })
        }

--
### Browser globals

    } else {
        // Browser globals
        if (globals) globals()
    }

--
### BiSheng.js

    (function(factory) {
        expose("bisheng", [ "handlebars" ], factory, function() {
            // Browser globals
            window.BiSheng = factory();
        })
    }(function() {
        var BiSheng = ...
        return BiSheng
    })
