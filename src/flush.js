"use strict";

/* global define */
/* global window: true */
/* global document: true */
/* global location */
/* global $: true */
/* global KISSY */
/* global Handlebars: true */
/* global Watch: true */
/* global Bind */

// CommonJS
if (typeof module === 'object' && module.exports) {
    window = require('jsdom').jsdom().createWindow()
    document = window.document

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
        ['flush'].forEach(function(name, index) {
            KISSY.add(name, function(S) {
                return factory()
            }, {
                requires: []
            })
        })

    } else {
        // Browser globals
        window.Flush = factory()
    }

}(function() {

    var slice = [].slice;
    var define = Watch.define;

    define.flush = function flush(defined) {
        Watch.watch(defined, ['change'], function(event, data) {
            Watch.define.defining.push(true)

            event.target = [] // 用于收集 Expression 对应的 Element

            if (typeof data.value === 'function') data.value.call(data.context)

            handle(event, data, defined)

            if (event.type === 'change') {
                if (location.href.indexOf('scrollIntoView') > -1) scrollIntoView(event, data)
                highlight(event, data)
            }

            Watch.define.defining.pop()
        })
    }

    function expressionTarget(node) {
        while ((node = node.nextSibling)) {
            if (node.nodeName !== 'SCRIPT') return node
        }
    }

    function handle(event, data, defined) {
        var selector = 'script[slot="start"][path="' + data.path.join('.') + '"]'
        var paths = slice.call(document.querySelectorAll(selector) || [], 0)
        var type
        paths.forEach(function(path, index) {
            type = path.getAttribute('type')
            if (handle[type]) handle[type](path, event, data, defined)
        })
    }

    // 更新属性对应的 Expression
    handle.text = function text(path, event, data, defined) {
        var guid = path.getAttribute('guid')
        var helper = path.getAttribute('helper')
        var endPath = document.querySelector('script[slot="end"][guid="' + guid + '"]')
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
            target[0].nodeValue = data.value

            event.target.push(target[0])

        } else {
            // Element
            if (helper === 'true') {
                content = Handlebars.compile(defined.$helpers[guid])(data.context)
            } else {
                content = data.value
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
    handle.attribute = function attribute(path, event, data, defined) {
        var currentTarget, name, $target;
        event.target.push(currentTarget = expressionTarget(path))
        $target = $(currentTarget)

        name = path.getAttribute('name')
        switch (name) {
            case 'class':
                $target.removeClass(data.oldValue).addClass(data.value)
                break
            case 'style':
                $target.css(path.getAttribute('css'), data.value)
                break
            case 'value':
                if ($target.val() !== data.value) $target.val(data.value)
                break
            case 'checked':
                $target.prop(name, data.value)

                name = $target.attr('name')
                if (name && $target.prop('checked')) {
                    setTimeout(function() {
                        data.context[name] = $target.val()
                    }, 0)
                }
                break
            default:
                $target.attr(name, data.value)
        }
    }

    // 更新数组对应的 Block，路径 > guid > Block
    handle.block = function block(path, event, data, defined) {
        var guid = path.getAttribute('guid')
        var endPath = document.querySelector('script[slot="end"][guid="' + guid + '"]')
        var ast = defined.$blocks[guid]
        var content = Handlebars.compile(ast)(data.context)

        content = $('<div>' + content + '</div>')
        Bind.scan(content[0], defined)
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
            if (element.nodeType === 1 && element.outerHTML !== target[index].outerHTML) {
                target[index].parentNode.insertBefore(element, target[index])
                target[index].parentNode.removeChild(target[index])

                event.target.push(element)
                return
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
    function scrollIntoView(event, data) {
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

    function highlight(event, data) {
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
                        $(item).unwrap('<span>').removeClass('highlight')
                        // $(item.parentNode).removeClass('highlight')
                    }, 500)
                    break
                case 1:
                    $(item).addClass('transition highlight')
                    setTimeout(function() {
                        $(item).removeClass('highlight')
                    }, 500)
                    break
            }
        })
    }

    // expose
    function Flush() {}
    Flush.flush = define.flush
    Flush.handle = handle

    return Flush

}));