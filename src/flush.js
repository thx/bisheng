"use strict";

/* global window: true */
/* global document: true */
/* global jqLite: true */
/* global Handlebars: true */
/* global expose */
/* global Loop */
/* global Locator */
/* global Scanner */
/* global HTML */

// CommonJS
if (typeof module === 'object' && module.exports) {
    window = require('jsdom').jsdom().createWindow()
    document = window.document

    // var $ = require('jqLite')
    // var Handlebars = require('handlebars')
}

(function(factory) {

    expose(factory, function() {
        window.Flush = factory()
    })

}(function() {

    // BEGIN(BROWSER)

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
    var Flush = (function() {

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
                slot: 'start',
                path: change.path.join('.')
            }, context || document.body)
            var type

            if ((change.type === 'delete' || change.type === 'add') && change.context instanceof Array) { /*paths.length === 0 && */
                change.path.pop()
                change.type = 'update'
                change.context = change.getContext(change.root, change.path)()
                handle(event, change, defined)
            }

            paths._each(function(path, index) {
                type = Locator.parse(path, 'type')
                if (handle[type]) handle[type](path, event, change, defined)
            })
        }

        // 
        /*
           更新属性对应的 Expression 
           更新文本节点的值。

        */
        handle.text = function text(locator, event, change, defined) {
            var guid = Locator.parse(locator, 'guid')
            var helper = Locator.parse(locator, 'helper')
            var target = Locator.parseTarget(locator)
            var content

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

                HTML.convert(content).contents()
                    .insertAfter(locator)
                    ._each(function(elem, index) {
                        event.target.push(elem)
                    })
                jqLite(target).remove()
            }
        }

        // 更新属性对应的 Expression
        handle.attribute = function attribute(path, event, change, defined) {
            var currentTarget, name, $target;
            event.target.push(currentTarget = Locator.parseTarget(path)[0])
            $target = jqLite(currentTarget)

            var ast = defined.$blocks[Locator.parse(path, 'guid')]
            var value = ast ? Handlebars.compile(ast)(change.context) : change.value
            var oldValue = function() {
                var oldValue
                var context = Loop.clone(change.context, true, change.path.slice(0, -1)) // TODO
                context[change.path[change.path.length - 1]] = change.oldValue !== undefined && change.oldValue !== null ? change.oldValue.valueOf() : change.oldValue
                oldValue = ast ? Handlebars.compile(ast)(context) : change.oldValue
                return oldValue
            }()

            name = Locator.parse(path, 'name')
            switch (name) {
                case 'class':
                    $target.removeClass('' + oldValue).addClass('' + value)
                    break
                case 'bs-style':
                case 'style':
                    $target.css(Locator.parse(path, 'css'), value)
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
                    if (name && $target.prop('checked') && name in change.context) {
                        // setTimeout(function() {
                        change.context[name] = $target.val()
                        // }, 0)
                    }
                    break
                default:
                    // 只更新变化的部分（其实不准确 TODO）
                    $target._attr(name, function(index, attr) {
                        return oldValue === undefined ? value :
                            attr !== oldValue.valueOf() ? attr.replace(oldValue, value) :
                            value
                    })
            }
        }

        // 更新数组对应的 Block，路径 > guid > Block
        handle.block = function block(locator, event, change, defined) {
            var guid = Locator.parse(locator, 'guid')
            var ast = defined.$blocks[guid]
            var context = Loop.clone(change.context, true, change.path.slice(0, -1)) // TODO
            var content = Handlebars.compile(ast)(context)

            content = HTML.convert(content)
            Scanner.scan(content[0], change.context)
            content = content.contents()

            var target = Locator.parseTarget(locator)
            var endLocator = target.length ? target[target.length - 1].nextSibling : locator.nextSibling

            /*
                优化渲染过程：
                1. 移除多余的旧节点
                2. 逐个比较节点类型、节点值、节点内容。
            */

            // 如果新内容是空，则移除所有旧节点
            if (content.length === 0) {
                jqLite(target).remove()
                return
            }
            // 移除旧节点中多余的
            /*
                Fixes Bug
                在 IE8 中调用 array.splice(index , howMany[, element1[, ...[, elementN]]]) 必须传入参数 howMany。
                https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
            */
            if (content.length < target.length) {
                jqLite(target.splice(content.length, target.length - content.length)).remove()
            }

            content._each(function(element, index) {
                // 新正节点
                if (!target[index]) {
                    endLocator.parentNode.insertBefore(element, endLocator)

                    event.target.push(element)
                    return
                }
                // 节点类型有变化，替换之
                if (element.nodeType !== target[index].nodeType) {
                    target[index].parentNode.insertBefore(element, target[index])
                    target[index].parentNode.removeChild(target[index])

                    event.target.push(element)
                    return
                }
                // 同是文本节点，则更新节点值
                if (element.nodeType === 3 && element.nodeValue !== target[index].nodeValue) {
                    target[index].nodeValue = element.nodeValue
                    return
                }
                // 同是注释节点，则更新节点值
                if (element.nodeType === 8 && element.nodeValue !== target[index].nodeValue) {
                    target[index].nodeValue = element.nodeValue
                    return
                }
                // 同是 DOM 元素，则检测属性 outerHTML 是否相等，不相等则替换之
                if (element.nodeType === 1) {
                    // jqLite(target[index]).removeClass('transition highlight')
                    if (element.outerHTML !== target[index].outerHTML) {
                        target[index].parentNode.insertBefore(element, target[index])
                        target[index].parentNode.removeChild(target[index])

                        event.target.push(element)
                        return
                    }
                }
            })
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
                        jqLite(item).wrap('<span>').parent().addClass('transition highlight')
                        setTimeout(function() {
                            jqLite(item).unwrap('<span>').removeClass('transition highlight')
                        }, 500)
                        break
                    case 1:
                        jqLite(item).addClass('transition highlight')
                        setTimeout(function() {
                            jqLite(item).removeClass('transition highlight')
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

    // END(BROWSER)

    return Flush

}));