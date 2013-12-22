/*! src/fix/prefix-1.js */
(function(factory) {
/*! src/expose.js */
    
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

    
/*! src/fix/prefix-2.js */
    expose(factory, function() {
        // Browser globals
        window.BiSheng = factory()
    })
}(function() {
/*! src/loop.js */

    var Loop = (function() {
        var guid = 1;
        var TYPES = {
            ADD: 'add',
            DELETE: 'delete',
            UPDATE: 'update'
        };

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

        // 为所有属性添加监听函数
        function watch(data, fn, fix) {
            var id = guid++;
            var shadow = clone(data, fix, [id]);

            function task() {
                var result = diff(data, shadow, fix ? [id] : [], fix)
                if (result && result.length) {
                    fn(result, data, shadow)
                    shadow = clone(data, fix, [id])
                }
            }
            task.data = data

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
                    if (compare(tasks[index])) tasks.splice(index--, 1)
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
    })()

    
/*! src/ast.js */

    var AST = (function() {

        var guid = 1;

        var ifHelper = Handlebars.helpers['if']
        Handlebars.registerHelper('if', function(conditional, options) {
            return ifHelper.call(this, conditional !== undefined ? conditional.valueOf() : conditional, options)
        })

        var blockHelperMissing = Handlebars.helpers.blockHelperMissing
        Handlebars.registerHelper('blockHelperMissing', function(context, options) {
            return blockHelperMissing.call(this, context !== undefined ? context.valueOf() : context, options)
        })

        Handlebars.registerHelper('$lastest', function(items, options) {
            return items && items.$path || this && this.$path
        })

        return {
            createPathHTML: function createPathHTML(attrs) {
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
                * AST.handle(node)
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

                placeholder = this.createPathHTML({
                    guid: attrs.guid,
                    slot: 'end'
                })
                statements = Handlebars.parse(placeholder).statements
                context.splice.apply(context, [index + 4, 0].concat(statements))

                if (helpers) helpers[guid] = {
                    constructor: Handlebars.AST.ProgramNode,
                    type: 'program',
                    statements: [node]
                }

                guid++

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

                placeholder = this.createPathHTML({
                    guid: attrs.guid,
                    slot: 'end'
                })
                statements = Handlebars.parse(placeholder).statements
                context.splice.apply(context, [index + 4, 0].concat(statements))

                if (blocks) blocks[guid] = {
                    constructor: Handlebars.AST.ProgramNode,
                    type: 'program',
                    statements: [node]
                }

                guid++

                node.binded = true

                this.handle(node.program || node.inverse, context, index, blocks, helpers)
            }
        }
    })()

    
/*! src/scan.js */

    var Scanner = (function() {

        // 入口方法
        function scan(node, data) {
            // data > dom, expression
            scanNode(node)
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
                    scanTexNode(node)
                    break
            }
        }

        /*
            扫描文本节点
        */
        function scanTexNode(node) {
            var content = node.textContent || node.innerText || node.nodeValue
            $('<div>' + content + '</div>')
                .contents()
                .each(function(index, elem) {
                    if (elem.nodeName.toLowerCase() === 'script' && elem.getAttribute('path')) {
                        if (!elem.getAttribute('type')) elem.setAttribute('type', 'text')
                    }
                })
                .replaceAll(node)
        }

        /*
            扫描属性
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

        // 扫描子节点
        function scanChildNode(node) {
            $(node.childNodes).each(function(index, childNode) {
                scanNode(childNode)
            })
        }

        // 扫描表单元素
        function scanFormElements(node, data) {
            $('script[slot="start"][type="attribute"][name="value"]', node).each(function(index, script) {
                var path = $(script).attr('path').split('.'),
                    target = script;

                while ((target = target.nextSibling)) {
                    if (target.nodeName.toLowerCase() !== 'script') break
                }

                // TODO 为什么不触发 change 事件？
                $(target).on('keyup', function(event) {
                    updateValue(data, path, event.target)
                })
            })

            $('script[slot="start"][type="attribute"][name="checked"]', node).each(function(_, script) {
                var path = $(script).attr('path').split('.'),
                    target = script;

                while ((target = target.nextSibling)) {
                    if (target.nodeName.toLowerCase() !== 'script') break
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
            更新属性 value 对应的数据
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
                            $target.data('user is editing', true)
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

        /*
            更新属性 checked 对应的数据
        */
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

        return {
            scan: scan
        }

    })()


    
/*! src/flush.js */

    var Flush = (function() {

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
            var target = []
            var cur, $cur
            var content

            cur = path
            while ((cur = cur.nextSibling)) {
                $cur = $(cur)
                if (cur.nodeName.toLowerCase() === 'script' &&
                    $cur.attr('slot') === 'end' &&
                    $cur.attr('guid') === guid) {
                    break
                } else {
                    target.push(cur)
                }
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
                    if ($target.val() !== value && !$target.data('user is editing')) {
                        $target.val(value)
                    }
                    $target.data('user is editing', false)
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
            var ast = defined.$blocks[guid]
            var context = Loop.clone(change.context, true, change.path.slice(0, -1)) // TODO
            var content = Handlebars.compile(ast)(context)

            content = $('<div>' + content + '</div>')
            Scanner.scan(content[0], change.context)
            content = content.contents()

            var cur = path
            var $cur
            var to
            var target = []

            while ((cur = cur.nextSibling)) {
                $cur = $(cur)
                if (cur.nodeName.toLowerCase() === 'script' &&
                    $cur.attr('slot') === 'end' &&
                    $cur.attr('guid') === guid) {
                    to = cur
                    break
                } else {
                    target.push(cur)
                }
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

        return {
            handle: handle,
            scrollIntoView: scrollIntoView,
            highlight: highlight
        }

    })()

    
/*! src/bisheng.js */

    /*
        ## BiSheng

        双向绑定的入口对象，含有两个方法：BiSheng.bind(data, tpl, callback) 和 BiSheng.unbind(data)。
    */
    var BiSheng = {
        version: '0.1.0',

        /*
            ### BiSheng.bind(data, tpl, callback(content))

            执行模板和数据的双向绑定。

            * BiSheng.bind(data, tpl, callback(content))

            **参数的含义和默认值**如下所示：

            * 参数 data：必选。待绑定的对象或数组。
            * 参数 tpl：必选。待绑定的 HTML 模板。在绑定过程中，先把 HTML 模板转换为 DOM 元素，然后将“绑定”数据到 DOM 元素。目前只支持 Handlebars.js 语法。
            * 参数 callback(content)：必选。回调函数，当绑定完成后被执行。执行该函数时，会把转换后的 DOM 元素作为参数 content 传入。

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

        */
        bind: function bind(data, tpl, callback) {
            // 为所有属性添加监听函数
            var clone = Loop.watch(data, function(changes) {
                // console.log(JSON.stringify(changes, null, 2))
                $.each(changes, function(_, change) {
                    var event = {
                        target: []
                    }
                    Flush.handle(event, change, clone)
                    if (location.href.indexOf('scrollIntoView') > -1) Flush.scrollIntoView(event, data)
                    if (location.href.indexOf('highlight') > -1) Flush.highlight(event, data)
                })
            }, true)

            // 修改 AST，为 Expression 和 Block 插入占位符
            var ast = Handlebars.parse(tpl)
            AST.handle(ast, undefined, undefined, clone.$blocks = {}, clone.$helpers = {})

            // 渲染 HTML
            var compiled = Handlebars.compile(ast)
            var html = compiled(clone)

            // 扫描占位符，定位 Expression 和 Block
            var content = $('<div>' + html + '</div>')
            if (content.length) Scanner.scan(content[0], data)
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
            Loop.unwatch(data)
            return this
        }
    }

    
/*! src/fix/suffix.js */
	BiSheng.Loop = Loop
	BiSheng.AST = AST
	BiSheng.Flush = Flush

	return BiSheng
}));