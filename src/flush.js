"use strict";
/* global document */
/* global $ */
/* global Handlebars */
/* global Watch */
/* global Bind */
(function() {
    var slice = [].slice;
    var define = Watch.define;

    define.flush = function flush(defined) {
        Watch.watch(defined, ['change'], function(event, data) {
            Watch.define.defining.push(true)

            event.target = [] // 用于收集 Expression 对应的 Element

            if (typeof data.value === 'function') data.value.call(data.context)

            handle(event, data, defined)

            // 路径 > guid > Block
            /*if (data.value instanceof Array) {
                // 更新数组对应的 Block
                updateBlock(event, data, defined)
            } else {
                // 更新属性对应的 Expression
                updateExpression(event, data, defined)
            }*/

            if (event.type === 'change') {
                scrollIntoView(event, data)
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

    handle.text = function text(path, event, data, defined) {
        var currentTarget
        event.target.push(currentTarget = expressionTarget(path))
        currentTarget.nodeValue = data.value
    }

    handle.attribute = function attribute(path, event, data, defined) {
        var currentTarget, name;
        event.target.push(currentTarget = expressionTarget(path))
        name = path.getAttribute('name')
        switch (name) {
            case 'class':
                $(currentTarget).removeClass(data.oldValue).addClass(data.value)
                break
            case 'style':
                $(currentTarget).css(path.getAttribute('css'), data.value)
                break
            case 'value':
                if ($(currentTarget).val() !== data.value) $(currentTarget).val(data.value)
                $(currentTarget).attr('data-prev-value', data.oldValue)
                break
            default:
                $(currentTarget).attr(name, data.value)
        }
    }

    handle.block = function block(path, event, data, defined) {
        var guid = path.getAttribute('guid')
        var endPath = document.querySelector('script[slot="end"][guid="' + guid + '"]')
        var ast = defined.$blocks[guid]

        Bind.binding.push(true)
        var content = Handlebars.compile(ast)(data.context)
        Bind.binding.pop()

        content = $(content)
        if (content.length) Bind.scan(content[0].parentNode, defined)

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

    function scrollIntoView(event, data) {
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
})()