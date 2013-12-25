"use strict";

/* global window */
/* global $ */
/* global expose */
/* global Handlebars */

(function(factory) {

    expose(factory, function() {
        window.AST = factory()
    })

}(function() {
    // BEGIN(BROWSER)

    /*
        attrs = {
            guid: guid,
            slot: 'start/end',
            type: 'text/attribute/block',
            path: '{{$lastest ' + prop + '}}',
            isHelper: !! node.isHelper,
            helper: helper
        }
    */

    function getJsonCommentsByProperty(attrs, context) {
        return $(context).add('*', context).contents()
            .filter(function() {
                return this.nodeType === 8
            })
            .filter(function(index, item) {
                /*jslint evil: true */
                var json = (new Function('return ' + item.nodeValue))()
                for (var key in attrs) {
                    if (attrs[key] !== json[key]) return false
                }
                return true
            })
    }

    function getCommentsByRegExp(container, regexFilters) {
        var comments = $(container).add('*', container).contents()
            .filter(function() {
                return this.nodeType === 8
            });

        function doit(index, item) {
            return regexFilters[index].test(item.nodeValue)
        }

        if (regexFilters instanceof Array) {
            for (var i = 0; i < regexFilters.length; i++) {
                comments = comments.filter(doit)
            }
        } else {
            comments = comments.filter(function(index, item) {
                return regexFilters ? regexFilters.test(item.nodeValue) : true
            })
        }

        return comments
    }

    var escapeExpression = Handlebars.Utils.escapeExpression

    /*
        定位符
    */
    var Locator = {

        // AST

        // 创建定位符
        create: function create(attrs) {
            return this.createScriptLocator(attrs)
        },
        // 创建 script 定位符
        createScriptLocator: function createScriptLocator(attrs) {
            var pathHTML = escapeExpression('<script')
            for (var key in attrs) {
                if (attrs[key] === undefined) continue
                pathHTML += ' ' + key + escapeExpression('="') + attrs[key] + escapeExpression('"')
            }
            pathHTML += escapeExpression('></script>')
            return pathHTML
        },
        // 创建 comment 定位符
        createCommentLocator: function createCommentLocator(attrs) {
            return escapeExpression('<!--') + escapeExpression(JSON.stringify(attrs)) + escapeExpression(' -->')
        },

        // Scanner

        // 定位符正则
        getLocatorRegExp: function() {
            return this.scriptLocatorRegExp
        },
        scriptLocatorRegExp: /(<script(?:.*?)><\/script>)/ig,
        commentLocatorRegExp: /<!--\s*(?:.*?)\s*-->/ig,
        jsonCommentLocatorRegExp: /<!--\s*({(?:.*?)})\s*-->/ig,

        // 获取定位符
        find: function find(attrs, context) {
            return this.findScriptLocator(attrs, context)
        },
        findScriptLocator: function findScriptLocator(attrs, context) {
            var selector = 'script'
            for (var key in attrs) {
                selector += '[' + key + '="' + attrs[key] + '"]'
            }
            return $(selector, context)
        },
        findCommentLocator: function findCommentLocator(attrs, context) {
            var regexFilters = []
            for (var key in attrs) {
                regexFilters.push(
                    new RegExp('key:"?' + attrs[key] + '"?', 'i')
                )
            }
            return getCommentsByRegExp(context, regexFilters)
        },
        findJsonCommentLocator: function findCommentLocator(attrs, context) {
            return getJsonCommentsByProperty(attrs, context)
        },

        // 解析占位符
        parse: function parse(locator, attr) {
            return $(locator).attr(attr)
        },
        parseJsonCommentLocator: function parseJsonCommentLocator(locator, attr) {
            return (new Function('return ' + locator.nodeValue))()[attr]
        },

        // 更新占位符
        update: function update(node, attrs, force) {
            if (
                node.nodeName.toLowerCase() === 'script' &&
                node.getAttribute('guid') &&
                node.getAttribute('slot') === 'start'
            ) {
                if (force || !node.getAttribute('type')) {
                    for (var key in attrs) {
                        node.setAttribute(key, attrs[key])
                    }
                }
            }
            return node
        },

        /*
            Flush
        */
        parseTarget: function parseTarget(locator) {
            var guid = $(locator).attr('guid')
            var target = [],
                node = locator,
                $node
            while ((node = node.nextSibling)) {
                $node = $(node)
                if (node.nodeName.toLowerCase() === 'script' && $node.attr('guid')) {
                    if ($node.attr('guid') === guid && $node.attr('slot') === 'end') {
                        break
                    }
                } else {
                    target.push(node)
                }
            }
            return target
        }


    }

    // END(BROWSER)

    return Locator

}));