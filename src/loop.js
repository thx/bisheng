/*
    参考资料：
    * [melanke/Watch.JS](https://github.com/melanke/Watch.JS)
    * [JavaScript: Object.observe](http://weblog.bocoup.com/javascript-object-observe/)
    * [jdarling/Object.observe](https://github.com/jdarling/Object.observe)
    * [The future of data-binding is Object.observe()](http://addyosmani.com/blog/the-future-of-data-binding-is-object-observe/)
    * <https://github.com/Polymer/observe-js>
    * <https://github.com/jdarling/Object.observe>
    
    TODO
        √expose
        Xget: event get
        Xset: event set, change
        Xlastest
        √array
        √Reserved: shadow path
        √自动装箱 autoboxing，√拆箱 unboxing
        X$data X$watchers √$blocks √$helpers √$path
*/

"use strict";

/* global window: true */
/* global expose */

(function(factory) {

    expose(factory, function() {
        // Browser globals
        window.Loop = factory()
    })

}(function() {
    // BEGIN(BROWSER)

    /*
        # Loop

        属性监听工具。
        Watch the changes of any object or attribute.

        Works with: IE 6+, FF 4+, SF 5+, WebKit, CH 7+, OP 12+, Node.JS

        * Loop.watch(data, fn(changes))
        * Loop.unwatch(unwatch)
        * Loop.clone(clone)
        * Loop.diff(diff)
        * Loop.letMeSee(letMeSee)

    */
    var Loop = (function() {
        var guid = 1;
        var TYPES = {
            ADD: 'add',
            DELETE: 'delete',
            UPDATE: 'update'
        };

        var tasks = []
        tasks.__index = 0
        var timerId;

        function letMeSee() {
            clearTimeout(timerId)
            for (var i = 0; i < tasks.length; i++) {
                tasks[i] && tasks[i]()
            }
            timerId = setTimeout(letMeSee, 50)
        }
        timerId = setTimeout(letMeSee, 50)

        /*
            ## Loop.watch(data, fn(changes))

            为所有属性添加监听函数。
            <!--Attach default handler function to all properties.-->

            * Loop.watch(data, fn(changes))

            **参数的含义和默认值**如下所示：

            * 参数 data：必选。待监听的对象或数组。
            * 参数 fn：必选。监听函数，当属性发生变化时被执行，参数 changes 的格式为：
                
                    [
                        {
                            type: 'add',
                            path: [guid,,],
                            value: newValue
                        },{
                            type: 'delete',
                            path: [guid,,],
                            value: newValue
                        }, {
                            type: 'update',
                            path: [guid,,],
                            value: value,
                            oldValue: oldValue
                        }
                    ]

            **使用示例**如下所示：

                var data = { foo: 'foo' }
                Loop.watch(data, function(changes){
                    console.log(JSON.stringify(changes, null, 4))
                })
                data.foo = 'bar'

                // =>
                [
                    {
                        "type": "update",
                        "path": [
                            6,
                            "foo"
                        ],
                        "value": "bar",
                        "oldValue": "foo",
                        "root": {
                            "foo": "bar"
                        },
                        "context": {
                            "foo": "bar"
                        }
                    }
                ]
        */
        function watch(data, fn, autoboxing, binding) { /* autoboxing: autoboxing, path */
            var id = guid++;
            var shadow = clone(data, autoboxing, [id]);

            function task() {
                var result = diff(data, shadow, autoboxing ? [id] : [], autoboxing)
                if (result && result.length) {
                    fn(result, data, shadow)
                    shadow = clone(data, autoboxing, [id])
                }
            }
            task.data = data
            if (fn && fn.tpl) task.tpl = fn.tpl

            tasks.push(task)

            // TODO 普通静听函数在前，通过 BiSheng.bind() 绑定的监听函数在后。
            // if (binding) tasks.push(task)
            // else tasks.splice(tasks.__index++, 0, task)

            return shadow
        }

        /*
            ### Loop.unwatch(data, fn)

            移除监听函数。

            * Loop.unwatch(data, fn)
                移除对象（或数组） data 上绑定的监听函数 fn。
            * Loop.unwatch(data)
                移除对象（或数组） data 上绑定的所有监听函数。
            * Loop.unwatch(fn)
                全局移除监听函数 fn。

            **参数的含义和默认值**如下所示：

            * 参数 data：可选。待移除监听函数的对象或数组。
            * 参数 fn：可选。待移除的监听函数。

            **使用示例**如下所示：

                var data = { foo: 'foo' }
                Loop.watch(data, function(changes){
                    console.log(JSON.stringify(changes, null, 4))
                })
                data.foo = 'bar'
                // =>
                [
                    {
                        "type": "update",
                        "path": [
                            3,
                            "foo"
                        ],
                        "value": "bar",
                        "oldValue": "foo",
                        "root": {
                            "foo": "bar"
                        },
                        "context": {
                            "foo": "bar"
                        }
                    }
                ]
                
                setTimeout(function(){
                    Loop.unwatch(data)
                    data.foo = 'foo'
                    // => 
                }, 1000)

        */
        function unwatch(data, fn) {

            function remove(compare) {
                for (var index = 0; index < tasks.length; index++) {
                    if (compare(tasks[index])) {
                        if (index < tasks.__index) tasks.__index--
                        tasks.splice(index--, 1)
                    }
                }
            }

            // Loop.unwatch(data, fn)
            if (typeof fn === 'function') {
                remove(function(task) {
                    return task === fn && task.data === data
                })
            }

            // Loop.unwatch(fn)
            if (typeof data === 'function') {
                remove(function(task) {
                    return task === fn
                })
            }

            // Loop.unwatch(data)
            if (data !== undefined) {
                remove(function(task) {
                    return task.data === data
                })
            }

            // throw new Error('wrong arguments')
        }

        /*
            ### Loop.clone(obj, autoboxing)

            深度复制对象或数组。

            * Loop.clone(obj, autoboxing)

            **参数的含义和默认值**如下所示：

            * 参数 obj：必选。待复制的对象或数组。
            * 参数 autoboxing：可选。布尔值，指示是否把基本类型（Primitive Values）自动装箱，使得可以在其上扩展属性。装箱过程通过 `new Object(value)` 实现。该参数的默认值为 false，即默认不会自动装箱。

            **使用示例**如下所示：

                var data = {
                    foo: 'foo'
                }
                var unboxing = Loop.clone(data)
                var autoboxing = Loop.clone(data, true)

                console.log(JSON.stringify(unboxing, null, 4))
                // =>
                {
                    "foo": "foo"
                }

                console.dir(autoboxing)
                // =>
                {
                    "$path": "",
                    "foo": String {
                        0: "f",
                        1: "o",
                        2: "o",
                        $path: "foo",
                        length: 3
                    }
                }
        */
        function clone(obj, autoboxing, path) { // path: Internal Use Only
            var target = obj.constructor(),
                name, value;

            path = path || []

            if (obj === null || typeof obj != 'object') {
                return obj
            }

            if (autoboxing) target.$path = path.join('.')

            for (name in obj) {
                value = obj[name]
                // if (/Object|Array/.test(value.constructor.name)) {
                if (value !== undefined && value !== null) {
                    if (value.constructor === Object || value.constructor === Array) {
                        value = clone(value, autoboxing, path.concat(name))
                    } else {
                        if (autoboxing) {
                            value = new Object(value)
                            value.$path = path.concat(name).join('.')
                        }
                    }
                }
                target[name] = value
            }

            return target
        }

        /*
            ### Loop.diff(newObject, oldObject)

            比较两个对象或数组的差异。

            * Loop.diff(newObject, oldObject)

            **参数的含义和默认值**如下所示：

            * 参数 newObject：必选。待比较的对象或数组。
            * 参数 oldObject：必选。待比较的对象或数组。

            所谓的**差异包括**：

            1. newObject 比 oldObject 多出的属性。
            2. newObject 比 oldObject 少了的属性。
            3. newObject 比 oldObject 变化了的属性。

            **返回值的格式**为：

                [
                    {
                        type: 'add',
                        path: [guid,,],
                        value: newValue
                    },{
                        type: 'delete',
                        path: [guid,,],
                        value: newValue
                    }, {
                        type: 'update',
                        path: [guid,,],
                        value: value,
                        oldValue: oldValue
                    }
                ]

            **使用示例**如下所示：

                var newObject = {
                    add: 'added property',
                    update: 'bar'
                }
                var oldObject = {
                    update: 'foo',
                    deleted: 'deleted property'
                }
                var changes = Loop.diff(newObject, oldObject)
                console.log(JSON.stringify(changes, null, 4))
                // =>
                [
                    {
                        "type": "add",
                        "path": [
                            "add"
                        ],
                        "value": "added property"
                    },
                    {
                        "type": "delete",
                        "path": [
                            "deleted"
                        ],
                        "value": "deleted property"
                    },
                    {
                        "type": "update",
                        "path": [
                            "update"
                        ],
                        "value": "bar",
                        "oldValue": "foo"
                    }
                ]
        */
        function diff(newObject, oldObject, path, fix) {
            var result = result || [];
            path = path || []

            if (typeof newObject !== "object" || typeof oldObject !== "object") {
                if (result.length) return result
            }

            added(newObject, oldObject, path, result)
            removed(newObject, oldObject, path, result)
            updated(newObject, oldObject, path, result)

            /*
            root    完整的数据对象
            context 变化的上下文，这里进行遍历计算以简化 Flush.js 对数据上下文的访问
            */
            function getContext(root, path) {
                return function() {
                    var context = root
                    for (var index = 1; index < path.length - 1; index++) {
                        context = context[path[index]]
                    }
                    return context
                }
            }

            if (fix) {
                for (var index = 0, change; index < result.length; index++) {
                    change = result[index]
                    change.root = newObject
                    change.context = getContext(newObject, change.path)()
                    change.getContext = getContext
                }
            }

            if (result.length) return result
        }

        // 获取 newValue 比 oldValue 多出的属性
        function added(newValue, oldValue, path, result, type) { // type: Internal Use Only
            var name, value;

            for (name in newValue) {
                if (/\$guid|\$path|\$blocks|\$helpers/.test(name)) continue

                value = newValue[name]

                if (!(name in oldValue)) {
                    result.push({
                        type: type || TYPES.ADD,
                        path: path.concat(name),
                        value: newValue[name]
                    })
                    continue
                }

                if (value === undefined ||
                    value === null ||
                    oldValue[name] === undefined ||
                    oldValue[name] === null ||
                    value.constructor !== (oldValue[name]).constructor) {
                    continue
                }

                // IE 不支持 constructor.name
                // /Object|Array/.test(value.constructor.name)
                // http://stackoverflow.com/questions/332422/how-do-i-get-the-name-of-an-objects-type-in-javascript
                if (value.constructor === Object || value.constructor === Array) {
                    added(value, oldValue[name], path.concat(name), result, type)
                }
            }

            if (result.length) return result
        }

        // 获取 newValue 比 oldValue 少了的属性
        function removed(newValue, oldValue, path, result) {
            return added(oldValue, newValue, path, result, TYPES.DELETE)
        }

        // 获取 newValue 比 oldValue 变化了的属性
        function updated(newValue, oldValue, path, result) {
            var name, value;

            for (name in newValue) {
                if (/\$guid|\$path|\$blocks|\$helpers/.test(name)) continue

                value = newValue[name]

                if (!(name in oldValue)) continue
                if (value === undefined && oldValue[name] === undefined) continue

                if (value === undefined ||
                    value === null ||
                    oldValue[name] === undefined ||
                    oldValue[name] === null ||
                    value.constructor !== (oldValue[name]).constructor) {
                    result.push({
                        type: TYPES.UPDATE,
                        path: path.concat(name),
                        value: value,
                        oldValue: oldValue[name] !== undefined ? oldValue[name].valueOf() : oldValue[name]
                    })
                    continue
                }

                // if (/Object|Array/.test(value.constructor.name)) {
                if (value.constructor === Object || value.constructor === Array) {
                    updated(value, oldValue[name], path.concat(name), result)
                    continue
                }

                if (value.valueOf() !== (oldValue[name]).valueOf()) {
                    result.push({
                        type: TYPES.UPDATE,
                        path: path.concat(name),
                        value: value,
                        oldValue: oldValue[name]
                    })
                }
            }

            if (result.length) return result
        }

        // expose
        return {
            tasks: tasks,
            TYPES: TYPES,
            watch: watch,
            unwatch: unwatch,
            clone: clone,
            diff: diff,
            letMeSee: letMeSee
        }
    })()

    // END(BROWSER)

    return Loop

}));