/*! src/expose.js */
"use strict";

/* global window */
/* global define */
/* global KISSY */

/*
    https://gist.github.com/nuysoft/7974409
*/

(function(factory) {

    var expose = factory()
    expose(factory, function() {
        window.expose = expose
    })

}(function() {

    // 模块化 Modular
    function expose(factory, globals) {
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
            // For KISSY 1.4
            KISSY.add(factory)

        } else {
            // Browser globals
            if (globals) globals()

        }
    }

    return expose

}));

/*! src/loop.js */
/*

    属性监听工具。
    Watch the changes of any object or attribute.
    
    Works with: IE 6+, FF 4+, SF 5+, WebKit, CH 7+, OP 12+, Node.JS

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

    var guid = 1;

    var tasks = [];
    var timerId;

    function letMeSee() {
        clearTimeout(timerId)
        for (var i = 0; i < tasks.length; i++) {
            tasks[i] && tasks[i]()
        }
        timerId = setTimeout(letMeSee, 50)
    }
    timerId = setTimeout(letMeSee, 50)

    var TYPES = {
        ADD: 'add',
        DELETE: 'delete',
        UPDATE: 'update'
    };

    /*
        ### Loop.watch(data, fn(changes))

        为所有属性添加监听函数。
        <!--Attach default handler function to all properties.-->

        * Loop.watch(data, fn(changes))

        **参数的含义和默认值**如下所示：

        * 参数 data：必选。待监听的对象或数组。
        * 参数 fn：必选。监听函数，当属性发生变化时被执行，参数 changes 的格式为：
            
                [{
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
                }]

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
    function watch(data, fn) {
        var id = guid++;
        var shadow = clone(data, true, [id]);

        function task() {
            var result = diff(data, shadow, [id], true)
            if (result && result.length) {
                fn(result, data, shadow)
                shadow = clone(data, true, [id])
            }
        }
        task.data = task

        tasks.push(task)
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
            移除监听函数 fn。

        **参数的含义和默认值**如下所示：

        * 参数 data：可选。待移除监听函数的对象或数组。
        * 参数 fn：可选。待移除的监听函数。

        **使用示例**如下所示：

            var data = { foo: 'foo' }
            Loop.watch(data, function(changes){
                console.log(JSON.stringify(changes, null, 4))
            })
            data.foo = 'bar'
            
            setTimeout(function(){
                Loop.unwatch(data)
                data.foo = 'foo'
            }, 1000)

    */
    function unwatch(data, fn) {
        for (var i = 0; i < tasks.length; i++) {
            if (tasks.data === data) tasks.splice(i--, 1)
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
            if (value === undefined && oldValue[name] === undefined) continue

            if (value === undefined ||
                oldValue[name] === undefined ||
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
        TYPES: TYPES,
        watch: watch,
        unwatch: unwatch,
        clone: clone,
        diff: diff,
        letMeSee: letMeSee
    }

}));

/*! src/ast.js */
"use strict";

/* global window */
/* global expose */
/* global Handlebars */

