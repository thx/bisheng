"use strict";

/* global expose */
/* global window: true */
/* global jQuery: true */
/* global KISSY: true */
/* global Zepto: true */
/* global HTMLElement: true */

(function(factory) {

    expose(factory, function() {
        window.HTML = factory()
    })

}(function() {

    // BEGIN(BROWSER)

    var jqLite

    if (window.KISSY) {
        jqLite = KISSY.all

        var constructor = KISSY.all().constructor
        var prototype = constructor.prototype

        /*
            扩展原则：
            1. 如果在 KISSY 中不存在，则直接扩展方法
            2. 如果只是行为不同，则定义一个以下划线开头的同名方法。
            3. 最小扩展集。

            TODO 尚有些混乱，部分是为让测试用例通过而扩展的。
        */

        if (!prototype.splice) {
            prototype.splice = [].splice
        }
        if (!jqLite.trim) {
            jqLite.trim = KISSY.trim
        }
        if (!jqLite.each) {
            jqLite._each = KISSY.each
        }
        if (!prototype.find) {
            prototype.find = prototype.all
        }
        if (!prototype.eq) {
            prototype.eq = prototype.item
        }
        if (!prototype.get) {
            prototype.get = function get(num) {
                return num === undefined ?
                    [].slice.call(this) :
                    (num < 0 ? this[this.length + num] : this[num])
            }
        }
        /*
            KISSY 1.4 不支持 .map(callback, context)
         */
        if (!prototype.map) {
            prototype.map = function map(callback, context) {
                var self = this
                var result = KISSY.map(self, function(node, index) {
                    node = KISSY.all(node)
                    return callback.call(context || node, node, index, self)
                })
                return KISSY.all(result)
            }
        }
        /*
            KISSY 1.4 不支持 .toArray()
        */
        if (!prototype.toArray) {
            prototype.toArray = function toArray() {
                return [].slice.call(this)
            }
        }
        /*
            KISSY 1.4 不支持 .replaceAll( target )
            * .replaceWith( newContent )
                当前内容.replaceWith( 新内容 )
            * .replaceAll( target )
                新内容.replaceAll( 当前内容 )
        */
        if (!prototype.replaceAll) {
            prototype.replaceAll = function replaceAll(target) {
                var newContent = this
                KISSY.all(target).each(function(node, index) {
                    KISSY.all(node).replaceWith(
                        index === 0 ? newContent : newContent.clone(true)
                    )
                })
                return this
            }
        }
        // 手动触发事件
        if (!prototype.trigger) {
            prototype.trigger = prototype.fire
        }
        // 扩展便捷事件方法 .hover(fnOver, fnOut)
        if (!prototype.hover) {
            prototype.hover = function hover(fnOver, fnOut) {
                return this.on('mouseenter', fnOver)
                    .on('mouseleave', fnOut || fnOver)
            }
        }
        // KISSY.all().constructor.prototype.each 会把参数 childNode 再次封装为 NodeList
        prototype._each = function _each(callback, context) {
            return this.each(function(node, index, self) {
                if (!node.nodeType && node.length && node[0].nodeType) node = node[0]
                callback.call(this, node, index, self)
            }, context)
        }
        /*
            兼容 KISSY 和 jQuery 的 .filter() 方法
            * jQuery
                * .filter( selector )
                * .filter( function(index) )
                    A function used as a test for each element in the set. this is the current DOM element.
                * .filter( element )
                * .filter( jQuery object )
            * KISSY
                * Array<HTMLElement> filter ( selector , filter [,context=document] )
                * .filter( function(element) )
                    this 是 KISSY
        */
        prototype._filter = function _filter(callback) {
            // 干！文档中没有说明 .filter() 的回调函数有这么多参数！
            if (typeof callback === 'function') {
                return this.filter(function(element, index, array) {
                    // 修正上下文 this 为当前元素（默认是 KISSY）
                    return callback.call(element, element, index, array)
                })
            }
            return this.filter.apply(this, arguments)
        }
        /*
            KISSY 1.4 .attr(name, value) 不支持函数作为属性值。
        */
        prototype._attr = function attr(name, value) {
            if (value === undefined) return this.attr(name)
            return this.each(function(elem, index) {
                if (typeof value === 'function') {
                    value = value.call(elem, index, elem.attr(name))
                }
                elem.attr(name, value)
            })
        }
        /*
            KISSY 1.4 其他的兼容问题：
            1. 不支持位置伪类 :(even|odd|eq|gt|lt|nth|first|last)
                Position selectors :first, :last, :even, :odd, :gt, :lt, :eq
            2. 不支持表单伪类 :(radio|checkbox|file|password|image|submit|reset)
                Easy Form selectors :input, :text, :checkbox, :file, :password, :submit, :image, :reset, :button
            没暴漏扩展接口，这怎么办？！！！
        */

    } else if (window.jQuery) {
        // jQuery.each(obj, callback(key, value))
        // jQuery._each(obj, callback(value, key))
        jQuery._each = function _each(obj, callback, args) {
            if (args) return jQuery.each(obj, callback, args)
            return jQuery.each(obj, function(key, value, obj) {
                // 交换 key、value 的位置，使之符合标准
                callback.call(this, value, key, obj)
            }, args)
        }
        jQuery.fn._each = function _each(callback, args) {
            return jQuery._each(this, callback, args)
        }
        jQuery.fn._filter = function _filter(callback) {
            return this.filter(function(index, element, array) {
                // 交换 index、element 的位置，使之符合标准
                return callback.call(element, element, index, array)
            })
        }
        jQuery.fn._attr = jQuery.fn.attr
        jqLite = jQuery

    } else if (window.Zepto) {
        Zepto._each = function _each(obj, callback) {
            return Zepto.each(obj, function(key, value) {
                if (!value.nodeType && value.length && value[0].nodeType) {
                    Zepto._each(value, callback)
                }
                else {
                    callback.call(this, value, key)
                }
            })
        }
        Zepto.fn._each = function _each(callback) {
            return Zepto._each(this, callback)
        }
        Zepto.fn._filter = function _filter(callback) {
            return this.filter(function(index, element, array) {
                // Zepto.each 方法不支持第二个参数 element
                element = element || this
                // 交换 index、element 的位置，使之符合标准
                return callback.call(element, element, index, array)
            })
        }
        Zepto.fn._attr = Zepto.fn.attr
        Zepto.fn.splice = [].splice
        Zepto.fn.replaceAll = function replaceAll(target) {
            /*jshint -W064 */
            return Zepto(target).replaceWith(this)
        }
        // 在 Zepto 中 data 方法使用 DOM 元素的属性来存储
        // 所以对于 name 需要替换空格
        Zepto.fn._data = Zepto.fn.data
        Zepto.fn.data = function(name, value) {
            name = name.replace(/\s/g, '-')
            return Zepto.fn._data.call(this, name, value)
        }
        // 扩展 Zepto 支持克隆节点时克隆事件到新克隆的元素上
        Zepto.cache = {}
        Zepto.fn._on = Zepto.fn.on
        Zepto.fn.on = function(event, selector, data, callback, one) {
            Zepto.fn._on.apply(this, arguments)

            this.each(function(idx, elem) {
                var cache = Zepto.cache[elem._zid] = Zepto.cache[elem._zid] || {}
                var events = event.split(/\s/)

                Zepto.each(events, function(idx, type) {
                    cache[type] = cache[type] || []
                    cache[type].push({
                        event: type,
                        selector: selector,
                        data: data,
                        callback: callback,
                        one: one
                    })
                })
            })

            return this
        }
        Zepto.fn._off = Zepto.fn.off
        Zepto.fn.off = function(event, selector, callback) {
            Zepto.fn._off.apply(this, arguments)

            this.each(function(idx, elem) {
                var cache = Zepto.cache[elem._zid]
                var events = event.split(/\s/)

                if (!cache) {
                    return
                }

                Zepto.each(events, function(idx, type) {
                    // 删除所有处理函数
                    delete cache[type]
                })
            })

            return this
        }
        // 在 HTMLElement.cloneNode 方法上注入克隆事件功能
        HTMLElement.prototype._cloneNode = HTMLElement.prototype.cloneNode
        HTMLElement.prototype.cloneNode = function() {
            var cloneElement = HTMLElement.prototype._cloneNode.call(this, arguments)

            // clone event
            cloneEvent(this, cloneElement)

            /**
             * @param origin
             * @param target
             */
            function cloneEvent(origin, target) {
                /*jshint -W064 */
                Zepto(origin).children().each(function(idx, element) {
                    // clone event
                    if (typeof this._zid === 'number') {
                        /*jshint -W064 */
                        var cloneChildren = Zepto(target).children().eq(idx)
                        var events = Zepto.cache[this._zid]

                        Zepto.each(events, function(type, handlers) {
                            Zepto.each(handlers, function(idx, handler) {
                                /*jshint -W064 */
                                Zepto(cloneChildren).on(
                                    handler.event,
                                    handler.selector,
                                    handler.data,
                                    handler.callback,
                                    handler.one
                                )
                            })
                        })
                    }

                    // clone children event
                    /*jshint -W064 */
                    if (Zepto(element).children().length) {
                        /*jshint -W064 */
                        cloneEvent(element, Zepto(target).children().eq(idx)[0])
                    }
                })
            }

            return cloneElement
        }


        jqLite = Zepto
    }


    // END(BROWSER)

    return jqLite



}));
