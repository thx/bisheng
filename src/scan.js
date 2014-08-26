"use strict";

/* global window: true */
/* global expose */
/* global jqLite: true */
/* global Loop */
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
            jqLite('<div>' + content + '</div>')
                .contents()
                ._each(function(elem, index) {
                    Locator.update(elem, {
                        type: 'text'
                    })
                })
                .replaceAll(node)
        }

        /*
            扫描属性
        */

        var AttributeHooks = {
            'bs-style': {
                name: 'style',
                setup: function() {},
                teardown: function(node, value) {
                    jqLite(node).attr('style', value)
                }
            },
            'bs-src': {
                name: 'src',
                setup: function() {},
                teardown: function(node, value) {
                    jqLite(node).attr('src', value)
                }
            },
            'bs-checked': {
                name: 'checked',
                setup: function() {},
                teardown: function(node, value) {
                    if (value === 'true') jqLite(node).attr('checked', 'checked')
                }
            }
        };

        function scanAttributes(node) {
            var reph = Locator.getLocatorRegExp()
            var restyle = /([^;]*?): ([^;]*)/ig

            var attributes = []
            jqLite._each(
                // “Array.prototype.slice: 'this' is not a JavaScript object” error in IE8
                // slice.call(node.attributes || [], 0)
                function() {
                    var re = []
                    var all = node.attributes
                    for (var i = 0; i < all.length; i++) {
                        /*
                            Fixes bug:
                            在 IE6 中，input.attributeNode('value').specified 为 false，导致取不到 value 属性。
                            所以，增加了对 nodeValue 的判断。
                        */
                        if (all[i].specified || all[i].nodeValue) re.push(all[i])
                    }
                    return re
                }(),
                function(attributeNode, index) {

                    var nodeName = attributeNode.nodeName,
                        nodeValue = attributeNode.nodeValue,
                        ma, stylema, hook;

                    nodeName = nodeName.toLowerCase()
                    hook = AttributeHooks[nodeName]
                    nodeName = hook ? hook.name : nodeName

                    if (nodeName === 'style') {
                        restyle.exec('')
                        while ((stylema = restyle.exec(nodeValue))) {
                            reph.exec('')
                            while ((ma = reph.exec(stylema[2]))) {
                                attributes.push(
                                    Locator.update(jqLite('<div>' + ma[1] + '</div>').contents()[0], {
                                        type: 'attribute',
                                        name: nodeName,
                                        css: jqLite.trim(stylema[1])
                                    }, true)
                                )
                            }
                        }

                    } else {
                        reph.exec('')
                        while ((ma = reph.exec(nodeValue))) {
                            attributes.push(
                                /*
                                    Fixes bug:
                                    在 IE6 中，占位符中的空格依然是 `%20`，需要手动转义。
                                */
                                Locator.update(jqLite('<div>' + decodeURIComponent(ma[1]) + '</div>').contents()[0], {
                                    type: 'attribute',
                                    name: nodeName
                                }, true)
                            )
                        }
                    }

                    if (attributes.length) {
                        nodeValue = nodeValue.replace(reph, '')
                        attributeNode.nodeValue = nodeValue

                        jqLite(attributes)._each(function(elem, index) {
                            var slot = Locator.parse(elem, 'slot')
                            if (slot === 'start') jqLite(node).before(elem)
                            if (slot === 'end') jqLite(node).after(elem)
                        })

                    }

                    if (hook) hook.teardown(node, nodeValue)
                }
            )
        }

        // 扫描子节点
        function scanChildNode(node) {
            jqLite(node.childNodes)._each(function(childNode, index) {
                scanNode(childNode)
            })
        }

        // 扫描表单元素
        function scanFormElements(node, data) {
            Locator.find({
                slot: "start",
                type: "attribute",
                name: "value"
            }, node)._each(function(locator, index) {
                var path = Locator.parse(locator, 'path').split('.'),
                    target = Locator.parseTarget(locator)[0];

                // TODO 为什么不触发 change 事件？
                jqLite(target).on('change.bisheng keyup.bisheng', function(event) {
                    updateValue(data, path, event.target)
                    if (!Loop.auto()) Loop.letMeSee()
                })
            })

            Locator.find({
                slot: "start",
                type: "attribute",
                name: "checked"
            }, node)._each(function(locator, _) {
                var path = Locator.parse(locator, 'path').split('.'),
                    target = Locator.parseTarget(locator)[0];

                var value = data
                for (var index = 1; index < path.length; index++) {
                    value = value[path[index]]
                }
                // 如果 checked 的初始值是 false 或 "false"，则初始化为未选中。
                if (value === undefined || value === null || value.valueOf() === false || value.valueOf() === 'false') {
                    jqLite(target).prop('checked', false)
                }
                if (value !== undefined && value !== null &&
                    (value.valueOf() === true || value.valueOf() === 'true' || value.valueOf() === 'checked')) {
                    jqLite(target).prop('checked', true)
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
                jqLite(target).on('change.bisheng', function(event, extraParameters) {
                    if (event.target.type === 'radio' &&
                        // jQuery && KISSY 
                        (!extraParameters && !event.firing)
                    ) {
                        jqLite('input[name="' + event.target.name + '"]')
                            .filter(function(input, index) {
                                return input.type === 'radio' && input !== event.target
                            })
                            .trigger('change.bisheng', { // KISSY 会把第二个参数的属性合并到事件对象 event 中
                                firing: true
                            })
                    }
                    updateChecked(data, path, event.target)
                    if (!Loop.auto()) Loop.letMeSee()
                })
            })
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
                $target.data('user is editing', true)
                return $target.val()
            },
            radio: function($target) {
                return false
            },
            checkbox: function($target) {
                return false
            },
            _default: function($target) {
                return $target.val()
            }
        };

        function updateValue(data, path, target) {
            for (var index = 1; index < path.length - 1; index++) {
                data = data[path[index]]
            }

            var hook = updateValueHooks[target.type] ||
                updateValueHooks[target.nodeName.toLowerCase()] ||
                updateValueHooks._default
            var value = hook(jqLite(target))

            if (value !== false) data[path[path.length - 1]] = value
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
                var name = $target.attr('name')
                var value = $target.prop('checked')
                if (name && value && name in data) data[name] = $target.val()
                return value
            },
            checkbox: function($target, data) {
                return $target.prop('checked')
            },
            _default: function($target, data) {}
        };

        function updateChecked(data, path, target) {
            for (var index = 1; index < path.length - 1; index++) {
                data = data[path[index]]
            }
            var hook = updateCheckedHooks[target.type] || updateCheckedHooks[target.nodeName.toLowerCase()] || updateCheckedHooks._default
            var value = hook(jqLite(target), data)
            if (value !== undefined) data[path[path.length - 1]] = value
        }

        return {
            scan: scan
        }

    })()


    // END(BROWSER)

    return Scanner

}));