(function(factory) {

    expose(factory, function() {
        window.AST = factory()
    })

}(function() {

    var guid = 1;

    var ifHelp = Handlebars.helpers['if']
    Handlebars.registerHelper('if', function(conditional, options) {
        return ifHelp.call(this, conditional !== undefined ? conditional.valueOf() : conditional, options)
    })

    Handlebars.registerHelper('$lastest', function(items, options) {
        return items && items.$path || this && this.$path
    })

    return {
        createPathHTML: function createPathHTML(attrs) {
            // attrs.guid = attrs.guid || guid++
            var escape = Handlebars.Utils.escapeExpression

            var pathHTML = escape('<script')
            for (var key in attrs) {
                if (attrs[key] === undefined) continue
                pathHTML += ' ' + key + escape('="') + attrs[key] + escape('"')
            }
            pathHTML += escape('></script>')

            return pathHTML
        },

        /*
            * AST.handle(node, blocks)
            * AST.handle(node, blocks, helpers)
                公开方法
            * AST.handle(node, context, index, blocks, helpers)
                用于内部递归修改 AST
        */
        handle: function handle(node, context, index, blocks, helpers) {
            if (arguments.length === 2) {
                blocks = context
                context = undefined
                helpers = {}
            }
            if (arguments.length === 3) {
                blocks = context
                helpers = index
                context = index = undefined
            }

            if (this[node.type]) this[node.type](node, context, index, blocks, helpers)

            return node
        },

        program: function program(node, context, index, blocks, helpers) {
            for (var i = 0; i < node.statements.length; i++) {
                this.handle(node.statements[i], node.statements, i, blocks, helpers)
            }
        },

        // 为 Expression 插入占位符
        mustache: function(node, context, index, blocks, helpers) {
            if (node.binded) return

            var prop = []
            if (node.isHelper) {
                node.params.forEach(function(param) {
                    if (param.type === 'ID') {
                        prop.push(param.string)
                    }
                })
            } else {
                prop.push(node.id.string)
            }
            prop = prop.join(' ')

            var attrs = {
                guid: guid,
                slot: '',
                type: '',
                path: '{{$lastest ' + prop + '}}',
                isHelper: !! node.isHelper
            }
            var placeholder
            var statements

            attrs.slot = 'start'
            placeholder = this.createPathHTML(attrs)
            statements = Handlebars.parse(placeholder).statements
            statements[1].binded = true
            context.splice.apply(context, [index, 0].concat(statements))

            // attrs.slot = 'end'
            placeholder = this.createPathHTML({
                guid: attrs.guid,
                slot: 'end'
            })
            statements = Handlebars.parse(placeholder).statements
            context.splice.apply(context, [index + 4, 0].concat(statements))

            helpers[guid++] = {
                constructor: Handlebars.AST.ProgramNode,
                type: 'program',
                statements: [node]
            }

            node.binded = true
        },

        // 为 Block 插入占位符
        block: function block(node, context, index, blocks, helpers) {
            if (node.binded) return

            var helper, prop
            if (node.mustache.params.length === 0) {
                helper = ''
                prop = node.mustache.id.string
            } else {
                helper = node.mustache.id.string
                prop = node.mustache.params[0].string
            }

            var attrs = {
                guid: guid,
                slot: '',
                type: 'block',
                path: '{{$lastest ' + prop + '}}',
                helper: helper
            }
            var placeholder
            var statements

            // mustache 定义 DOM 位置
            attrs.slot = 'start'
            placeholder = this.createPathHTML(attrs)
            statements = Handlebars.parse(placeholder).statements
            statements[1].binded = true
            context.splice.apply(context, [index, 0].concat(statements))

            // attrs.slot = 'end'
            placeholder = this.createPathHTML({
                guid: attrs.guid,
                slot: 'end'
            })
            statements = Handlebars.parse(placeholder).statements
            context.splice.apply(context, [index + 4, 0].concat(statements))

            blocks[guid++] = {
                constructor: Handlebars.AST.ProgramNode,
                type: 'program',
                statements: [node]
            }

            // program 定义数据路径（废弃？转而通过 helper 插入？）

            /*node.program && node.program.statements.unshift.apply(
                node.program.statements,
                Handlebars.parse('<!--{{$path}}-->').statements
            )
            node.inverse && node.inverse.statements.unshift.apply(
                node.inverse.statements,
                Handlebars.parse('<!--{{$path}}-->').statements
            )*/


            node.binded = true

            this.handle(node.program || node.inverse, context, index, blocks, helpers)
        }
    }

}));

