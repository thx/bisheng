/*! BiSheng.js 2014-05-15 07:30:51 PM CST */
/*! src/fix/prefix-1.js */
(function(factory) {
    /*! src/expose.js */
    /*
        # expose(factory, globals)

        模块化，适配主流加载器。
        Modular

        * expose(id, dependencies, factory, globals)
        * expose(id, factory, globals)
        * expose(dependencies, factory, globals)
        * expose(factory, globals)
        * expose(factory)
    */
    function expose(id, dependencies, factory, globals) {
        var argsLen = arguments.length;
        var args = [];
        switch (argsLen) {
          case 1:
            // expose(factory)
            factory = id;
            id = dependencies = globals = undefined;
            break;

          case 2:
            // expose(factory, globals)
            factory = id;
            globals = dependencies;
            id = dependencies = undefined;
            break;

          case 3:
            globals = factory;
            factory = dependencies;
            if (id instanceof Array) {
                // expose(dependencies, factory, globals)
                dependencies = id;
                id = undefined;
            } else {
                // expose(id, factory, globals)
                dependencies = undefined;
            }
            break;

          default:        }
        if (typeof module === "object" && module.exports) {
            // CommonJS
            module.exports = factory();
        } else if (typeof define === "function" && define.amd) {
            // AMD modules
            // define(id?, dependencies?, factory);
            // https://github.com/amdjs/amdjs-api/wiki/AMD
            if (id !== undefined) args.push(id);
            if (dependencies !== undefined) args.push(dependencies);
            args.push(factory);
            define.apply(window, args);
        } else if (typeof define === "function" && define.cmd) {
            // CMD modules
            // define(id?, deps?, factory)
            // https://github.com/seajs/seajs/issues/242
            if (id !== undefined) args.push(id);
            if (dependencies !== undefined) args.push(dependencies);
            args.push(factory);
            define.apply(window, args);
        } else if (typeof KISSY != "undefined") {
            // For KISSY 1.4
            // http://docs.kissyui.com/1.4/docs/html/guideline/kmd.html
            if (!window.define) {
                window.define = function define(id, dependencies, factory) {
                    // KISSY.add(name?, factory?, deps)
                    function proxy() {
                        var args = [].slice.call(arguments, 1, arguments.length);
                        return factory.apply(window, args);
                    }
                    switch (arguments.length) {
                      case 2:
                        // KISSY.add(factory, deps)
                        factory = dependencies;
                        dependencies = id;
                        KISSY.add(proxy, {
                            requires: dependencies.concat([ "node" ])
                        });
                        break;

                      case 3:
                        // KISSY.add(name?, factory, deps)
                        KISSY.add(id, proxy, {
                            requires: dependencies.concat([ "node" ])
                        });
                        break;
                    }
                };
                window.define.kmd = {};
            }
            define(id, dependencies, factory);
        } else {
            // Browser globals
            if (globals) globals();
        }
    }
    /*! src/fix/prefix-2.js */
    expose("bisheng", [ "handlebars" ], factory, function() {
        // Browser globals
        window.BiSheng = factory();
    });
})(function() {
    /*! src/jqLite.js */
    var jqLite;
    if (window.KISSY) {
        jqLite = KISSY.all;
        var constructor = KISSY.all().constructor;
        var prototype = constructor.prototype;
        /*
            扩展原则：
            1. 如果在 KISSY 中不存在，则直接扩展方法
            2. 如果只是行为不同，则定义一个以下划线开头的同名方法。
            3. 最小扩展集。

            TODO 尚有些混乱，部分是为让测试用例通过而扩展的。
        */
        if (!prototype.splice) {
            prototype.splice = [].splice;
        }
        if (!jqLite.trim) {
            jqLite.trim = KISSY.trim;
        }
        if (!jqLite.each) {
            jqLite._each = KISSY.each;
        }
        if (!prototype.find) {
            prototype.find = prototype.all;
        }
        if (!prototype.eq) {
            prototype.eq = prototype.item;
        }
        if (!prototype.get) {
            prototype.get = function get(num) {
                return num === undefined ? [].slice.call(this) : num < 0 ? this[this.length + num] : this[num];
            };
        }
        /*
            KISSY 1.4 不支持 .map(callback, context)
         */
        if (!prototype.map) {
            prototype.map = function map(callback, context) {
                var self = this;
                var result = KISSY.map(self, function(node, index) {
                    node = KISSY.all(node);
                    return callback.call(context || node, node, index, self);
                });
                return KISSY.all(result);
            };
        }
        /*
            KISSY 1.4 不支持 .toArray()
        */
        if (!prototype.toArray) {
            prototype.toArray = function toArray() {
                return [].slice.call(this);
            };
        }
        /*
            KISSY 1.4 不支持 .replaceAll( target )
            * .replaceWith( newContent )
                当前内容.replaceWith( 新内容 )
            * .replaceAll( target )
                新内容.replaceAll( 当前内容 )
        */
        if (!prototype.replaceAll) {
            prototype.replaceAll = function replaceAll(target) {
                var newContent = this;
                KISSY.all(target).each(function(node, index) {
                    KISSY.all(node).replaceWith(index === 0 ? newContent : newContent.clone(true));
                });
                return this;
            };
        }
        // 手动触发事件
        if (!prototype.trigger) {
            prototype.trigger = prototype.fire;
        }
        // 扩展便捷事件方法 .hover(fnOver, fnOut)
        if (!prototype.hover) {
            prototype.hover = function hover(fnOver, fnOut) {
                return this.on("mouseenter", fnOver).on("mouseleave", fnOut || fnOver);
            };
        }
        // KISSY.all().constructor.prototype.each 会把参数 childNode 再次封装为 NodeList
        prototype._each = function _each(callback, context) {
            return this.each(function(node, index, self) {
                if (!node.nodeType && node.length && node[0].nodeType) node = node[0];
                callback.call(this, node, index, self);
            }, context);
        };
        /*
            兼容 KISSY 和 jQuery 的 .filter() 方法
            * jQuery
                * .filter( selector )
                * .filter( function(index) )
                    A function used as a test for each element in the set. this is the current DOM element.
                * .filter( element )
                * .filter( jQuery object )
            * KISSY
                * Array<HTMLElement> filter ( selector , filter [,context=document] )
                * .filter( function(element) )
                    this 是 KISSY
        */
        prototype._filter = function _filter(callback) {
            // 干！文档中没有说明 .filter() 的回调函数有这么多参数！
            if (typeof callback === "function") {
                return this.filter(function(element, index, array) {
                    // 修正上下文 this 为当前元素（默认是 KISSY）
                    return callback.call(element, element, index, array);
                });
            }
            return this.filter.apply(this, arguments);
        };
        /*
            KISSY 1.4 .attr(name, value) 不支持函数作为属性值。
        */
        prototype._attr = function attr(name, value) {
            if (value === undefined) return this.attr(name);
            return this.each(function(elem, index) {
                if (typeof value === "function") {
                    value = value.call(elem, index, elem.attr(name));
                }
                elem.attr(name, value);
            });
        };
    } else if (window.jQuery) {
        // jQuery.each(obj, callback(key, value))
        // jQuery._each(obj, callback(value, key))
        jQuery._each = function _each(obj, callback, args) {
            if (args) return jQuery.each(obj, callback, args);
            return jQuery.each(obj, function(key, value, obj) {
                // 交换 key、value 的位置，使之符合标准
                callback.call(this, value, key, obj);
            }, args);
        };
        jQuery.fn._each = function _each(callback, args) {
            return jQuery._each(this, callback, args);
        };
        jQuery.fn._filter = function _filter(callback) {
            return this.filter(function(index, element, array) {
                // 交换 index、element 的位置，使之符合标准
                return callback.call(element, element, index, array);
            });
        };
        jQuery.fn._attr = jQuery.fn.attr;
        jqLite = jQuery;
    } else if (window.Zepto) {
        Zepto._each = function _each(obj, callback) {
            return Zepto.each(obj, function(key, value) {
                if (!value.nodeType && value.length && value[0].nodeType) {
                    Zepto._each(value, callback);
                } else {
                    callback.call(this, value, key);
                }
            });
        };
        Zepto.fn._each = function _each(callback) {
            return Zepto._each(this, callback);
        };
        Zepto.fn._filter = function _filter(callback) {
            return this.filter(function(index, element, array) {
                // Zepto.each 方法不支持第二个参数 element
                element = element || this;
                // 交换 index、element 的位置，使之符合标准
                return callback.call(element, element, index, array);
            });
        };
        Zepto.fn._attr = Zepto.fn.attr;
        Zepto.fn.splice = [].splice;
        Zepto.fn.replaceAll = function replaceAll(target) {
            /*jshint -W064 */
            return Zepto(target).replaceWith(this);
        };
        // 在 Zepto 中 data 方法使用 DOM 元素的属性来存储
        // 所以对于 name 需要替换空格
        Zepto.fn._data = Zepto.fn.data;
        Zepto.fn.data = function(name, value) {
            name = name.replace(/\s/g, "-");
            return Zepto.fn._data.call(this, name, value);
        };
        // 扩展 Zepto 支持克隆节点时克隆事件到新克隆的元素上
        Zepto.cache = {};
        Zepto.fn._on = Zepto.fn.on;
        Zepto.fn.on = function(event, selector, data, callback, one) {
            Zepto.fn._on.apply(this, arguments);
            this.each(function(idx, elem) {
                var cache = Zepto.cache[elem._zid] = Zepto.cache[elem._zid] || {};
                var events = event.split(/\s/);
                Zepto.each(events, function(idx, type) {
                    cache[type] = cache[type] || [];
                    cache[type].push({
                        event: type,
                        selector: selector,
                        data: data,
                        callback: callback,
                        one: one
                    });
                });
            });
            return this;
        };
        Zepto.fn._off = Zepto.fn.off;
        Zepto.fn.off = function(event, selector, callback) {
            Zepto.fn._off.apply(this, arguments);
            this.each(function(idx, elem) {
                var cache = Zepto.cache[elem._zid];
                var events = event.split(/\s/);
                if (!cache) {
                    return;
                }
                Zepto.each(events, function(idx, type) {
                    // 删除所有处理函数
                    delete cache[type];
                });
            });
            return this;
        };
        // 在 HTMLElement.cloneNode 方法上注入克隆事件功能
        HTMLElement.prototype._cloneNode = HTMLElement.prototype.cloneNode;
        HTMLElement.prototype.cloneNode = function() {
            var cloneElement = HTMLElement.prototype._cloneNode.call(this, arguments);
            // clone event
            cloneEvent(this, cloneElement);
            /**
             * @param origin
             * @param target
             */
            function cloneEvent(origin, target) {
                /*jshint -W064 */
                Zepto(origin).children().each(function(idx, element) {
                    // clone event
                    if (typeof this._zid === "number") {
                        /*jshint -W064 */
                        var cloneChildren = Zepto(target).children().eq(idx);
                        var events = Zepto.cache[this._zid];
                        Zepto.each(events, function(type, handlers) {
                            Zepto.each(handlers, function(idx, handler) {
                                /*jshint -W064 */
                                Zepto(cloneChildren).on(handler.event, handler.selector, handler.data, handler.callback, handler.one);
                            });
                        });
                    }
                    // clone children event
                    /*jshint -W064 */
                    if (Zepto(element).children().length) {
                        /*jshint -W064 */
                        cloneEvent(element, Zepto(target).children().eq(idx)[0]);
                    }
                });
            }
            return cloneElement;
        };
        jqLite = Zepto;
    }
    /*! src/loop.js */
    // 运行模式
    var AUTO = false;
    function auto(bool) {
        if (bool === undefined) return AUTO;
        AUTO = !!bool;
        if (AUTO) timerId = setTimeout(letMeSee, 50); else clearTimeout(timerId);
    }
    // 执行任务
    var tasks = [];
    var timerId;
    tasks.__index = 0;
    // TODO 记录双向绑定任务的插入位置
    function letMeSee() {
        clearTimeout(timerId);
        for (var i = 0; i < tasks.length; i++) {
            tasks[i] && tasks[i]();
        }
        if (AUTO) timerId = setTimeout(letMeSee, 50);
    }
    if (AUTO) timerId = setTimeout(letMeSee, 50);
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
    var Loop = function() {
        var guid = 1;
        var TYPES = {
            ADD: "add",
            DELETE: "delete",
            UPDATE: "update"
        };
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
        function watch(data, fn, autoboxing, binding) {
            /* autoboxing: autoboxing, path */
            var id = guid++;
            var shadow = clone(data, autoboxing, [ id ]);
            function task() {
                var result = diff(data, shadow, autoboxing ? [ id ] : [], autoboxing);
                if (result && result.length) {
                    fn(result, data, shadow);
                    shadow = clone(data, autoboxing, [ id ]);
                }
            }
            task.data = data;
            task.callback = fn;
            if (fn && fn.tpl) task.tpl = fn.tpl;
            tasks.push(task);
            // TODO 普通静听函数在前，通过 BiSheng.bind() 绑定的监听函数在后。
            // if (binding) tasks.push(task)
            // else tasks.splice(tasks.__index++, 0, task)
            return shadow;
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
                        if (index < tasks.__index) tasks.__index--;
                        tasks.splice(index--, 1);
                    }
                }
            }
            // Loop.unwatch(data, fn)
            if (data && typeof fn === "function") {
                remove(function(task) {
                    return task.callback === fn && task.data === data;
                });
            }
            // Loop.unwatch(fn), Loop.unwatch(undefined, fn)
            if (typeof data === "function" || !data && typeof fn === "function") {
                fn = data || fn;
                remove(function(task) {
                    return task.callback === fn || task.callback.guid && task.callback.guid === fn.guid;
                });
            }
            // Loop.unwatch(data)
            if (data !== undefined) {
                remove(function(task) {
                    return task.data === data;
                });
            }
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
        function clone(obj, autoboxing, path) {
            // path: Internal Use Only
            var target = obj.constructor(), name, value;
            path = path || [];
            if (obj === null || typeof obj != "object") {
                return obj;
            }
            if (autoboxing) target.$path = path.join(".");
            for (name in obj) {
                value = obj[name];
                // if (/Object|Array/.test(value.constructor.name)) {
                if (value !== undefined && value !== null) {
                    if (value.constructor === Object || value.constructor === Array) {
                        value = clone(value, autoboxing, path.concat(name));
                    } else {
                        if (autoboxing) {
                            value = new Object(value);
                            value.$path = path.concat(name).join(".");
                        }
                    }
                }
                target[name] = value;
            }
            return target;
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
            path = path || [];
            if (typeof newObject !== "object" || typeof oldObject !== "object") {
                if (result.length) return result;
            }
            added(newObject, oldObject, path, result);
            removed(newObject, oldObject, path, result);
            updated(newObject, oldObject, path, result);
            /*
            root    完整的数据对象
            context 变化的上下文，这里进行遍历计算以简化 Flush.js 对数据上下文的访问
            */
            function getContext(root, path) {
                return function() {
                    var context = root;
                    for (var index = 1; index < path.length - 1; index++) {
                        context = context[path[index]];
                    }
                    return context;
                };
            }
            if (fix) {
                for (var index = 0, change; index < result.length; index++) {
                    change = result[index];
                    change.root = newObject;
                    change.context = getContext(newObject, change.path)();
                    change.getContext = getContext;
                }
            }
            if (result.length) return result;
        }
        // 获取 newValue 比 oldValue 多出的属性
        function added(newValue, oldValue, path, result, type) {
            // type: Internal Use Only
            var name, value;
            for (name in newValue) {
                if (/\$guid|\$path|\$blocks|\$helpers/.test(name)) continue;
                value = newValue[name];
                if (!(name in oldValue)) {
                    result.push(type ? {
                        type: type,
                        // TYPES.DELETE
                        path: path.concat(name),
                        value: undefined,
                        oldValue: newValue[name]
                    } : {
                        type: TYPES.ADD,
                        path: path.concat(name),
                        value: newValue[name]
                    });
                    continue;
                }
                if (value === undefined || value === null || oldValue[name] === undefined || oldValue[name] === null || value.constructor !== oldValue[name].constructor) {
                    continue;
                }
                // IE 不支持 constructor.name
                // /Object|Array/.test(value.constructor.name)
                // http://stackoverflow.com/questions/332422/how-do-i-get-the-name-of-an-objects-type-in-javascript
                if (value.constructor === Object || value.constructor === Array) {
                    added(value, oldValue[name], path.concat(name), result, type);
                }
            }
            if (result.length) return result;
        }
        // 获取 newValue 比 oldValue 少了的属性
        function removed(newValue, oldValue, path, result) {
            return added(oldValue, newValue, path, result, TYPES.DELETE);
        }
        // 获取 newValue 比 oldValue 变化了的属性
        function updated(newValue, oldValue, path, result) {
            var name, value;
            for (name in newValue) {
                if (/\$guid|\$path|\$blocks|\$helpers/.test(name)) continue;
                value = newValue[name];
                if (!(name in oldValue)) continue;
                if (value === undefined && oldValue[name] === undefined) continue;
                if (value === undefined || value === null || oldValue[name] === undefined || oldValue[name] === null || value.constructor !== oldValue[name].constructor) {
                    result.push({
                        type: TYPES.UPDATE,
                        path: path.concat(name),
                        value: value,
                        oldValue: oldValue[name] !== undefined ? oldValue[name].valueOf() : oldValue[name]
                    });
                    continue;
                }
                // if (/Object|Array/.test(value.constructor.name)) {
                if (value.constructor === Object || value.constructor === Array) {
                    updated(value, oldValue[name], path.concat(name), result);
                    continue;
                }
                if (value.valueOf() !== oldValue[name].valueOf()) {
                    result.push({
                        type: TYPES.UPDATE,
                        path: path.concat(name),
                        value: value,
                        oldValue: oldValue[name]
                    });
                }
            }
            if (result.length) return result;
        }
        // expose
        return {
            auto: auto,
            tasks: tasks,
            TYPES: TYPES,
            watch: watch,
            unwatch: unwatch,
            clone: clone,
            diff: diff,
            letMeSee: letMeSee
        };
    }();
    /*! src/locator.js */
    /*
        attrs = {
            guid: guid,
            slot: 'start/end',
            type: 'text/attribute/block',
            path: '{{$lastest ' + prop + '}}',
            isHelper: !! node.isHelper,
            helper: helper
        }
    */
    if (!window.JSON) {
        window.JSON = {
            stringify: function(json) {
                var props = [], value;
                for (var key in json) {
                    value = typeof json[key] === "string" ? '"' + json[key] + '"' : json[key];
                    props.push('"' + key + '":' + value);
                }
                return "{" + props.join(",") + "}";
            }
        };
    }
    /*
        定位符
    */
    // script 定位符
    var ScriptLocator = {
        // AST 创建定位符
        create: function create(attrs) {
            var escapeExpression = Handlebars.Utils.escapeExpression;
            var pathHTML = escapeExpression("<script");
            for (var key in attrs) {
                if (attrs[key] === undefined) continue;
                pathHTML += " " + key + escapeExpression('="') + attrs[key] + escapeExpression('"');
            }
            pathHTML += escapeExpression("></script>");
            return pathHTML;
        },
        // Scanner 定位符正则
        getLocatorRegExp: function() {
            return /(<script(?:.*?)><\/script>)/gi;
        },
        // Scanner  查找定位符
        find: function find(attrs, context) {
            var selector = "script";
            for (var key in attrs) {
                selector += "[" + key + '="' + attrs[key] + '"]';
            }
            return jqLite(selector, context);
        },
        // Scanner 解析占位符
        parse: function parse(locator, attr) {
            return jqLite(locator).attr(attr);
        },
        // Scanner 更新占位符
        update: function update(locator, attrs, force) {
            if (locator.nodeName.toLowerCase() === "script" && locator.getAttribute("guid") && locator.getAttribute("slot") === "start") {
                if (force || !locator.getAttribute("type")) {
                    for (var key in attrs) {
                        jqLite(locator).attr(key, attrs[key]);
                    }
                }
            }
            return locator;
        },
        // Flush 解析目标节点
        parseTarget: function parseTarget(locator) {
            var guid = jqLite(locator).attr("guid");
            var target = [], node = locator, $node;
            while (node = node.nextSibling) {
                $node = jqLite(node);
                if (node.nodeName.toLowerCase() === "script" && $node.attr("guid")) {
                    if ($node.attr("guid") === guid && $node.attr("slot") === "end") {
                        break;
                    }
                } else {
                    target.push(node);
                }
            }
            return jqLite(target);
        }
    };
    // comment 定位符
    var JsonCommentLocator = {
        // AST 创建定位符
        create: function create(attrs) {
            var escapeExpression = Handlebars.Utils.escapeExpression;
            return escapeExpression("<!-- ") + escapeExpression(JSON.stringify(attrs)) + escapeExpression(" -->");
        },
        // Scanner 定位符正则
        getLocatorRegExp: function getLocatorRegExp() {
            return /(<!--\s*({(?:.*?)})\s*-->)/gi;
        },
        // Scanner 查找定位符
        find: function find(attrs, context) {
            // getJsonCommentsByProperty
            return jqLite(context).add("*", context).contents()._filter(function() {
                return this.nodeType === 8;
            })._filter(function(item, index) {
                /* jslint evil: true */
                try {
                    var json = new Function("return " + item.nodeValue)();
                    for (var key in attrs) {
                        if (attrs[key] !== json[key]) return false;
                    }
                    return true;
                } catch (error) {
                    window.console && console.error(error);
                    return false;
                }
            });
        },
        // Scanner 解析占位符
        parse: function parse(locator, attr) {
            /* jslint evil: true */
            var json = new Function("return " + locator.nodeValue)();
            return attr ? json[attr] : json;
        },
        // Scanner 更新占位符
        update: function update(locator, attrs, force) {
            if (locator.nodeType === 8) {
                var json = this.parse(locator);
                if (json.guid && json.slot === "start") {
                    if (force || !json.type) {
                        for (var key in attrs) {
                            json[key] = attrs[key];
                        }
                        locator.nodeValue = " " + JSON.stringify(json) + " ";
                    }
                }
            }
            return locator;
        },
        // Flush 解析目标节点
        parseTarget: function parseTarget(locator) {
            var json = this.parse(locator);
            var target = [];
            var node = locator;
            while (node = node.nextSibling) {
                if (node.nodeType === 8) {
                    var end = this.parse(node);
                    if (end.guid === json.guid && end.slot === "end") break;
                } else {
                    target.push(node);
                }
            }
            return jqLite(target);
        }
    };
    var Locators = [ ScriptLocator, JsonCommentLocator ];
    var Locator = location.search.indexOf("locator=script") !== -1 ? ScriptLocator : location.search.indexOf("locator=comment") !== -1 ? JsonCommentLocator : Locators[0];
    /*! src/ast.js */
    /*
        # AST

        修改语法树，插入定位符。

        * AST.handle(node, blocks, helpers)
            入口方法。
        * AST.program(node, context, index, blocks, helpers)
            遍历语法树。
        * AST.mustache(node, context, index, blocks, helpers)
            为表达式插入定位符。
        * AST.block(node, context, index, blocks, helpers)
            为逻辑块插入定位符

    */
    var AST = function() {
        var guid = 1;
        var ifHelper = Handlebars.helpers["if"];
        Handlebars.registerHelper("if", function(conditional, options) {
            return ifHelper.call(this, conditional !== undefined ? conditional.valueOf() : conditional, options);
        });
        var blockHelperMissing = Handlebars.helpers.blockHelperMissing;
        Handlebars.registerHelper("blockHelperMissing", function(context, options) {
            return blockHelperMissing.call(this, context !== undefined && context !== null ? context.valueOf() : context, options);
        });
        Handlebars.registerHelper("$lastest", function(items, options) {
            return items && items.$path || this && this.$path;
        });
        return {
            /*
                ### AST.handle(node, blocks, helpers)

                修改语法树的入口方法。

                * AST.handle(node)
                * AST.handle(node, blocks)
                * AST.handle(node, blocks, helpers)
                    公开方法。
                * AST.handle(node, context, index, blocks, helpers)
                    用于内部递归修改语法树。


            */
            handle: function handle(node, context, index, blocks, helpers) {
                if (arguments.length === 2) {
                    blocks = context;
                    context = undefined;
                    helpers = {};
                }
                if (arguments.length === 3) {
                    blocks = context;
                    helpers = index;
                    context = index = undefined;
                }
                if (this[node.type]) this[node.type](node, context, index, blocks, helpers);
                return node;
            },
            program: function program(node, context, index, blocks, helpers) {
                for (var i = 0; i < node.statements.length; i++) {
                    this.handle(node.statements[i], node.statements, i, blocks, helpers);
                }
            },
            // 为表达式插入定位符
            mustache: function(node, context, index, blocks, helpers) {
                if (node.binded) return;
                var prop = [];
                if (node.isHelper) {
                    node.params.forEach(function(param) {
                        if (param.type === "ID") {
                            prop.push(param.string);
                        }
                    });
                } else {
                    prop.push(node.id.string);
                }
                prop = prop.join(" ");
                var attrs = {
                    guid: guid,
                    slot: "",
                    type: "text",
                    path: "{{$lastest " + prop + "}}",
                    isHelper: !!node.isHelper
                };
                var placeholder;
                var statements;
                attrs.slot = "start";
                placeholder = Locator.create(attrs);
                statements = Handlebars.parse(placeholder).statements;
                statements[1].binded = true;
                context.splice.apply(context, [ index, 0 ].concat(statements));
                placeholder = Locator.create({
                    guid: attrs.guid,
                    slot: "end",
                    type: "todo"
                });
                statements = Handlebars.parse(placeholder).statements;
                context.splice.apply(context, [ index + 4, 0 ].concat(statements));
                if (helpers) helpers[guid] = {
                    constructor: Handlebars.AST.ProgramNode,
                    type: "program",
                    statements: [ node ]
                };
                guid++;
                node.binded = true;
            },
            // 为逻辑块插入定位符
            block: function block(node, context, index, blocks, helpers) {
                if (node.binded) return;
                var helper, prop;
                if (node.mustache.params.length === 0) {
                    helper = "";
                    prop = node.mustache.id.string;
                } else {
                    helper = node.mustache.id.string;
                    prop = node.mustache.params[0].string;
                }
                var attrs = {
                    guid: guid,
                    slot: "",
                    type: "block",
                    path: "{{$lastest " + prop + "}}",
                    helper: helper
                };
                var placeholder;
                var statements;
                // mustache 定义 DOM 位置
                attrs.slot = "start";
                placeholder = Locator.create(attrs);
                statements = Handlebars.parse(placeholder).statements;
                statements[1].binded = true;
                context.splice.apply(context, [ index, 0 ].concat(statements));
                placeholder = Locator.create({
                    guid: attrs.guid,
                    slot: "end",
                    type: "todo"
                });
                statements = Handlebars.parse(placeholder).statements;
                context.splice.apply(context, [ index + 4, 0 ].concat(statements));
                if (blocks) blocks[guid] = {
                    constructor: Handlebars.AST.ProgramNode,
                    type: "program",
                    statements: [ node ]
                };
                guid++;
                node.binded = true;
                this.handle(node.program || node.inverse, context, index, blocks, helpers);
            }
        };
    }();
    /*! src/scan.js */
    /*
        # Scanner

        扫描 DOM 元素，解析定位符

    */
    var Scanner = function() {
        // 入口方法
        function scan(node, data) {
            // data > dom, expression
            scanNode(node);
            // dom > data
            scanFormElements(node, data);
        }
        // 扫描单个节点，包括：属性，子节点。
        function scanNode(node) {
            switch (node.nodeType) {
              case 1:
              // Element
                case 9:
              // Document
                case 11:
                // DocumentFragment
                scanAttributes(node);
                scanChildNode(node);
                break;

              case 3:
                // Text
                scanTexNode(node);
                break;
            }
        }
        /*
            扫描文本节点
        */
        function scanTexNode(node) {
            var content = node.textContent || node.innerText || node.nodeValue;
            jqLite("<div>" + content + "</div>").contents()._each(function(elem, index) {
                Locator.update(elem, {
                    type: "text"
                });
            }).replaceAll(node);
        }
        /*
            扫描属性
        */
        var AttributeHooks = {
            "bs-style": {
                name: "style",
                setup: function() {},
                teardown: function(node, value) {
                    jqLite(node).attr("style", value);
                }
            },
            "bs-src": {
                name: "src",
                setup: function() {},
                teardown: function(node, value) {
                    jqLite(node).attr("src", value);
                }
            },
            "bs-checked": {
                name: "checked",
                setup: function() {},
                teardown: function(node, value) {
                    if (value === "true") jqLite(node).attr("checked", "checked");
                }
            }
        };
        function scanAttributes(node) {
            var reph = Locator.getLocatorRegExp();
            var restyle = /([^;]*?): ([^;]*)/gi;
            var attributes = [];
            jqLite._each(// “Array.prototype.slice: 'this' is not a JavaScript object” error in IE8
            // slice.call(node.attributes || [], 0)
            function() {
                var re = [];
                var all = node.attributes;
                for (var i = 0; i < all.length; i++) {
                    /*
                            Fixes bug:
                            在 IE6 中，input.attributeNode('value').specified 为 false，导致取不到 value 属性。
                            所以，增加了对 nodeValue 的判断。
                        */
                    if (all[i].specified || all[i].nodeValue) re.push(all[i]);
                }
                return re;
            }(), function(attributeNode, index) {
                var nodeName = attributeNode.nodeName, nodeValue = attributeNode.nodeValue, ma, stylema, hook;
                nodeName = nodeName.toLowerCase();
                hook = AttributeHooks[nodeName];
                nodeName = hook ? hook.name : nodeName;
                if (nodeName === "style") {
                    restyle.exec("");
                    while (stylema = restyle.exec(nodeValue)) {
                        reph.exec("");
                        while (ma = reph.exec(stylema[2])) {
                            attributes.push(Locator.update(jqLite("<div>" + ma[1] + "</div>").contents()[0], {
                                type: "attribute",
                                name: nodeName,
                                css: jqLite.trim(stylema[1])
                            }, true));
                        }
                    }
                } else {
                    reph.exec("");
                    while (ma = reph.exec(nodeValue)) {
                        attributes.push(/*
                                    Fixes bug:
                                    在 IE6 中，占位符中的空格依然是 `%20`，需要手动转义。
                                */
                        Locator.update(jqLite("<div>" + decodeURIComponent(ma[1]) + "</div>").contents()[0], {
                            type: "attribute",
                            name: nodeName
                        }, true));
                    }
                }
                if (attributes.length) {
                    nodeValue = nodeValue.replace(reph, "");
                    attributeNode.nodeValue = nodeValue;
                    jqLite(attributes)._each(function(elem, index) {
                        var slot = Locator.parse(elem, "slot");
                        if (slot === "start") jqLite(node).before(elem);
                        if (slot === "end") jqLite(node).after(elem);
                    });
                }
                if (hook) hook.teardown(node, nodeValue);
            });
        }
        // 扫描子节点
        function scanChildNode(node) {
            jqLite(node.childNodes)._each(function(childNode, index) {
                scanNode(childNode);
            });
        }
        // 扫描表单元素
        function scanFormElements(node, data) {
            Locator.find({
                slot: "start",
                type: "attribute",
                name: "value"
            }, node)._each(function(locator, index) {
                var path = Locator.parse(locator, "path").split("."), target = Locator.parseTarget(locator)[0];
                // TODO 为什么不触发 change 事件？
                jqLite(target).on("change.bisheng keyup.bisheng", function(event) {
                    updateValue(data, path, event.target);
                    if (!Loop.auto()) Loop.letMeSee();
                });
            });
            Locator.find({
                slot: "start",
                type: "attribute",
                name: "checked"
            }, node)._each(function(locator, _) {
                var path = Locator.parse(locator, "path").split("."), target = Locator.parseTarget(locator)[0];
                var value = data;
                for (var index = 1; index < path.length; index++) {
                    value = value[path[index]];
                }
                // 如果 checked 的初始值是 false 或 "false"，则初始化为未选中。
                if (value === undefined || value.valueOf() === false || value.valueOf() === "false") {
                    jqLite(target).prop("checked", false);
                }
                if (value !== undefined && (value.valueOf() === true || value.valueOf() === "true" || value.valueOf() === "checked")) {
                    jqLite(target).prop("checked", true);
                }
                /*
                // jQuery
                jqLite(target).on('change.bisheng', function(event, firing) {
                    // radio：点击其中一个后，需要同步更新同名的其他 radio
                    if (!firing && event.target.type === 'radio') {
                        jqLite('input:radio[name="' + event.target.name + '"]')
                            .not(event.target)
                            .trigger('change.bisheng', firing = true)
                    }
                    updateChecked(data, path, event.target)
                    if (!Loop.auto()) Loop.letMeSee()
                })
                */
                // 兼容 KISSY 和 jQuery
                jqLite(target).on("change.bisheng", function(event, extraParameters) {
                    if (event.target.type === "radio" && (// jQuery && KISSY 
                    !extraParameters && !event.firing)) {
                        jqLite('input[name="' + event.target.name + '"]').filter(function(input, index) {
                            return input.type === "radio" && input !== event.target;
                        }).trigger("change.bisheng", {
                            // KISSY 会把第二个参数的属性合并到事件对象 event 中
                            firing: true
                        });
                    }
                    updateChecked(data, path, event.target);
                    if (!Loop.auto()) Loop.letMeSee();
                });
            });
        }
        /*
            更新属性 value 对应的数据
            TODO:
                input 
                    radio checkbox
                select
                    multi?
                textarea
         */
        var updateValueHooks = {
            text: function($target) {
                $target.data("user is editing", true);
                return $target.val();
            },
            radio: function($target) {
                return false;
            },
            checkbox: function($target) {
                return false;
            },
            _default: function($target) {
                return $target.val();
            }
        };
        function updateValue(data, path, target) {
            for (var index = 1; index < path.length - 1; index++) {
                data = data[path[index]];
            }
            var hook = updateValueHooks[target.type] || updateValueHooks[target.nodeName.toLowerCase()] || updateValueHooks._default;
            var value = hook(jqLite(target));
            if (value !== false) data[path[path.length - 1]] = value;
        }
        /*
            更新属性 checked 对应的数据
            TODO:
                input
                    radio
                    checkbox
        */
        var updateCheckedHooks = {
            radio: function($target, data) {
                var name = $target.attr("name");
                var value = $target.prop("checked");
                if (name && value && name in data) data[name] = $target.val();
                return value;
            },
            checkbox: function($target, data) {
                return $target.prop("checked");
            },
            _default: function($target, data) {}
        };
        function updateChecked(data, path, target) {
            for (var index = 1; index < path.length - 1; index++) {
                data = data[path[index]];
            }
            var hook = updateCheckedHooks[target.type] || updateCheckedHooks[target.nodeName.toLowerCase()] || updateCheckedHooks._default;
            var value = hook(jqLite(target), data);
            if (value !== undefined) data[path[path.length - 1]] = value;
        }
        return {
            scan: scan
        };
    }();
    /*! src/flush.js */
    /*
        # Flush
        
        更新 DOM 元素

        * Flush.handle(event, change, defined)
            * Flush.handle.text(path, event, change, defined)
            * Flush.handle.attribute(path, event, change, defined)
            * Flush.handle.block(path, event, change, defined)
        * Flush.scrollIntoView(event, change)
        * Flush.highlight(event, change)

    */
    var Flush = function() {
        /*
            ## Flush.handle(event, change, defined)

            更新 DOM 元素。其中含有 3 个方法：

            * Flush.handle.text(path, event, change, defined)
                更新文本节点的值。
            * Flush.handle.attribute(path, event, change, defined)
                更新属性的值。
            * Flush.handle.block(path, event, change, defined)
                更新逻辑块的内容。

            **参数的含义和默认值**如下所示：

            * 参数 event：必选。事件对象，初始值如下，其中的数组 target 用于收集需要（被）更新的 DOM 元素：
                    { 
                        target: [] 
                    }
            * 参数 change：必选。事件对象，格式为：
                    {
                        type: 'add/delete/update',
                        path: [guid, , ],
                        value: newValue,
                        oldValue: oldValue
                    }
            * 参数 defined：必选。数据副本，其中的基本类型已被自动装包。
            * 参数 path：script 元素，用作起始定位符，结构为：
                    <script guid="guid", slot="start" type="text|attribute|block" path="guid.property...", ishelper="true|false"></script>
                    
                    > 结束定位符的结构为：

                    <script guid="guid", slot="start" 


        */
        function handle(event, change, defined, context) {
            var paths = Locator.find({
                slot: "start",
                path: change.path.join(".")
            }, context || document.body);
            var type;
            if ((change.type === "delete" || change.type === "add") && change.context instanceof Array) {
                /*paths.length === 0 && */
                change.path.pop();
                change.type = "update";
                change.context = change.getContext(change.root, change.path)();
                handle(event, change, defined);
            }
            paths._each(function(path, index) {
                type = Locator.parse(path, "type");
                if (handle[type]) handle[type](path, event, change, defined);
            });
        }
        // 
        /*
           更新属性对应的 Expression 
           更新文本节点的值。

        */
        handle.text = function text(locator, event, change, defined) {
            var guid = Locator.parse(locator, "guid");
            var helper = Locator.parse(locator, "helper");
            var target = Locator.parseTarget(locator);
            var content;
            if (target.length === 1 && target[0].nodeType === 3) {
                // TextNode
                event.target.push(target[0]);
                target[0].nodeValue = change.value;
            } else {
                // Element
                if (helper === "true") {
                    content = Handlebars.compile(defined.$helpers[guid])(change.context);
                } else {
                    content = change.value;
                }
                HTML.convert(content).contents().insertAfter(locator)._each(function(elem, index) {
                    event.target.push(elem);
                });
                jqLite(target).remove();
            }
        };
        // 更新属性对应的 Expression
        handle.attribute = function attribute(path, event, change, defined) {
            var currentTarget, name, $target;
            event.target.push(currentTarget = Locator.parseTarget(path)[0]);
            $target = jqLite(currentTarget);
            var ast = defined.$blocks[Locator.parse(path, "guid")];
            var value = ast ? Handlebars.compile(ast)(change.context) : change.value;
            var oldValue = function() {
                var oldValue;
                var context = Loop.clone(change.context, true, change.path.slice(0, -1));
                // TODO
                context[change.path[change.path.length - 1]] = change.oldValue !== undefined ? change.oldValue.valueOf() : change.oldValue;
                oldValue = ast ? Handlebars.compile(ast)(context) : change.oldValue;
                return oldValue;
            }();
            name = Locator.parse(path, "name");
            switch (name) {
              case "class":
                $target.removeClass("" + oldValue).addClass("" + value);
                break;

              case "bs-style":
              case "style":
                $target.css(Locator.parse(path, "css"), value);
                break;

              case "value":
                if ($target.val() !== value && !$target.data("user is editing")) {
                    $target.val(value);
                }
                $target.data("user is editing", false);
                break;

              case "checked":
                $target.prop(name, value);
                name = $target.attr("name");
                if (name && $target.prop("checked") && name in change.context) {
                    // setTimeout(function() {
                    change.context[name] = $target.val();
                }
                break;

              default:
                // 只更新变化的部分（其实不准确 TODO）
                $target._attr(name, function(index, attr) {
                    return oldValue === undefined ? value : attr !== oldValue.valueOf() ? attr.replace(oldValue, value) : value;
                });
            }
        };
        // 更新数组对应的 Block，路径 > guid > Block
        handle.block = function block(locator, event, change, defined) {
            var guid = Locator.parse(locator, "guid");
            var ast = defined.$blocks[guid];
            var context = Loop.clone(change.context, true, change.path.slice(0, -1));
            // TODO
            var content = Handlebars.compile(ast)(context);
            content = HTML.convert(content);
            Scanner.scan(content[0], change.context);
            content = content.contents();
            var target = Locator.parseTarget(locator);
            var endLocator = target.length ? target[target.length - 1].nextSibling : locator.nextSibling;
            /*
                优化渲染过程：
                1. 移除多余的旧节点
                2. 逐个比较节点类型、节点值、节点内容。
            */
            // 如果新内容是空，则移除所有旧节点
            if (content.length === 0) {
                jqLite(target).remove();
                return;
            }
            // 移除旧节点中多余的
            /*
                Fixes Bug
                在 IE8 中调用 array.splice(index , howMany[, element1[, ...[, elementN]]]) 必须传入参数 howMany。
                https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
            */
            if (content.length < target.length) {
                jqLite(target.splice(content.length, target.length - content.length)).remove();
            }
            content._each(function(element, index) {
                // 新正节点
                if (!target[index]) {
                    endLocator.parentNode.insertBefore(element, endLocator);
                    event.target.push(element);
                    return;
                }
                // 节点类型有变化，替换之
                if (element.nodeType !== target[index].nodeType) {
                    target[index].parentNode.insertBefore(element, target[index]);
                    target[index].parentNode.removeChild(target[index]);
                    event.target.push(element);
                    return;
                }
                // 同是文本节点，则更新节点值
                if (element.nodeType === 3 && element.nodeValue !== target[index].nodeValue) {
                    target[index].nodeValue = element.nodeValue;
                    return;
                }
                // 同是注释节点，则更新节点值
                if (element.nodeType === 8 && element.nodeValue !== target[index].nodeValue) {
                    target[index].nodeValue = element.nodeValue;
                    return;
                }
                // 同是 DOM 元素，则检测属性 outerHTML 是否相等，不相等则替换之
                if (element.nodeType === 1) {
                    // jqLite(target[index]).removeClass('transition highlight')
                    if (element.outerHTML !== target[index].outerHTML) {
                        target[index].parentNode.insertBefore(element, target[index]);
                        target[index].parentNode.removeChild(target[index]);
                        event.target.push(element);
                        return;
                    }
                }
            });
        };
        /*
            如果 URL 中含有参数 scrollIntoView，则自动滚动至发生变化的元素。
            用于调试、演示，或者在项目中提醒用户。
        */
        function scrollIntoView(event, change) {
            if (event.target.nodeType) event.target = [ event.target ];
            event.target.forEach && event.target.forEach(function(item, index) {
                switch (item.nodeType) {
                  case 3:
                    item.parentNode.scrollIntoView();
                    break;

                  case 1:
                    item.scrollIntoView();
                    break;
                }
            });
        }
        function highlight(event, change) {
            if (event.target.nodeType) event.target = [ event.target ];
            event.target.forEach && event.target.forEach(function(item, index) {
                switch (item.nodeType) {
                  /*
                        如果只高亮当前文本节点，需要将当前文本节点用 <span> 包裹
                    */
                    case 3:
                    jqLite(item).wrap("<span>").parent().addClass("transition highlight");
                    setTimeout(function() {
                        jqLite(item).unwrap("<span>").removeClass("transition highlight");
                    }, 500);
                    break;

                  case 1:
                    jqLite(item).addClass("transition highlight");
                    setTimeout(function() {
                        jqLite(item).removeClass("transition highlight");
                    }, 500);
                    break;
                }
            });
        }
        return {
            handle: handle,
            scrollIntoView: scrollIntoView,
            highlight: highlight
        };
    }();
    /*! src/html.js */
    var HTML = {};
    var rtagName = /<([\w:]+)/;
    var wrapMap = {
        option: [ 1, "<select multiple='multiple'>", "</select>" ],
        thead: [ 1, "<table>", "</table>" ],
        tr: [ 2, "<table><tbody>", "</tbody></table>" ],
        td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
        _default: [ 1, "<div>", "</div>" ]
    };
    wrapMap.optgroup = wrapMap.option;
    wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
    wrapMap.th = wrapMap.td;
    HTML.wrap = function wrap(html) {};
    /*
        ### HTML.convert(html)

        转换 HTML 片段为 DOM 元素。
    */
    HTML.convert = function convert(html) {
        var tag = (rtagName.exec(html) || [ "", "" ])[1].toLowerCase();
        var wrap = wrapMap[tag] || wrapMap._default;
        var depth = wrap[0];
        var div = document.createElement("div");
        div.innerHTML = wrap[1] + html + wrap[2];
        while (depth--) {
            div = div.lastChild;
        }
        return jqLite(div);
    };
    /*
        ### HTML.table(html)

        解析表格中的占位符，避免在转换为 DOM 元素破坏表结构。
    */
    HTML.table = function table(html) {
        return html.replace(/(<table.*?>)([\w\W]*?)(<\/table>)/g, function($0) {
            return $0.replace(/(>)([\w\W]*?)(<)/g, function(_, $1, $2, $3) {
                if ($2.indexOf("&lt;") > -1) {
                    var re = "";
                    HTML.convert($2).contents()._each(function(node, index) {
                        re += node.nodeValue;
                    });
                    return $1 + re + $3;
                }
                return $1 + $2 + $3;
            });
        });
    };
    /*! src/bisheng.js */
    /*
        ## BiSheng

        双向绑定的入口对象，含有两个方法：BiSheng.bind(data, tpl, callback) 和 BiSheng.unbind(data)。
    */
    var BiSheng = function() {
        var guid = 1;
        return {
            version: "0.1.0",
            /*
                ## BiSheng.auto(bool)

                设置运行模式为自动检测（true）或手动触发检测（false）。

                BiSheng.js 初始化时，会默认执行 BiSheng.auto(false)，即默认设置为手动触发检测，此时，在更新数据时，需要手动调用 BiSheng.apply(fn)。
                如果希望自动检测，则执行 执行 BiSheng.auto(true)。
            */
            auto: function(bool) {
                if (arguments.length) {
                    Loop.auto(bool);
                    return this;
                }
                return Loop.auto();
            },
            /*
                ## BiSheng.bind(data, tpl, callback(content))

                在模板和数据之间执行双向绑定。

                * BiSheng.bind(data, tpl, callback(content))
                * BiSheng.bind(data, tpl, context)
                * BiSheng.bind(data, tpl)

                **参数的含义和默认值**如下所示：

                * **参数 data**：必选。待绑定的对象或数组。
                * **参数 tpl**：必选。待绑定的 HTML 模板。在绑定过程中，先把 HTML 模板转换为 DOM 元素，然后将“绑定”数据到 DOM 元素。目前只支持 Handlebars.js 语法。
                * **参数 callback(content)**：必选。回调函数，当绑定完成后被执行。执行该函数时，会把转换后的 DOM 元素作为参数 content 传入。该函数的上下文（即关键字 this）是参数 data。
                * **参数 content**：数组，其中包含了转换后的 DOM 元素。
                * **参数 context**：可选。容器元素，可以是单个  DOM 元素，或 DOM 元素数组，或选择器表达式。转换后的 DOM 元素将被插入该参数中。

                **使用示例**如下所示：

                    // HTML 模板
                    var tpl = '{{title}}'
                    // 数据对象
                    var data = {
                      title: 'foo'
                    }
                    // 执行双向绑定
                    BiSheng.bind(data, tpl, function(content){
                      // 然后在回调函数中将绑定后的 DOM 元素插入文档中
                      $('div.container').append(content)
                    });
                    // 改变数据 data.title，对应的文档区域会更新
                    data.title = 'bar'

            */
            bind: function bind(data, tpl, callback, context) {
                // BiSheng.bind(data, tpl, context)
                if (arguments.length === 3 && typeof callback !== "function") {
                    context = callback;
                    callback = function(content) {
                        jqLite(context).append(content);
                    };
                }
                // 属性监听函数
                function task(changes) {
                    jqLite._each(changes, function(change, index) {
                        var event = {
                            target: []
                        };
                        Flush.handle(event, change, clone, context);
                        if (location.href.indexOf("scrollIntoView") > -1) Flush.scrollIntoView(event, data);
                        if (location.href.indexOf("highlight") > -1) Flush.highlight(event, data);
                    });
                }
                task.tpl = tpl;
                // 为所有属性添加监听函数
                var clone = Loop.watch(data, task, true, true);
                // 预处理 HTML 属性（IE 遇到非法的样式会丢弃）
                tpl = tpl.replace(/(<.*?)(style)(=.*?>)/g, "$1bs-style$3").replace(/(<input.*?)(checked)(=.*?>)/g, "$1bs-checked$3").replace(/(<img.*?)(src)(=.*?>)/g, "$1bs-src$3");
                // 修改 AST，为 Expression 和 Block 插入占位符
                var ast = Handlebars.parse(tpl);
                AST.handle(ast, undefined, undefined, clone.$blocks = {}, clone.$helpers = {});
                // 渲染 HTML
                var compiled = Handlebars.compile(ast);
                var html = compiled(clone);
                // 提前解析 table 中的定位符
                html = HTML.table(html);
                // 扫描占位符，定位 Expression 和 Block
                var content = jqLite(HTML.convert(html));
                if (content.length) Scanner.scan(content[0], data);
                content = content.contents().get();
                /*
                    返回什么呢？
                    如果 callback() 有返回值，则作为 BiSheng.bind() 的返回值返回，即优先返回 callback() 的返回值；
                    如果未传入 callback，则返回 content，因为不返回 content 的话，content 就会被丢弃。
                */
                return callback ? callback.call(data, content) || content : content;
            },
            /*
                ### BiSheng.unbind(data, tpl)

                解除数据和模板之间的双向绑定。

                * BiSheng.unbind(data, tpl)
                    解除数据 data 和模板 tpl 之间的双向绑定。
                * BiSheng.unbind(data)
                    解除数据 data 与所有模板之间的双向绑定。

                **参数的含义和默认值**如下所示：

                * 参数 data：必选。待接触绑定的对象或数组。
                * 参数 tpl：可选。待接触绑绑定的 HTML 模板。

                **使用示例**如下所示：

                    // HTML 模板
                    var tpl = '{{title}}'
                    // 数据对象
                    var data = {
                      title: 'foo'
                    }
                    // 执行双向绑定
                    BiSheng.bind(data, tpl, function(content){
                      // 然后在回调函数中将绑定后的 DOM 元素插入文档中
                      $('div.container').append(content)
                    })
                    // 改变数据 data.title，对应的文档区域会更新
                    data.title = 'bar'
                    // 解除双向绑定
                    BiSheng.unbind(data, tpl)
                    // 改变数据 data.title，对应的文档区域不会更新
                    data.title = 'foo'

            */
            unbind: function unbind(data, tpl) {
                if (!tpl) {
                    Loop.unwatch(data);
                } else {
                    for (var index = 0, fn; index < Loop.tasks.length; index++) {
                        fn = Loop.tasks[index];
                        if (fn.data === data && fn.tpl === tpl) {
                            Loop.tasks.splice(index--, 1);
                        }
                    }
                }
                return this;
            },
            /*
                ## BiSheng.watch(data, properties, fn(change))

                为一个或一组或所有属性添加监听函数。
                <!--Attach default handler function to all properties.-->

                * **BiSheng.watch(data, fn(changes))**
                * **BiSheng.watch(data, property, fn(change))**
                * **BiSheng.watch(data, properties, fn(change))**

                **参数的含义和默认值**如下所示：

                * **参数 data**：必选。指向待监听的对象或数组。
                * **参数 property**：可选。字符串，表示待监听的单个属性。
                * **参数 properties**：可选。字符串数组，表示待监听的多个属性。
                * **参数 fn**：必选。监听函数，当属性发生变化时被执行。
                    
                    * 参数 change 是一个对象，格式为：

                            {
                                type: 'add/delete/update',
                                path: [,,],
                                value: newValue,
                                oldValue: oldValue
                            }

                    * 参数 changes 是一个数组，格式为：
                    
                            [
                                {
                                    type: 'add',
                                    path: [,,],
                                    value: newValue
                                },{
                                    type: 'delete',
                                    path: [,,],
                                    value: newValue
                                }, {
                                    type: 'update',
                                    path: [,,],
                                    value: value,
                                    oldValue: oldValue
                                }
                            ]

                **使用示例**如下所示：

                    var data = { foo: 'foo' }
                    BiSheng.watch(data, function(changes){
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
            watch: function(data, properties, fn) {
                var propertiesMap = {}, index, change;
                function find(path) {
                    for (var index = path.length; index > 0; index--) {
                        if (propertiesMap[path.slice(0, index).join(".")]) return true;
                    }
                }
                function callback(changes) {
                    for (var index = 0; index < changes.length; index++) {
                        change = changes[index];
                        if (find(change.path)) fn.call(data, change);
                    }
                }
                if (properties && arguments.length === 3) {
                    // BiSheng.watch(data, properties, fn(changes))
                    // BiSheng.watch(data, property, fn(change))
                    properties = properties.constructor !== Array ? [ properties ] : properties;
                    for (index = 0; index < properties.length; index++) {
                        propertiesMap[properties[index]] = true;
                    }
                    fn.guid = fn.guid || guid++;
                    callback.guid = fn.guid;
                    callback.properties = properties;
                    Loop.watch(data, callback);
                } else {
                    // BiSheng.watch(data, undefined, fn(changes))
                    // BiSheng.watch(data, fn(changes))
                    fn = properties || fn;
                    fn.guid = fn.guid || guid++;
                    // BiSheng.watch(data, fn(changes))
                    Loop.watch(data, fn);
                }
                return this;
            },
            /*
                ## BiSheng.unwatch(data, properties, fn)

                移除监听函数。

                * **BiSheng.unwatch(data, properties, fn)**
                    
                    移除对象（或数组） data 上，绑定的用于监听属性 properties 的监听函数 fn。
                
                * **BiSheng.unwatch(data, properties)**
                    
                    移除对象（或数组） data 上，绑定的用于监听属性 properties 的所有监听函数。

                * **BiSheng.unwatch(data, fn)**

                    移除对象（或数组） data 上绑定的监听函数 fn。

                * **BiSheng.unwatch(data)**

                    移除对象（或数组） data 上绑定的所有监听函数。

                * **BiSheng.unwatch(fn)**

                    全局移除监听函数 fn。

                **参数的含义和默认值**如下所示：

                * **参数 data**：可选。指向待移除监听函数的对象或数组。
                * **参数 properties**：可选。字符串，或字符串数组。表示待移除监听的属性。
                * **参数 fn**：可选。待移除的监听函数。

                **使用示例**如下所示：

                    var data = { foo: 'foo' }
                    BiSheng.watch(data, function(changes){
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
                        BiSheng.unwatch(data)
                        data.foo = 'foo'
                        // => 
                    }, 1000)

            */
            unwatch: function(data, properties, fn) {
                if (!data) return this;
                // BiSheng.unwatch(fn)
                if (arguments.length === 1 && typeof data === "function") {
                    fn = data;
                    data = properties = undefined;
                }
                // BiSheng.unwatch(data, fn) or BiSheng.unwatch(data, properties)
                if (arguments.length === 2) {
                    // BiSheng.unwatch(data, fn)
                    if (typeof properties === "function") {
                        fn = properties;
                        properties = undefined;
                    }
                }
                // BiSheng.unwatch(data, fn)
                // BiSheng.unwatch(data)
                // BiSheng.unwatch(fn)
                if (!properties) {
                    Loop.unwatch(data, fn);
                    return this;
                }
                var i, j, k, task, found = false, tmp = [];
                if (properties.constructor !== Array) {
                    tmp = [ properties ];
                } else {
                    tmp = properties;
                }
                // properties = (properties.constructor !== Array ? [properties] : properties)
                // 为什么这条语句改变了 properties 的值？
                // BiSheng.unwatch(data, properties, fn)
                // BiSheng.unwatch(data, properties)
                for (i = 0; i < Loop.tasks.length; i++) {
                    task = Loop.tasks[i];
                    found = false;
                    if (task.data !== data || !task.callback.properties) continue;
                    if (fn && task.callback.guid !== fn.guid) continue;
                    for (j = 0; j < tmp.length; j++) {
                        for (k = 0; k < task.callback.properties.length; k++) {
                            if (task.callback.properties[k] === tmp[j]) {
                                // 删除匹配的属性，不再监听该属性
                                task.callback.properties.splice(k--, 1);
                                // 如果属性已全部删除，则删除监听函数
                                if (!task.callback.properties.length) found = true;
                            }
                        }
                    }
                    if (found) Loop.tasks.splice(i--, 1);
                }
                return this;
            },
            /*
                ## BiSheng.apply(fn)
                
                用于包裹对数据的操作。内部会检查数据的变化，并自动同步到视图。

                **使用示例**如下所示：
                
                    var data = { foo: 'foo' }
                    // ...
                    BiSheng.apply(function(){
                        data.foo = 'bar'
                    })
            */
            apply: function(fn) {
                if (fn) fn();
                BiSheng.Loop.letMeSee();
                return this;
            }
        };
    }();
    // BiSheng.auto(false)
    /*! src/fix/suffix.js */
    BiSheng.Loop = Loop;
    BiSheng.jqLite = jqLite;
    BiSheng.Locators = Locators;
    BiSheng.Locator = Locator;
    BiSheng.AST = AST;
    BiSheng.Scanner = Scanner;
    BiSheng.Flush = Flush;
    // For KISSY Test
    window.BiSheng = BiSheng;
    return BiSheng;
});