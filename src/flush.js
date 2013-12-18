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