/*! src/scan.js */
(function(factory) {

    expose(factory, function() {
        window.scan = factory()
    })

}(function() {

    function scan(node, data) {
        // return
        // data > dom, expression
        scanNode(node)
        // data > dom, block
        scanBlocks(node)
        // dom > data
        scanFormElements(node, data)
    }

    // 扫描单个节点，包括：属性，子节点。
    function scanNode(node) {
        switch (node.nodeType) {
            case 1: // Element
            case 9: // Document
            case 11: // DocumentFragment
                scanAttributes(node)
                scanChildNode(node)
                break
            case 3: // Text
                replaceTexNode(node)
                break
        }
    }

    /*
        <script path="" type="text"></script>
    */
    function replaceTexNode(node) {
        var content = node.textContent || node.innerText || node.nodeValue
        $('<div>' + content + '</div>').contents()
            .each(function(index, elem) {
                if (elem.nodeName === 'SCRIPT' && elem.getAttribute('path')) {
                    if (!elem.getAttribute('type')) elem.setAttribute('type', 'text')
                }
            }).replaceAll(node)
    }

    /*
        <script path="" type="attribute" name="" ></script>
    */
    function scanAttributes(node) {
        var reph = /(<script(?:.*?)><\/script>)/ig
        var restyle = /([^;]*?): ([^;]*)/ig

        var attributes = []
        $.each(
            // “Array.prototype.slice: 'this' is not a JavaScript object” error in IE8
            // slice.call(node.attributes || [], 0)
            function() {
                var re = []
                var all = node.attributes
                for (var i = 0; i < all.length; i++) re.push(all[i])
                return re
            }(),
            function(index, attributeNode) {
                if (!attributeNode.specified) return

                var nodeName = attributeNode.nodeName,
                    nodeValue = attributeNode.nodeValue,
                    ma, stylema;

                if (nodeName === 'style') {
                    restyle.exec('')
                    while ((stylema = restyle.exec(nodeValue))) {
                        reph.exec('')
                        while ((ma = reph.exec(stylema[2]))) {
                            attributes.push(
                                $('<div>' + ma[1] + '</div>').contents()
                                .attr({
                                    type: 'attribute',
                                    name: attributeNode.nodeName.toLowerCase(),
                                    css: $.trim(stylema[1])
                                })[0]
                            )
                        }
                    }

                } else {
                    reph.exec('')
                    while ((ma = reph.exec(nodeValue))) {
                        attributes.push(
                            $('<div>' + ma[1] + '</div>').contents()
                            .attr({
                                type: 'attribute',
                                name: attributeNode.nodeName.toLowerCase()
                            })[0]
                        )
                    }
                }

                if (attributes.length) {
                    nodeValue = nodeValue.replace(reph, '')
                    attributeNode.nodeValue = nodeValue

                    $(attributes).each(function(index, elem) {
                        var slot = $(elem).attr('slot')
                        if (slot === 'start') $(node).before(elem)
                        if (slot === 'end') $(node).after(elem)
                    })

                }
            }
        )
    }

    function scanChildNode(node) {
        $(node.childNodes).each(function(index, childNode) {
            scanNode(childNode)
        })
        /*var childNodes = slice.call(node.childNodes, 0)
        childNodes.forEach(function(childNode, index, childNodes) {
            scanNode(childNode)
        })*/
    }

    function scanBlocks(node) {
        var selector = 'script[slot="start"][type="block"]'
        var blocks = $(selector)
        var path
        blocks.each(function(index, item) {
            if (item.nextSibling.nodeType === 8) {
                path = item.nextSibling.nodeValue
                path = path.split(',')
                path = path.length > 2 ? path.slice(0, -1).join('.') : path
                item.setAttribute('path', path)

                var guid = item.getAttribute('guid')
                slice.call(node.querySelectorAll('script[slot="end"][guid="' + guid + '"]') || [], 0)
                    .forEach(function(end) {
                        end.setAttribute('path', path)
                    })
                // [type="block"]
            }
        })
    }

    function scanFormElements(node, data) {
        $('script[slot="start"][type="attribute"][name="value"]', node).each(function(index, script) {
            var path = $(script).attr('path').split('.'),
                target = script;

            while ((target = target.nextSibling)) {
                if (target.nodeName !== 'SCRIPT') break
            }

            // TODO 为什么不触发 change 事件？
            $(target).on('change keyup', function(event) {
                updateValue(data, path, event.target)
            })
        })

        $('script[slot="start"][type="attribute"][name="checked"]', node).each(function(_, script) {
            var path = $(script).attr('path').split('.'),
                target = script;

            while ((target = target.nextSibling)) {
                if (target.nodeName !== 'SCRIPT') break
            }

            var value = data
            // Watch.define.defining.push(true) // 暂停事件
            for (var index = 1; index < path.length; index++) {
                value = value[path[index]]
            }
            // Watch.define.defining.pop() // 恢复事件
            // 如果 checked 的初始值是 false 或 "false"，则初始化为未选中。
            if (value === undefined || value.valueOf() === false || value.valueOf() === 'false') {
                $(target).prop('checked', false)
            }

            $(target).on('change', function(event) {
                updateChecked(data, path, event.target)
            })
        })
    }

    /*
     */
    function updateValue(data, path, target) {
        for (var index = 1; index < path.length - 1; index++) {
            data = data[path[index]]
        }

        var $target = $(target),
            value
        switch (target.nodeName.toLowerCase()) {
            case 'input':
                switch (target.type) {
                    case 'text':
                        value = $target.val()
                        break;
                    case 'radio': // TODO
                    case 'checkbox': // TODO
                        return
                    default:
                        value = $target.val()
                }
                break
            case 'select':
                value = $target.val()
                break
            case 'textarea':
                value = $target.val()
                break
            default:
                value = $target.val()
        }

        data[path[path.length - 1]] = value
    }

    function updateChecked(data, path, target) {
        for (var index = 1; index < path.length - 1; index++) {
            data = data[path[index]]
        }

        var $target = $(target),
            value
        switch (target.nodeName.toLowerCase()) {
            case 'input':
                switch (target.type) {
                    case 'radio': // TODO
                    case 'checkbox': // TODO
                        value = $target.prop('checked')
                        // var name = $target.attr('name')
                        // if (name && value) data[name] = $target.val()
                }
                break
            default:
                // TODO
        }

        data[path[path.length - 1]] = value
    }

    return scan

}));

