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
                slice.call(node.querySelectorAll('script[slot="end"][type="block"][guid="' + guid + '"]') || [], 0)
                    .forEach(function(end) {
                        end.setAttribute('path', path)
                    })
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

    return scan

}));