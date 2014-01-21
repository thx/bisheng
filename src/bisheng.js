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
/* global HTML */

(function(factory) {

    expose(factory, function() {
        // Browser globals
        window.BS = window.BiSheng = factory()
    })

}(function() {
    // BEGIN(BROWSER)

    /*
        ## BiSheng

        双向绑定的入口对象，含有两个方法：BiSheng.bind(data, tpl, callback) 和 BiSheng.unbind(data)。
    */
    var BiSheng = (function() {
        var guid = 1
        return {
            version: '0.1.0',

            /*
                ## BiSheng.auto(bool)

                设置运行模式为自动检测（true）或手动触发检测（false）。

                BiSheng.js 初始化时，会默认执行 BiSheng.auto(false)，即默认设置为手动触发检测，此时，在更新数据时，需要手动调用 BiSheng.apply(fn)。
                如果希望自动检测，则执行 执行 BiSheng.auto(true)。
            */
            auto: function(bool) {
                Loop.auto(bool)
                return this
            },

            /*
                ## BiSheng.bind(data, tpl, callback(content))

                在模板和数据之间执行双向绑定。

                * BiSheng.bind(data, tpl, callback(content))

                **参数的含义和默认值**如下所示：

                * 参数 data：必选。待绑定的对象或数组。
                * 参数 tpl：必选。待绑定的 HTML 模板。在绑定过程中，先把 HTML 模板转换为 DOM 元素，然后将“绑定”数据到 DOM 元素。目前只支持 Handlebars.js 语法。
                * 参数 callback(content)：必选。回调函数，当绑定完成后被执行。执行该函数时，会把转换后的 DOM 元素作为参数 content 传入。该函数的上下文（即关键字 this）是参数 data。
                * 参数 content：数组，其中包含了转换后的 DOM 元素。

                **使用示例**如下所示：

                    // HTML 模板
                    var tpl = '{{title}}'
                    // 数据对象
                    var data = {
                      title: 'foo'
                    }
                    // 执行双向绑定
                    BiSheng.bind(data, tpl, function(content){
                      // 然后在回调函数中将绑定后的 DOM 元素插入文档中
                      $('div.container').append(content)
                    });
                    // 改变数据 data.title，对应的文档区域会更新
                    data.title = 'bar'

            */
            bind: function bind(data, tpl, callback, context) {
                // 属性监听函数
                function task(changes) {
                    $.each(changes, function(_, change) {
                        var event = {
                            target: []
                        }
                        Flush.handle(event, change, clone, context)
                        if (location.href.indexOf('scrollIntoView') > -1) Flush.scrollIntoView(event, data)
                        if (location.href.indexOf('highlight') > -1) Flush.highlight(event, data)
                    })
                }
                task.tpl = tpl
                // 为所有属性添加监听函数
                var clone = Loop.watch(data, task, true, true)

                // 预处理 HTML 属性（IE 遇到非法的样式会丢弃）
                tpl = tpl.replace(/(<.*?)(style)(=.*?>)/g, '$1bs-style$3')
                    .replace(/(<input.*?)(checked)(=.*?>)/g, '$1bs-checked$3')
                    .replace(/(<img.*?)(src)(=.*?>)/g, '$1bs-src$3')

                // 修改 AST，为 Expression 和 Block 插入占位符
                var ast = Handlebars.parse(tpl)
                AST.handle(ast, undefined, undefined, clone.$blocks = {}, clone.$helpers = {})

                // 渲染 HTML
                var compiled = Handlebars.compile(ast)
                var html = compiled(clone)

                // 提前解析 table 中的定位符
                html = HTML.table(html)

                // 扫描占位符，定位 Expression 和 Block
                var content = $(HTML.convert(html))
                if (content.length) Scanner.scan(content[0], data)
                content = content.contents().get()

                /*
                    返回什么呢？
                    如果 callback() 有返回值，则作为 BiSheng.bind() 的返回值返回，即优先返回 callback() 的返回值；
                    如果未传入 callback，则返回 content，因为不返回 content 的话，content 就会被丢弃。
                */
                return callback ?
                    callback.call(data, content) || content :
                    content
            },

            /*
                ### BiSheng.unbind(data, tpl)

                解除数据和模板之间的双向绑定。

                * BiSheng.unbind(data, tpl)
                    解除数据 data 和模板 tpl 之间的双向绑定。
                * BiSheng.unbind(data)
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
                    BiSheng.bind(data, tpl, function(content){
                      // 然后在回调函数中将绑定后的 DOM 元素插入文档中
                      $('div.container').append(content)
                    })
                    // 改变数据 data.title，对应的文档区域会更新
                    data.title = 'bar'
                    // 解除双向绑定
                    BiSheng.unbind(data, tpl)
                    // 改变数据 data.title，对应的文档区域不会更新
                    data.title = 'foo'

            */
            unbind: function unbind(data, tpl) {
                if (!tpl) {
                    Loop.unwatch(data)
                } else {
                    for (var index = 0, fn; index < Loop.tasks.length; index++) {
                        fn = Loop.tasks[index]
                        if (fn.data === data && fn.tpl === tpl) {
                            Loop.tasks.splice(index--, 1)
                        }
                    }
                }
                return this
            },

            /*
                ## BiSheng.watch(data, properties, fn(change))

                为一个或一组或所有属性添加监听函数。
                <!--Attach default handler function to all properties.-->

                * **BiSheng.watch(data, fn(changes))**
                * **BiSheng.watch(data, property, fn(change))**
                * **BiSheng.watch(data, properties, fn(change))**

                **参数的含义和默认值**如下所示：

                * **参数 data**：必选。指向待监听的对象或数组。
                * **参数 property**：可选。字符串，表示待监听的单个属性。
                * **参数 properties**：可选。字符串数组，表示待监听的多个属性。
                * **参数 fn**：必选。监听函数，当属性发生变化时被执行。
                    
                    * 参数 change 是一个对象，格式为：

                            {
                                type: 'add/delete/update',
                                path: [,,],
                                value: newValue,
                                oldValue: oldValue
                            }

                    * 参数 changes 是一个数组，格式为：
                    
                            [
                                {
                                    type: 'add',
                                    path: [,,],
                                    value: newValue
                                },{
                                    type: 'delete',
                                    path: [,,],
                                    value: newValue
                                }, {
                                    type: 'update',
                                    path: [,,],
                                    value: value,
                                    oldValue: oldValue
                                }
                            ]

                **使用示例**如下所示：

                    var data = { foo: 'foo' }
                    BiSheng.watch(data, function(changes){
                        console.log(JSON.stringify(changes, null, 4))
                    })
                    data.foo = 'bar'

                    // =>
                    [
                        {
                            "type": "update",
                            "path": [
                                6,
                                "foo"
                            ],
                            "value": "bar",
                            "oldValue": "foo",
                            "root": {
                                "foo": "bar"
                            },
                            "context": {
                                "foo": "bar"
                            }
                        }
                    ]
            */
            watch: function(data, properties, fn) {
                var propertiesMap = {}, index, change;

                function find(path) {
                    for (var index = path.length; index > 0; index--) {
                        if (propertiesMap[path.slice(0, index).join('.')]) return true
                    }
                }

                function callback(changes) {
                    for (var index = 0; index < changes.length; index++) {
                        change = changes[index]
                        if (find(change.path)) fn.call(data, change)
                    }
                }

                if (properties && arguments.length === 3) {
                    // BiSheng.watch(data, properties, fn(changes))
                    // BiSheng.watch(data, property, fn(change))
                    properties = properties.constructor !== Array ? [properties] : properties
                    for (index = 0; index < properties.length; index++) {
                        propertiesMap[properties[index]] = true
                    }

                    fn.guid = fn.guid || guid++

                    callback.guid = fn.guid
                    callback.properties = properties

                    Loop.watch(data, callback)

                } else {
                    // BiSheng.watch(data, undefined, fn(changes))
                    // BiSheng.watch(data, fn(changes))
                    fn = properties || fn

                    fn.guid = fn.guid || guid++

                    // BiSheng.watch(data, fn(changes))
                    Loop.watch(data, fn /*, true*/ )
                }
                return this
            },

            /*
                ## BiSheng.unwatch(data, properties, fn)

                移除监听函数。

                * **BiSheng.unwatch(data, properties, fn)**
                    
                    移除对象（或数组） data 上，绑定的用于监听属性 properties 的监听函数 fn。
                
                * **BiSheng.unwatch(data, properties)**
                    
                    移除对象（或数组） data 上，绑定的用于监听属性 properties 的所有监听函数。

                * **BiSheng.unwatch(data, fn)**

                    移除对象（或数组） data 上绑定的监听函数 fn。

                * **BiSheng.unwatch(data)**

                    移除对象（或数组） data 上绑定的所有监听函数。

                * **BiSheng.unwatch(fn)**

                    全局移除监听函数 fn。

                **参数的含义和默认值**如下所示：

                * **参数 data**：可选。指向待移除监听函数的对象或数组。
                * **参数 properties**：可选。字符串，或字符串数组。表示待移除监听的属性。
                * **参数 fn**：可选。待移除的监听函数。

                **使用示例**如下所示：

                    var data = { foo: 'foo' }
                    BiSheng.watch(data, function(changes){
                        console.log(JSON.stringify(changes, null, 4))
                    })
                    data.foo = 'bar'
                    // =>
                    [
                        {
                            "type": "update",
                            "path": [
                                3,
                                "foo"
                            ],
                            "value": "bar",
                            "oldValue": "foo",
                            "root": {
                                "foo": "bar"
                            },
                            "context": {
                                "foo": "bar"
                            }
                        }
                    ]
                    
                    setTimeout(function(){
                        BiSheng.unwatch(data)
                        data.foo = 'foo'
                        // => 
                    }, 1000)

            */
            unwatch: function(data, properties, fn) {
                if (!data) return this

                // BiSheng.unwatch(fn)
                if (arguments.length === 1 && typeof data === 'function') {
                    fn = data
                    data = properties = undefined
                }

                // BiSheng.unwatch(data, fn) or BiSheng.unwatch(data, properties)
                if (arguments.length === 2) {
                    // BiSheng.unwatch(data, fn)
                    if (typeof properties === 'function') {
                        fn = properties
                        properties = undefined
                    }
                }

                // BiSheng.unwatch(data, fn)
                // BiSheng.unwatch(data)
                // BiSheng.unwatch(fn)
                if (!properties) {
                    Loop.unwatch(data, fn)
                    return this
                }

                var i, j, k, task, found = false,
                    tmp = [];

                if (properties.constructor !== Array) {
                    tmp = [properties]
                } else {
                    tmp = properties
                }
                // properties = (properties.constructor !== Array ? [properties] : properties)
                // 为什么这条语句改变了 properties 的值？

                // BiSheng.unwatch(data, properties, fn)
                // BiSheng.unwatch(data, properties)
                for (i = 0; i < Loop.tasks.length; i++) {
                    task = Loop.tasks[i]
                    found = false

                    if (task.data !== data || !task.callback.properties) continue
                    if (fn && task.callback.guid !== fn.guid) continue

                    for (j = 0; j < tmp.length; j++) {
                        for (k = 0; k < task.callback.properties.length; k++) {
                            if (task.callback.properties[k] === tmp[j]) {
                                // 删除匹配的属性，不再监听该属性
                                task.callback.properties.splice(k--, 1)
                                // 如果属性已全部删除，则删除监听函数
                                if (!task.callback.properties.length) found = true
                            }
                        }
                    }
                    if (found) Loop.tasks.splice(i--, 1)
                }

                return this
            },
            /*
                ## BiSheng.apply(fn)
                
                更新数据，然后检查数据的变化，并自动视图。

            */
            apply: function(fn) {
                fn()
                BiSheng.Loop.letMeSee()
                return this
            }
        }
    })()

    // BiSheng.auto(false)

    // END(BROWSER)

    return BiSheng

}));