/*! src/flush.js */
"use strict";

/* global window: true */
/* global document: true */
/* global $: true */
/* global Handlebars: true */
/* global expose */
/* global Loop */
/* global scan */

// CommonJS
if (typeof module === 'object' && module.exports) {
    window = require('jsdom').jsdom().createWindow()
    document = window.document

    // var $ = require('jquery')
    // var Handlebars = require('handlebars')
}

(function(factory) {

    expose(factory, function() {
        window.Flush = factory()
    })

}(function() {

    function expressionTarget(node) {
        while ((node = node.nextSibling)) {
            if (node.nodeName !== 'SCRIPT') return node
        }
    }

    function handle(event, change, defined) {
        var selector = 'script[slot="start"][path="' + change.path.join('.') + '"]'
        var paths = $(selector)
        var type

        if (paths.length === 0 && change.context instanceof Array) {
            change.path.pop()
            change.context = change.getContext(change.root, change.path)()
            handle(event, change, defined)
        }

        paths.each(function(index, path) {
            type = path.getAttribute('type')
            if (handle[type]) handle[type](path, event, change, defined)
        })
    }

    // 更新属性对应的 Expression
    handle.text = function text(path, event, change, defined) {
        var guid = path.getAttribute('guid')
        var helper = path.getAttribute('helper')
        var endPath = $('script[slot="end"][guid="' + guid + '"]')[0]
        var content

        var target = [],
            cur = path,
            to = endPath
        while ((cur = cur.nextSibling) && cur !== to) {
            target.push(cur)
        }

        if (target.length === 1 && target[0].nodeType === 3) {
            // TextNode
            event.target.push(target[0])
            target[0].nodeValue = change.value

        } else {
            // Element
            if (helper === 'true') {
                content = Handlebars.compile(defined.$helpers[guid])(change.context)
            } else {
                content = change.value
            }

            $('<div>' + content + '</div>').contents()
                .insertAfter(path)
                .each(function(index, elem) {
                    event.target.push(elem)
                })
            $(target).remove()
        }
    }

    // 更新属性对应的 Expression
    handle.attribute = function attribute(path, event, change, defined) {
        var currentTarget, name, $target;
        event.target.push(currentTarget = expressionTarget(path))
        $target = $(currentTarget)

        var ast = defined.$blocks[path.getAttribute('guid')]
        var value = ast ? Handlebars.compile(ast)(change.context) : change.value
        var oldValue = function() {
            var oldValue
            change.context[change.path[change.path.length - 1]] = change.oldValue !== undefined ? change.oldValue.valueOf() : change.oldValue
            oldValue = ast ? Handlebars.compile(ast)(change.context) : change.oldValue
            change.context[change.path[change.path.length - 1]] = change.value
            return oldValue
        }()

        name = path.getAttribute('name')
        switch (name) {
            case 'class':
                $target.removeClass('' + oldValue).addClass('' + value)
                break
            case 'style':
                $target.css(path.getAttribute('css'), value)
                break
            case 'value':
                if ($target.val() !== value) $target.val(value)
                break
            case 'checked':
                $target.prop(name, value)

                name = $target.attr('name')
                if (name && $target.prop('checked')) {
                    setTimeout(function() {
                        change.context[name] = $target.val()
                    }, 0)
                }
                break
            default:
                // 只更新变化的部分（其实不准确 TODO）
                $target.attr(name, function(index, attr) {
                    return oldValue === undefined ? value :
                        attr !== oldValue.valueOf() ? attr.replace(oldValue, value) :
                        value
                })
        }
    }

    // 更新数组对应的 Block，路径 > guid > Block
    handle.block = function block(path, event, change, defined) {
        var guid = path.getAttribute('guid')
        var endPath = document.querySelector('script[slot="end"][guid="' + guid + '"]')
        var ast = defined.$blocks[guid]
        var context = Loop.clone(change.context, true, change.path.slice(0, -1)) // TODO
        var content = Handlebars.compile(ast)(context)

        content = $('<div>' + content + '</div>')
        scan(content[0], change.context)
        content = content.contents()

        var target = [],
            cur = path,
            to = endPath
        while ((cur = cur.nextSibling) && cur !== to) {
            target.push(cur)
        }

        /*
            优化渲染过程
            1. 移除多余的旧节点
            2. 逐个比较节点类型、节点值、节点内容。
        */

        if (content.length < target.length) $(target.splice(content.length)).remove()

        content.each(function(index, element) {
            if (!target[index]) {
                to.parentNode.insertBefore(element, to)

                event.target.push(element)
                return
            }
            if (element.nodeType !== target[index].nodeType) {
                target[index].parentNode.insertBefore(element, target[index])
                target[index].parentNode.removeChild(target[index])

                event.target.push(element)
                return
            }
            if (element.nodeType === 3 && element.nodeValue !== target[index].nodeValue) {
                target[index].nodeValue = element.nodeValue
                return
            }
            if (element.nodeType === 8 && element.nodeValue !== target[index].nodeValue) {
                target[index].nodeValue = element.nodeValue
                return
            }

            if (element.nodeType === 1) {
                // $(target[index]).removeClass('transition highlight')
                if (element.outerHTML !== target[index].outerHTML) {
                    target[index].parentNode.insertBefore(element, target[index])
                    target[index].parentNode.removeChild(target[index])

                    event.target.push(element)
                    return
                }
            }
        })

        // $(target).remove() // remove
        // $(content).insertAfter(item) // insert

        // scan
        // Bind.scan(path.parentNode, defined)
    }

    /*
        如果 URL 中含有参数 scrollIntoView，则自动滚动至发生变化的元素。
        用于调试、演示，或者在项目中提醒用户。
    */
    function scrollIntoView(event, change) {
        return
        if (event.target.nodeType) event.target = [event.target]
        event.target.forEach && event.target.forEach(function(item, index) {
            switch (item.nodeType) {
                case 3:
                    item.parentNode.scrollIntoView()
                    break
                case 1:
                    item.scrollIntoView()
                    break
            }
        })
    }

    function highlight(event, change) {
        if (event.target.nodeType) event.target = [event.target]
        event.target.forEach && event.target.forEach(function(item, index) {
            switch (item.nodeType) {
                /*
                    如果只高亮当前文本节点，需要将当前文本节点用 <span> 包裹
                */
                case 3:
                    $(item).wrap('<span>').parent().addClass('transition highlight')
                    // $(item.parentNode).addClass('transition highlight')
                    setTimeout(function() {
                        $(item).unwrap('<span>').removeClass('transition highlight')
                        // $(item.parentNode).removeClass('highlight')
                    }, 500)
                    break
                case 1:
                    $(item).addClass('transition highlight')
                    setTimeout(function() {
                        $(item).removeClass('transition highlight')
                    }, 500)
                    break
            }
        })
    }

    // expose
    return {
        handle: handle,
        scrollIntoView: scrollIntoView,
        highlight: highlight
    }

}));

