"use strict";

/* global window: true */
/* global location */
/* global $: true */
/* global Handlebars: true */
/* global expose */
/* global Loop */
/* global AST */
/* global Scanner */
/* global Flush */

(function(factory) {

    expose(factory, function() {
        // Browser globals
        window.Hyde = factory()
    })

}(function() {
    // BEGIN(BROWSER)

    /*
        ## Hyde

        双向绑定的入口对象，含有两个方法：Hyde.bind(data, tpl, callback) 和 Hyde.unbind(data)。
    */
    var Hyde = {
        version: '0.1.0',

        /*
            ### Hyde.bind(data, tpl, callback(content))

            执行模板和数据的双向绑定。

            * Hyde.bind(data, tpl, callback(content))

            **参数的含义和默认值**如下所示：

            * 参数 data：必选。待绑定的对象或数组。
            * 参数 tpl：必选。待绑定的 HTML 模板。在绑定过程中，先把 HTML 模板转换为 DOM 元素，然后将“绑定”数据到 DOM 元素。目前只支持 Handlebars.js 语法。
            * 参数 callback(content)：必选。回调函数，当绑定完成后被执行。执行该函数时，会把转换后的 DOM 元素作为参数 content 传入。

            **使用示例**如下所示：

                // HTML 模板
                var tpl = '{{title}}'
                // 数据对象
                var data = {
                  title: 'foo'
                }
                // 执行双向绑定
                Hyde.bind(data, tpl, function(content){
                  // 然后在回调函数中将绑定后的 DOM 元素插入文档中
                  $('div.container').append(content)
                })
                // 改变数据 data.title，对应的文档区域会更新
                data.title = 'bar'

        */
        bind: function bind(data, tpl, callback) {
            // 为所有属性添加监听函数
            var clone = Loop.watch(data, function(changes) {
                // console.log(JSON.stringify(changes, null, 2))
                $.each(changes, function(_, change) {
                    var event = {
                        target: []
                    }
                    Flush.handle(event, change, clone)
                    if (location.href.indexOf('scrollIntoView') > -1) Flush.scrollIntoView(event, data)
                    if (location.href.indexOf('highlight') > -1) Flush.highlight(event, data)
                })
            }, true)

            // 修改 AST，为 Expression 和 Block 插入占位符
            var ast = Handlebars.parse(tpl)
            AST.handle(ast, undefined, undefined, clone.$blocks = {}, clone.$helpers = {})

            // 渲染 HTML
            var compiled = Handlebars.compile(ast)
            var html = compiled(clone)

            // 扫描占位符，定位 Expression 和 Block
            var content = $('<div>' + html + '</div>')
            if (content.length) Scanner.scan(content[0], data)
            content = content.contents()

            /*
                返回什么呢
                如果传入了 callback()，则返回 data，因为 callback() 的作用在于处理 content；
                如果 callback() 有返回值，则作为 bind() 的返回值返回，即优先返回 callback() 的返回值；
                如果未传入 callback，则返回 content，因为不返回 content 的话，content 就会被丢弃。

            */
            if (callback) return callback.call(data, content) || data
            return content
        },

        /*
            ### Hyde.unbind(data, tpl)

            解除数据和模板之间的双向绑定。

            * Hyde.unbind(data, tpl)
                解除数据 data 和模板 tpl 之间的双向绑定。
            * Hyde.unbind(data)
                解除数据 data 与所有模板之间的双向绑定。

            **参数的含义和默认值**如下所示：

            * 参数 data：必选。待接触绑定的对象或数组。
            * 参数 tpl：可选。待接触绑绑定的 HTML 模板。

            **使用示例**如下所示：

                // HTML 模板
                var tpl = '{{title}}'
                // 数据对象
                var data = {
                  title: 'foo'
                }
                // 执行双向绑定
                Hyde.bind(data, tpl, function(content){
                  // 然后在回调函数中将绑定后的 DOM 元素插入文档中
                  $('div.container').append(content)
                })
                // 改变数据 data.title，对应的文档区域会更新
                data.title = 'bar'
                // 解除双向绑定
                Hyde.unbind(data, tpl)
                // 改变数据 data.title，对应的文档区域不会更新
                data.title = 'foo'

        */
        unbind: function unbind(data, tpl) {
            Loop.unwatch(data)
            return this
        }
    }

    // END(BROWSER)

    return Hyde

}));