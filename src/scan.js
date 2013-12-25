"use strict";

/* global window: true */
/* global expose */
/* global $: true */
/* global Locator */

(function(factory) {

    expose(factory, function() {
        window.Scanner = factory()
    })

}(function() {
    // BEGIN(BROWSER)

    /*
        # Scanner

        扫描 DOM 元素，解析定位符

    */
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
                    Locator.update(elem, {
                        type: 'text'
                    })
                })
                .replaceAll(node)
        }

        /*
            扫描属性
        */
        function scanAttributes(node) {
            var reph = Locator.getLocatorRegExp()
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
                                    Locator.update($('<div>' + ma[1] + '</div>').contents()[0], {
                                        type: 'attribute',
                                        name: attributeNode.nodeName.toLowerCase(),
                                        css: $.trim(stylema[1])
                                    })
                                )
                            }
                        }

                    } else {
                        reph.exec('')
                        while ((ma = reph.exec(nodeValue))) {
                            attributes.push(
                                Locator.update($('<div>' + ma[1] + '</div>').contents()[0], {
                                    type: 'attribute',
                                    name: attributeNode.nodeName.toLowerCase()
                                }, true)
                            )
                        }
                    }

                    if (attributes.length) {
                        nodeValue = nodeValue.replace(reph, '')
                        attributeNode.nodeValue = nodeValue

                        $(attributes).each(function(index, elem) {
                            var slot = Locator.parse(elem, 'slot')
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
            Locator.find({
                slot: "start",
                type: "attribute",
                name: "value"
            }, node).each(function(index, locator) {
                var path = Locator.parse(locator, 'path').split('.'),
                    target = Locator.parseTarget(locator)[0];

                // TODO 为什么不触发 change 事件？
                $(target).on('change keyup', function(event) {
                    updateValue(data, path, event.target)
                })
            })

            Locator.find({
                slot: "start",
                type: "attribute",
                name: "checked"
            }, node).each(function(_, locator) {
                var path = Locator.parse(locator, 'path').split('.'),
                    target = Locator.parseTarget(locator)[0];

                var value = data
                for (var index = 1; index < path.length; index++) {
                    value = value[path[index]]
                }
                // 如果 checked 的初始值是 false 或 "false"，则初始化为未选中。
                if (value === undefined || value.valueOf() === false || value.valueOf() === 'false') {
                    $(target).prop('checked', false)
                }
                if (value !== undefined &&
                    (value.valueOf() === true || value.valueOf() === 'true' || value.valueOf() === 'checked')) {
                    $(target).prop('checked', true)
                }

                $(target).on('change', function(event, firing) {
                    // radio：点击其中一个后，需要同步更新同名的其他 radio
                    if (!firing && event.target.type === 'radio') {
                        $('input:radio[name="' + event.target.name + '"]')
                            .not(event.target)
                            .trigger('change', firing = true)
                    }
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
                value, name
            switch (target.nodeName.toLowerCase()) {
                case 'input':
                    switch (target.type) {
                        case 'radio': // TODO
                            value = $target.prop('checked')
                            name = $target.attr('name')
                            if (name && value && name in data) data[name] = $target.val()
                            break
                        case 'checkbox': // TODO
                            value = $target.prop('checked')
                            break
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


    // END(BROWSER)

    return Scanner

}));