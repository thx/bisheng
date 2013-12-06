/*
    Jekyll and Hyde

    MutationObserver
        https://developer.mozilla.org/zh-CN/docs/DOM/MutationObserver
    https://github.com/melanke/Watch.JS
        watch(obj, prop, fn(prop, action, newValue, oldValue))
        watch(obj, [prop [, prop]], fn)
        watch(obj, fn)
    http://kangax.github.io/es5-compat-table/
    getOwnPropertyDescriptor
        https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyDescriptor

    type: text, attribute, block
*/

"use strict";

/* global define */
/* global window: true */
/* global $: true */
/* global KISSY */
/* global Handlebars: true */
/* global Watch: true */

// CommonJS
if (typeof module === 'object' && module.exports) {
    window = require('jsdom').jsdom().createWindow()
    // document = window.document

    // var $ = require('jquery')
    // var Watch = require('./watch')
    // var Handlebars = require('handlebars')
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
        ['binding'].forEach(function(name, index) {
            KISSY.add(name, function(S) {
                return factory()
            }, {
                requires: []
            })
        })

    } else {
        // Browser globals
        window.Bind = factory()
        window.bind = window.Bind.bind
        window.unbind = window.Bind.unbind
    }

}(function() {

    if (!Watch || !Watch.define) return

    var slice = [].slice
    var guid = 1;

    function lastest() {
        if (arguments.length) lastest.path = arguments[0]
        else {
            return lastest.path
        }
    }

    function createPathHTML(attrs) {
        // attrs.guid = attrs.guid || guid++
        var escape = Handlebars.Utils.escapeExpression

        var pathHTML = escape('<script')
        for (var key in attrs) {
            if (attrs[key] === undefined) continue
            pathHTML += ' ' + key + escape('="') + attrs[key] + escape('"')
        }
        pathHTML += escape('></script>')

        return pathHTML
    }

    Watch.define.hook = {
        set: function() {},
        get: function(root, path, value) {
            lastest(path)
            return

            var phTpl = '<script path="{{.}}"></script>'
            if (!Bind.binding.length) return
            if (typeof value !== 'object' && !~('' + value).indexOf('<script path="')) {
                var ph = Handlebars.compile(phTpl)(path.join('.'))
                return ph + value + ph
            }
        }
    }

    var AST = {
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

            if (AST[node.type]) AST[node.type](node, context, index, blocks, helpers)

            return node
        },

        program: function program(node, context, index, blocks, helpers) {
            for (var i = 0; i < node.statements.length; i++) {
                AST.handle(node.statements[i], node.statements, i, blocks, helpers)
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
            placeholder = createPathHTML(attrs)
            statements = Handlebars.parse(placeholder).statements
            statements[1].binded = true
            context.splice.apply(context, [index, 0].concat(statements))

            attrs.slot = 'end'
            placeholder = createPathHTML(attrs)
            statements = Handlebars.parse(placeholder).statements
            statements[1].binded = true
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
            placeholder = createPathHTML(attrs)
            statements = Handlebars.parse(placeholder).statements
            statements[1].binded = true
            context.splice.apply(context, [index, 0].concat(statements))

            attrs.slot = 'end'
            placeholder = createPathHTML(attrs)
            statements = Handlebars.parse(placeholder).statements
            statements[1].binded = true
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

            AST.handle(node.program || node.inverse, context, index, blocks, helpers)
        }
    };

    /*
     
     */

    /*['blockHelperMissing', 'each', 'with'].forEach(function(name, index) {
        Handlebars.helpers['_' + name] = Handlebars.helpers[name]
        Handlebars.helpers[name] = function(context, options) {
            var ret = Handlebars.helpers['_' + name](context, options)
            var $path = '<!--' + context.$path.join('.') + '-->'
            return $path + ret
        }
    });

    ['if', 'unless'].forEach(function(name, index) {
        Handlebars.helpers['_' + name] = Handlebars.helpers[name]
        Handlebars.helpers[name] = function(conditional, options) {
            var ret = Handlebars.helpers['_' + name](conditional, options)
            var $path = '<!--' + conditional.$path.join('.') + '-->'
            return $path + ret
        }
    });*/

    Handlebars.registerHelper('$lastest', function(items, options) {
        // 只为访问一遍 items，已记录路径
        return lastest() && lastest().join('.') || ''
    })

    /*
        扫描器
    */

    function scan(node, data) {
        // return
        // data > dom, expression
        scanNode(node)
        // data > dom, block
        scanBlocks(node)
        // dom > data
        scanFormElements(node, data)
    }

    // 
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
        var content = node.textContent || node.innerText
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
        slice.call(node.attributes || [], 0).forEach(function(attributeNode, index) {
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
                                css: stylema[1].trim()
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
                            name: attributeNode.nodeName.toLowerCase(),
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
        })
    }

    function scanChildNode(node) {
        var childNodes = slice.call(node.childNodes, 0)
        childNodes.forEach(function(childNode, index, childNodes) {
            scanNode(childNode)
        })
    }

    function scanBlocks(node) {
        var selector = 'script[slot="start"][type="block"]'
        var blocks = slice.call(node.querySelectorAll(selector) || [], 0)
        var path
        blocks.forEach(function(item, index) {
            if (item.nextSibling.nodeType === 8) {
                path = item.nextSibling.nodeValue
                path = path.split(',')
                path = path.length > 2 ? path.slice(0, -1).join('.') : path
                item.setAttribute('path', path)

                var guid = item.getAttribute('guid')
                slice.call(node.querySelectorAll('script[slot="end"][type="block"][guid="' + guid + '"]') || [], 0)
                    .forEach(function(end) {
                        end.setAttribute('path', path)
                    })
            }
        })
    }

    function scanFormElements(node, data) {
        slice.call(
            node.querySelectorAll('script[slot="start"][type="attribute"][name="value"]') || [],
            0
        ).forEach(function(script, index) {
            var path = $(script).attr('path').split('.'),
                target = script;

            while ((target = target.nextSibling)) {
                if (target.nodeName !== 'SCRIPT') break
            }

            $(target).on('change', function(event) {
                updateValue(data, path, event.target)
            })
        })

        slice.call(
            node.querySelectorAll('script[slot="start"][type="attribute"][name="checked"]') || [],
            0
        ).forEach(function(script) {
            var path = $(script).attr('path').split('.'),
                target = script;

            while ((target = target.nextSibling)) {
                if (target.nodeName !== 'SCRIPT') break
            }

            var value = data
            Watch.define.defining.push(true) // 暂停事件
            for (var index = 1; index < path.length; index++) {
                value = value[path[index]]
            }
            Watch.define.defining.pop() // 恢复事件
            // 如果 checked 的初始值是 false 或 "false"，则初始化为未选中。
            if (value.valueOf() === false || value.valueOf() === 'false') $(target).prop('checked', false)

            $(target).on('change', function(event) {
                console.log(event.type);
                updateChecked(data, path, event.target)
            })
        })
    }

    /*
     */
    function updateValue(data, path, target) {
        for (var index = 1; index < path.length - 2; index++) {
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
        for (var index = 1; index < path.length - 2; index++) {
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

                        var name = $target.attr('name')
                        if (name && value) data[name] = $target.val()
                }
                break
            default:
        }

        data[path[path.length - 1]] = value
    }

    /*
     
     */
    function bind(data, tpl, callback) {
        Watch.define.defining.push(true) // 暂停监听事件

        // 定义数据
        Watch.watch(data)

        // 修改 AST，插入 Block 占位符
        var ast = Handlebars.parse(tpl)
        // console.log(JSON.stringify(ast, null, 4));
        AST.handle(ast, undefined, undefined, data.$blocks = {}, data.$helpers = {})
        // console.log(JSON.stringify(ast, null, 4));

        // 渲染 HTML
        var compiled = Handlebars.compile(ast)
        var html = compiled(data)
        // console.log(html)

        Watch.define.defining.pop() // 恢复监听事件

        // 扫描占位符，定位 Expression 和 Block
        var content = $('<div>' + html + '</div>')
        if (content.length) scan(content[0], data)
        content = content.contents()

        /*
            TODO 返回什么呢
            如果传入了 callback()，则返回 data，因为 callback() 的作用在于处理 content；
            如果 callback() 有返回值，则作为 bind() 的返回值返回，即优先返回 callback() 的返回值；
            如果未传入 callback，则返回 content，因为不返回 content 的话，content 就会被丢弃。

        */
        if (callback) return callback.call(data, content) || data
        return content
    }

    function unbind(data) {
        return data.$data
    }

    // expose
    function Bind() {}
    Bind.AST = AST
    Bind.scan = scan
    Bind.bind = bind
    Bind.unbind = unbind

    return Bind

}));