/*! src/hyde.js */
"use strict";

/* global window: true */
/* global location */
/* global $: true */
/* global Handlebars: true */
/* global expose */
/* global Loop */
/* global AST */
/* global scan */
/* global Flush */

(function(factory) {

    expose(factory, function() {
        // Browser globals
        window.Hyde = factory()
    })

}(function() {

    return {
        version: '0.1.0',

        /*
            Hyde.bind(data, tpl, callback)
        */
        bind: function bind(data, tpl, callback) {
            var clone = Loop.watch(data, function(changes) {
                // console.log(JSON.stringify(changes, null, 2))
                $.each(changes, function(_, change) {
                    var event = {
                        target: []
                    }
                    Flush.handle(event, change, clone)
                    if (location.href.indexOf('scrollIntoView') > -1) Flush.scrollIntoView(event, data)
                    Flush.highlight(event, data)
                })
            })

            // 定义数据
            // var clone = Loop.clone(data, true)

            // 修改 AST，插入 Block 占位符
            var ast = Handlebars.parse(tpl)
            AST.handle(ast, undefined, undefined, clone.$blocks = {}, clone.$helpers = {})

            // 渲染 HTML
            var compiled = Handlebars.compile(ast)
            var html = compiled(clone)

            // 扫描占位符，定位 Expression 和 Block
            var content = $('<div>' + html + '</div>')
            if (content.length) scan(content[0], data)
            content = content.contents()

            /*
                返回什么呢
                如果传入了 callback()，则返回 data，因为 callback() 的作用在于处理 content；
                如果 callback() 有返回值，则作为 bind() 的返回值返回，即优先返回 callback() 的返回值；
                如果未传入 callback，则返回 content，因为不返回 content 的话，content 就会被丢弃。

            */
            if (callback) return callback.call(data, content) || data
            return content
        },
        unbind: function unbind(data) {
            // TODO
            return
        }
    }

}));