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
/* global window */
/* global document */
/* global $ */
/* global KISSY */
/* global Handlebars: true */
/* global Watch: true */

// CommonJS
if (typeof module === 'object' && module.exports) {
    var Watch = require('./watch')
    var Handlebars = require('handlebars')
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
    var phTpl = '<script value="{{{.}}}"></script>'
    var reph = /(<script value="(.*?)"><\/script>)(.*?)(\1)/ig
    var restyle = /([^;]*?): ([^;]*)/ig
    var guid = 1;


    function createPathHTML(attrs) {
        // attrs.guid = attrs.guid || guid++

        var pathHTML = '<script'
        for (var key in attrs) {
            pathHTML += ' ' + key + '="' + attrs[key] + '"'
        }
        pathHTML += '></script>'

        return pathHTML
    }

    function createPathNode(attrs) {
        // attrs.guid = attrs.guid || guid++
        return $('<script>').attr(attrs)[0]
    }

    Watch.define.hook = {
        set: function() {},
        get: function(root, path, value) {
            if (!Bind.binding.length) return
            if (typeof value !== 'object' && !~('' + value).indexOf('<script value="')) {
                var ph = Handlebars.compile(phTpl)(path.join('.'))
                return ph + value + ph
            }
        }
    }

    var AST = {
        /*
            * AST.handle(node, blocks)
                公开方法
            * AST.handle(node, context, index, blocks)
                用于内部递归修改 AST
        */
        handle: function handle(node, context, index, blocks) {
            if (arguments.length === 2) {
                blocks = context
                context = undefined
            }

            if (AST[node.type]) AST[node.type](node, context, index, blocks)

            return node
        },

        program: function program(node, context, index, blocks) {
            for (var i = 0; i < node.statements.length; i++) {
                AST.handle(node.statements[i], node.statements, i, blocks)
            }
        },
        // 为 Expression 插入占位符
        mustache_bak: function(node, context, index, blocks) {
            var prop = node.id.string

            if (!node.guid) node.guid = guid
            if (node.binded) return

            context.splice(index, 0, {
                constructor: Handlebars.AST.ContentNode,
                type: 'content',
                string: createPathHTML({
                    guid: guid,
                    slot: 'start',
                    type: 'expression',
                    path: prop
                })
            })
            context.splice(index + 2, 0, {
                constructor: Handlebars.AST.ContentNode,
                type: 'content',
                string: createPathHTML({
                    guid: guid,
                    slot: 'end',
                    type: 'expression',
                    path: prop
                })
            })

            guid++

            node.binded = true

        },
        // 为 Block 插入占位符
        block: function block(node, context, index, blocks) {
            if (node.binded) return

            var helper, prop
            if (node.mustache.params.length === 0) {
                helper = ''
                prop = node.mustache.id.string
            } else {
                helper = node.mustache.id.string
                prop = node.mustache.params[0].string
            }

            if (!node.guid) node.guid = guid

            // mustache 定义 DOM 位置
            context.splice(index, 0, {
                type: 'content',
                string: createPathHTML({
                    guid: guid,
                    slot: 'start',
                    type: 'block',
                    path: prop,
                    helper: helper
                })
            })
            context.splice(index + 2, 0, {
                type: 'content',
                string: createPathHTML({
                    guid: guid,
                    slot: 'end',
                    type: 'block',
                    path: prop,
                    helper: helper
                })
            })

            blocks[guid++] = {
                constructor: Handlebars.AST.ProgramNode,
                type: 'program',
                statements: [node]
            }

            // program 定义数据路径（废弃，转而通过 helper 插入）

            node.program && node.program.statements.unshift.apply(
                node.program.statements,
                Handlebars.parse('<!--{{$path}}-->').statements
            )
            node.inverse && node.inverse.statements.unshift.apply(
                node.inverse.statements,
                Handlebars.parse('<!--{{$path}}-->').statements
            )


            node.binded = true

            AST.handle(node.program || node.inverse, context, index, blocks)
        }
    };

    /*
     
     */

    ['blockHelperMissing', 'each', 'with'].forEach(function(name, index) {
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
    });

    // Handlebars.registerHelper('$path', function(items, options) {
    //     return this.$path.join('.')
    // })

    /*
        扫描器
    */

    function scan(node, data) {
        // data > dom, expression
        scanNode(node)
        // data > dom, block
        scanBlocks(node)
        // dom > data
        scanFormElements(node, data)
    }

    // 
    function scanNode(node) {
        scanAttributes(node)
        switch (node.nodeType) {
            case 1: // Element
            case 9: // Document
            case 11: // DocumentFragment
                scanChilddNode(node)
                break
            case 3: // Text
                replaceTexNode(node)
                break
        }
    }

    /*
        <path value="" type="text"></path>
    */
    function replaceTexNode(node) {
        var content = node.textContent || node.innerText,
            nodes = [],
            startIndex = 0,
            endIndex = 0,
            ma;

        reph.exec('')
        while ((ma = reph.exec(content))) {
            endIndex = reph.lastIndex - ma[0].length
            nodes.push(document.createTextNode(content.slice(startIndex, endIndex)))
            nodes.push(
                createPathNode({
                    // guid: guid, // TextNode 不需要 guid
                    slot: 'start',
                    type: 'text',
                    path: ma[2]
                })
            )
            nodes.push(document.createTextNode(ma[3]))
            nodes.push(
                createPathNode({
                    // guid: guid++,
                    slot: 'end',
                    type: 'text',
                    path: ma[2]
                })
            )
            startIndex = reph.lastIndex
        }
        if (startIndex > 0) {
            endIndex = content.length
            nodes.push(document.createTextNode(content.slice(startIndex, endIndex)))
        }

        if (nodes.length) {
            nodes.forEach(function(item, index) {
                node.parentNode.insertBefore(item, node)
            })
            node.parentNode.removeChild(node)
        }
    }

    /*
        <path value="" type="attribute" name="" ></path>
    */
    function scanAttributes(node) {
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
                            createPathNode({
                                // guid: guid++, // attributeNode 不需要 guid
                                slot: 'start',
                                type: 'attribute',
                                name: nodeName,
                                css: stylema[1].trim(),
                                path: ma[2]
                            })
                        )
                    }
                }

            } else {
                reph.exec('')
                while ((ma = reph.exec(nodeValue))) {
                    attributes.push(
                        createPathNode({
                            // guid: guid++,
                            slot: 'start',
                            type: 'attribute',
                            name: attributeNode.nodeName,
                            path: ma[2]
                        })
                    )
                }
            }

            if (attributes.length) {
                nodeValue = nodeValue.replace(reph, '$3')
                attributeNode.nodeValue = nodeValue

                attributes.forEach(function(item, index) {
                    node.parentNode.insertBefore(item, node)
                })
            }
        })
    }

    function scanChilddNode(node) {
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

    /*
     */
    function updateDate(data, path, target) {
        for (var index = 1; index < path.length - 2; index++) {
            data = data[path[index]]
        }

        var value
        switch (target.nodeName.toLowerCase()) {
            case 'input':
                switch (target.type) {
                    case 'text':
                        value = $(target).val()
                        break;
                    case 'radio': // TODO
                        // value = $(target).prop('checked') ? $(target).val() : undefined
                        value = $(target).val()
                        break
                    case 'checkbox': // TODO
                        // value = $(target).prop('checked') ? $(target).val() || $(target).attr('data-prev-value') : ''
                        value = $(target).val()
                        break
                    default:
                        value = $(target).val()
                }
                break
            case 'select':
                value = $(target).val()
                break
            case 'textarea':
                value = $(target).val()
                break
            default:
                value = $(target).val()
        }

        data[path[path.length - 1]] = value
    }

    function scanFormElements(node, data) {
        var selector = 'script[type="attribute"][name="value"]'
        var scripts = slice.call(node.querySelectorAll(selector) || [], 0)
        scripts.forEach(function(script, index) {
            var path = $(script).attr('path').split('.'),
                target = script;

            while ((target = target.nextSibling)) {
                if (target.nodeName !== 'SCRIPT') break
            }

            $(target).on('change keyup', function(event) {
                updateDate(data, path, event.target)
            })
        })
    }

    function bind(data, tpl, callback) {
        Watch.define.defining.push(true) // 暂停监听事件
        Bind.binding.push(true) // 允许插入 Expression 占位符

        // 定义数据
        Watch.watch(data)

        // 修改 AST，插入 Block 占位符
        var ast = Handlebars.parse(tpl)
        // console.log(JSON.stringify(ast, null, 4));
        AST.handle(ast, undefined, undefined, data.$blocks = {})
        // console.log(JSON.stringify(ast, null, 4));

        // 渲染 HTML
        var compiled = Handlebars.compile(ast)
        var html = compiled(data)
        // console.log(html)

        Bind.binding.pop() // 恢复监听事件
        Watch.define.defining.pop() // 禁止插入 Expression 占位符

        // 扫描占位符，定位 Expression 和 Block
        var content = $(html)
        if (content.length) scan(content[0].parentNode, data)

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
    Bind.binding = []
    Bind.AST = AST
    Bind.scan = scan
    Bind.bind = bind
    Bind.unbind = unbind

    return Bind

}));