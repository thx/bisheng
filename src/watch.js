/*
    [melanke/Watch.JS](https://github.com/melanke/Watch.JS)
    [JavaScript: Object.observe](http://weblog.bocoup.com/javascript-object-observe/)
    [jdarling/Object.observe](https://github.com/jdarling/Object.observe)
    [The future of data-binding is Object.observe()](http://addyosmani.com/blog/the-future-of-data-binding-is-object-observe/)
    https://github.com/Polymer/observe-js
    https://github.com/jdarling/Object.observe

    操作类型：
    * get
    * set
    * change

    TODO：
    * add
    * update
    * delete
*/

"use strict";

/* global define */
/* global window */
/* global $:true */
/* global KISSY */

// CommonJS
if (typeof module === 'object' && module.exports) {
    var $ = require('jquery')
}

(function(factory) {
    if (typeof module === 'object' && module.exports) {
        // CommonJS
        module.exports = factory()

    } else if (typeof define === "function" && define.amd) {
        // AMD modules
        define(factory)

    } else if (typeof define === "function" && define.cmd) {
        // CMD modules
        define(factory)

    } else if (typeof KISSY != 'undefined') {
        // For KISSY
        ['watch'].forEach(function(name, index) {
            KISSY.add(name, function(S) {
                return factory()
            }, {
                requires: []
            })
        })

    } else {
        // Browser globals
        window.Watch = factory()
        window.watch = window.Watch.watch
        window.unwatch = window.Watch.unwatch
    }

}(function() {

    var guid = 1;

    var Util = {
        expando: $.expando,
        extend: function() {
            var args = [].slice.call(arguments, 0)
            return $.extend.apply(this, [true].concat(args))
        },
        each: $.each,
        isPlainObject: $.isPlainObject,
        isArray: $.isArray
    };

    Util.clone = function clone(obj) {
        if (obj === null || typeof obj != 'object') {
            return obj;
        }

        var copy = obj.constructor();

        for (var attr in obj) {
            copy[attr] = obj[attr];
        }

        return copy;
    }

    Util.diff = function diff(newValue, oldValue, path) {
        define.defining.push(true) // 暂停事件

        var added = [],
            removed = [],
            updated = [];

        if (typeof newValue !== "object" || typeof oldValue !== "object") return

        // added：获取 newValue 比 oldValue 多出的属性
        Util.each(newValue, function(index, item) {
            // TODO hasOwnProperty
            if (item !== undefined && oldValue[index] === undefined) {
                added.push(path.concat([index]))
            }
        })
        // removed：获取 newValue 比 oldValue 少了的属性
        Util.each(oldValue, function(index, item) {
            if (item !== undefined && newValue[index] === undefined) {
                removed.push(path.concat([index]))
            }
        })
        // updated：获取 newValue 比 oldValue 变化了的属性
        Util.each(newValue, function(index, item) {
            if (item !== oldValue[index]) {
                updated.push(path.concat([index]))
            }
        })

        define.defining.pop() // 恢复事件

        return {
            added: added,
            removed: removed,
            updated: updated
        }
    }

    Util.format = function() {
        var string = arguments[0]
        var args = [].slice.call(arguments, 1)
        if (args.length === 0) return string
        return string.replace(/{(\d+)?}/g, function($0, $1) {
            return args[parseInt($1)] + ''
        });
    }

    /*
        ### Watch.define(data, options, trigger, forever)

        添加默认监听器。
        Attach default handler function to all properties.

        * define(data)
        * define(data, trigger, forever)
        * define(data, options, trigger, forever)
        
        参数的含义和默认值如下所示：

        * 参数 data：必选。待监听的对象或数组。
        * 参数 options：可选。预留的参数名，尚未考虑好如何使用。
        * 参数 trigger：可选。可选值为布尔值 true 或 false，指示是否立即触发一次监听函数。
        * 参数 forever：可选。可选值为布尔值 true 或 false，指示是否监听新增属性。

        使用示例如下所示：

    */
    function define(data) { /*  , options, trigger, forever */
        /*if (typeof options === 'boolean') {
            forever = trigger
            trigger = options
        }*/

        var orig = Util.extend(data instanceof Array ? [] : {}, data);
        var defined = data;

        defined = defineProperties(data, [guid++])
        defined.$data = orig

        if (define.flush) define.flush(data)

        /*if (trigger) Util.extend(defined, orig)

        if (forever) setInterval(function() {
            defineProperties(defined)
        }, 50)*/

        return defined
    }

    // 是否是 DEBUG 模式
    define.debug = false
    // 调用栈，用于控制事件的触发
    define.defining = []
    // Hooks for Setter & Getter
    define.hook = {}

    /*
        记录 path, value, root
        触发事件
        插入 hook
    */
    define.getset = function getset(path, value, root) {
        return {
            set: function(newValue) {
                var oldValue = value
                value = newValue

                // 修正属性值
                if (define.hook && 'set' in define.hook) {
                    var re = define.hook.set(root, path, newValue, oldValue)
                    if (re !== undefined) value = re
                }

                // 定义可能新增的属性
                if (typeof value === 'object') defineProperties(value, path, root)

                // 触发 set 和 change 事件
                if (!define.defining.length) {
                    trigger('set', root, path, newValue, oldValue)
                    newValue !== oldValue &&
                        trigger('change', root, path, newValue, oldValue)
                }

                // 同步原始数据
                var context = root.$data
                for (var index = 1; index < path.length - 1; index++) {
                    context = context[path[index]]
                }
                define.defining.push(true) // 暂停事件
                if (value instanceof Array) context[path[index]] = Util.extend([], value)
                else if (typeof value === 'object') context[path[index]] = Util.extend({}, value)
                else if (context) context[path[index]] = value
                define.defining.pop() // 恢复事件
            },
            get: function() {
                // 触发 get 事件
                if (!define.defining.length) {
                    trigger('get', root, path, value)
                }

                // 修正属性值
                if (define.hook && 'get' in define.hook) {
                    var re = define.hook.get(root, path, value)
                    if (re !== undefined) return re
                }

                return value
            }
        }
    }

    /*
        递归定义属性的 Getter 和 Setter
    */
    function defineProperties(data, path, root) {
        define.defining.push(true) // 暂停事件

        path = path || []
        root = root || data

        // 只在根节点上绑定保留属性
        if (path.length === 1) defineReservedProperties(data)
        data.$path = path

        if (data instanceof Array) {
            defineArrayProperties(data, path, root)
        } else {
            if (typeof data === 'object') {
                defineObjectProperties(data, path, root)
            }
        }

        define.defining.pop() // 恢复事件

        return data
    }

    function defineObjectProperties(data, path, root) {
        var props = {}, key, value
        for (key in data) {
            if (key === '$path') continue

            value = data[key]
            defineReservedProperties(value, ['$path'])
            if (value !== undefined) value.$path = path.concat(key)
            // 直接属性
            props[key] = define.getset(path.concat([key]), value, root)
            // 深度遍历
            defineProperties(value, path.concat([key]), root)
        }
        Object.defineProperties(data, props)
    }

    function defineArrayProperties(array, path, root) {
        var props = {}, index, value
        for (index = 0; index < array.length; index++) {
            value = array[index]
            value.$path = path.concat(index)
            // 直接属性
            props[index] = define.getset(path.concat([index]), value, root)
            // 深度遍历
            defineProperties(value, path.concat([index]), root)
        }
        defineArrayMethods(array, path, root)
        Object.defineProperties(array, props)
    }

    /*
        定义保留属性为：不可枚举
    */
    function defineReservedProperties(data, props) {
        if (typeof data !== 'object' && typeof data !== 'function') return

        (props || [Util.expando, '$id', '$guid', '$data', '$watchers', '$blocks', '$path'])
            .forEach(function(prop, index) {
                Object.defineProperty(data, prop, {
                    configurable: true,
                    enumerable: false,
                    writable: true
                })
            })
    }

    /*
        定义数组方法
    */
    function defineArrayMethods(array, path, root) {
        ['pop', 'push', 'reverse', 'shift', 'sort', 'slice', 'unshift'].forEach(function(methodName) {
            // 备份原生方法
            var originalMethod = '__$' + methodName
            array[originalMethod] = array[originalMethod] || array[methodName]
            Object.defineProperty(array, originalMethod, {
                enumerable: false,
                configurable: true,
                writable: true
            })

            // 覆盖原生方法
            Object.defineProperty(array, methodName, {
                enumerable: false,
                configurable: true,
                writable: false,
                value: function() {
                    define.defining.push(true) // 暂停事件

                    var prev = Util.extend([], array)
                    var response = array[originalMethod].apply(array, arguments)

                    var diff = Util.diff(array, prev, path)
                    if (diff.added.length) defineProperties(array, path, root)

                    define.defining.pop() // 恢复事件

                    /*
                        TODO
                        callWatchers(obj, prop, methodName, arguments);
                        要不要在 path 中加入方法名？
                        事件 add delete 的参数不全
                        如何利用 add delete 事件
                    */
                    if (diff.added.length) trigger('add', root, path, diff.added) // TODO
                    if (diff.removed.length) trigger('delete', root, path, diff.removed) // TODO
                    if (diff.added.length || diff.removed.length) trigger('change', root, path, array, prev)

                    return response
                }
            })
        })
    }

    // 与 jQuery 事件系统的参数保持一致
    function trigger(type, root, path, value, oldValue) {
        if (define.defining.length) return

        var context = root
        define.defining.push(true) // 暂停事件
        for (var index = 1; index < path.length - 1; index++) {
            context = context[path[index]]
        }
        define.defining.pop() // 恢复事件

        var event = {
            type: type
        }

        var data = {
            type: type,
            root: root,
            context: context,
            path: path,
            value: value,
            oldValue: oldValue
        }

        if (define.debug) Watch.log(event, data)

        // 触发自定义事件
        var watchers = (root.$watchers || {})[type] || [] // path.join('.')
        watchers.forEach(function(watcher) {
            if (!define.defining.length) watcher.handler.apply(root, [event, data])
        })

        // 触发 jQuery 自定义事件 http://api.jquery.com/trigger/
        define.defining.push(true)
        $(root).trigger(event, data)
        define.defining.pop()

        return root
    }

    /*
        添加自定义监听器
        watch(data, fn(event))
        watch(data, type, fn(event))
        watch(data, [type[, type]], fn(event))
        watch(data, map)

        TODO watch(data, [prop], fn)
        TODO 绑定 jQuery 自定义事件
    */
    function watch(data, types, fn) {
        if (arguments.length === 2) {
            types = ['']
        }
        if (!(types instanceof Array)) {
            types = [types]
        }

        // 定义参数 data 的属性，开始监听 get 和 set 事件
        if (!('$watchers' in data)) define(data)

        /*
            绑定自定义事件
            事件的数据结构为：
            {
                $watchers: {
                    type: [ handleObj, handleObj, ... ],
                    type: [ handleObj, handleObj, ... ],
                    ...
                }
            }
         */
        types.forEach(function(type, index) {
            data.$watchers = data.$watchers || {}
            data.$watchers[type] = data.$watchers[type] || []

            data.$watchers[type].push({
                type: type,
                handler: fn
            })
        })

        // 这里不应该绑定 jQuery 自定义事件，而是应该由用户明确地绑定
        /*types.forEach(function(type, index) {
            $(data).on(type, fn)
        })*/
    }

    // TODO
    function watchOperation(data, operations, fn) {

    }

    // TODO
    /*
        watchProperty(data, property, fn)
        watchProperty(data, properties, fn)
        watchProperty(data, fn)
        watchProperty(data, map)
    */
    function watchProperty(data, properties, fn) {
        var map = {}

        if (arguments.length === 2) {
            // watchProperty(data, fn)
            if (typeof arguments[1] === 'function') map['*'] = arguments[1]
            // watchProperty(data, map)
            else map = arguments[1]
        }
        if (arguments.length === 3) {
            if (!(properties instanceof Array)) {
                properties = [properties]
            }
            properties.forEach(function(prop, index) {
                map[prop] = fn
            })
        }

        watch(data, ['get', 'set', 'change'], function(event, data) {
            var fn = map[data.path.join('.')]
            if (fn) fn.apply(data, [event, data])
        })
    }

    /*
     
    */
    function unwatch(defined) {
        defined.$watchers = {}
    }

    // expose
    // TODO 是否封装为链式语法
    function Watch() {}
    Watch.Util = Util
    Watch.define = define
    Watch.on = Watch.watch = watch
    Watch.off = Watch.unwatch = unwatch
    Watch.watchOperation = watchOperation
    Watch.watchProperty = watchProperty

    Watch.stop = function() {
        define.defining.push(true)
    }
    Watch.resume = function() {
        define.defining.pop()
    }
    /*
        格式化输出
        get set add delete change
    */
    Watch.log = function(event, data) {
        define.defining.push(true)

        event.type === 'get' && console.log('GET    [ ' + data.path.join('.') + ' ]',
            JSON.stringify(data.value)
        )
        event.type === 'set' && console.log(
            'SET    [ ' + data.path.join('.') + ' ]',
            JSON.stringify(data.value), '<=', JSON.stringify(data.oldValue)
        )
        event.type === 'change' && console.log(
            'CHANGE [ ' + data.path.join('.') + ' ]',
            JSON.stringify(data.value), '<=', JSON.stringify(data.oldValue)
        )

        define.defining.pop()
    }

    return Watch
}));