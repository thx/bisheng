"use strict";

/* global window */
/* global $ */
/* global expose */
/* global Handlebars */

(function(factory) {

    expose(factory, function() {
        window.Locator = factory()
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

    function getCommentsByRegExp(regexFilters, container) {
        var comments = $(container).add('*', container).contents()
            .filter(function() {
                return this.nodeType === 8
            });

        if (regexFilters instanceof Array) {
            comments = comments.filter(function(index, item) {
                for (var i = 0; i < regexFilters.length; i++) {
                    if (!regexFilters[i].test(item.nodeValue)) return false
                }
                return true
            })

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
        createJsonCommentLocator: function createCommentLocator(attrs) {
            return escapeExpression('<!-- ') + escapeExpression(JSON.stringify(attrs)) + escapeExpression(' -->')
        },

        // Scanner

        // 定位符正则
        getLocatorRegExp: function() {
            return this.scriptLocatorRegExp
        },
        scriptLocatorRegExp: /(<script(?:.*?)><\/script>)/ig,
        jsonCommentLocatorRegExp: /<!--\s*({(?:.*?)})\s*-->/ig,

        // 查找定位符
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
                    new RegExp(key + '="?' + attrs[key] + '"?', 'i')
                )
            }
            return getCommentsByRegExp(regexFilters, context)
        },
        findJsonCommentLocator: function findCommentLocator(attrs, context) {
            // getJsonCommentsByProperty
            return $(context).add('*', context).contents()
                .filter(function() {
                    return this.nodeType === 8
                })
                .filter(function(index, item) {
                    /* jslint evil: true */
                    var json = (new Function('return ' + item.nodeValue))()
                    for (var key in attrs) {
                        if (attrs[key] !== json[key]) return false
                    }
                    return true
                })
        },

        // 解析占位符
        parse: function parse(locator, attr) {
            return $(locator).attr(attr)
        },
        parseScriptLocator: function parseScriptLocator(locator, attr) {
            return $(locator).attr(attr)
        },
        parseJsonCommentLocator: function parseJsonCommentLocator(locator, attr) {
            /* jslint evil: true */
            var json = (new Function('return ' + locator.nodeValue))()
            return attr ? json[attr] : json
        },

        // 更新占位符
        update: function update(locator, attrs, force) {
            return this.updateScriptLocator(locator, attrs, force)
        },
        updateScriptLocator: function updateScriptLocator(locator, attrs, force) {
            if (
                locator.nodeName.toLowerCase() === 'script' &&
                locator.getAttribute('guid') &&
                locator.getAttribute('slot') === 'start'
            ) {
                if (force || !locator.getAttribute('type')) {
                    for (var key in attrs) {
                        locator.setAttribute(key, attrs[key])
                    }
                }
            }
            return locator
        },
        updateJsonCommentLocator: function updateJsonCommentLocator(locator, attrs, force) {
            if (locator.nodeType === 8) {
                var json = this.parseJsonCommentLocator(locator)
                if (json.guid && json.slot === 'start') {
                    if (force || !json.type) {
                        for (var key in attrs) {
                            json[key] = attrs[key]
                        }
                        locator.nodeValue = JSON.stringify(json)
                    }
                }
            }
        },

        /*
            Flush
        */
        parseTarget: function parseTarget(locator) {
            return this.parseTargetOfScriptLocator(locator)
        },
        parseTargetOfScriptLocator: function parseTargetOfScriptLocator(locator) {
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
            return $(target)
        },
        parseTargetOfJsonCommentLocator: function parseTargetOfJsonCommentLocator(locator) {
            var json = this.parseJsonCommentLocator(locator)
            var target = []
            var node = locator
            while ((node = node.nextSibling)) {
                if (node.nodeType === 8) {
                    var end = this.parseJsonCommentLocator(node)
                    if (end.guid === json.guid && end.slot === 'end') break
                } else {
                    target.push(node)
                }
            }
            return $(target)
        }

    }

    // END(BROWSER)

    return Locator

}));