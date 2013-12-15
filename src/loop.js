/*
    √expose
    get: event get
    set: event set, change
    lastest
    array
    
    Reserved: shadow path
    自动装箱 autoboxing，拆箱 unboxing
    $data $watchers $blocks $helpers $path
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

    var guid = 1;

    var tasks = []
    setInterval(function() {
        for (var i = 0; i < tasks.length; i++) {
            tasks[i]()
        }
    }, 50);

    var TYPES = {
        ADD: 'add',
        DELETE: 'delete',
        UPDATE: 'update'
    };

    function watch(data, fn) {
        var id = guid++;
        var shadow = clone(data, true, [id]);

        function task() {
            var result = diff(data, shadow, [id])
            if (result && result.length) {
                fn(result, data, shadow)
                shadow = clone(data, true, [id])
            }
        }

        tasks.push(task)
        return shadow
    }

    function clone(obj, autoboxing, path) { // path: Internal Use Only
        var target = obj.constructor(),
            name, value;

        path = path || []

        if (obj === null || typeof obj != 'object') {
            return obj
        }

        target.$path = path.join('.')

        for (name in obj) {
            value = obj[name]
            // if (/Object|Array/.test(value.constructor.name)) {
            if (value !== undefined) {
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

    function diff(newValue, oldValue, path) {
        var result = result || [];
        path = path || []

        if (typeof newValue !== "object" || typeof oldValue !== "object") {
            if (result.length) return result
        }

        added(newValue, oldValue, path, result)
        removed(newValue, oldValue, path, result)
        updated(newValue, oldValue, path, result)

        /*
            root    完整的数据对象
            context 变化的上下文，这里进行遍历计算以简化 Flush.js 对数据上下文的访问
        */
        function getContext(root, path) {
            var context = root
            for (var index = 1; index < path.length - 1; index++) {
                context = context[path[index]]
            }
            return context
        }

        for (var index = 0, change; index < result.length; index++) {
            change = result[index]
            change.root = newValue
            change.context = getContext(newValue, change.path)
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

            if (value === undefined) continue
            if (oldValue[name] === undefined) continue
            if (value.constructor !== (oldValue[name]).constructor) continue

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
            if (value === undefined && value !== oldValue[name] ||
                value.constructor !== (oldValue[name]).constructor) {
                result.push({
                    type: TYPES.UPDATE,
                    path: path.concat(name),
                    value: value,
                    oldValue: oldValue[name]
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
        watch: watch,
        clone: clone,
        diff: diff,
        added: added,
        removed: removed,
        updated: updated
    }

}));