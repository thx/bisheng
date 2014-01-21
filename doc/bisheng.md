# BiSheng
---

双向绑定的入口对象，含有 4 个方法：
* BiSheng.bind(data, tpl, callback)
* BiSheng.unbind(data, tpl)
* BiSheng.watch(data, properties, fn(change))
* BiSheng.unwatch(data, fn)

## BiSheng.bind(data, tpl, callback(content))

在模板和数据之间执行双向绑定。

* BiSheng.bind(data, tpl, callback(content))

**参数的含义和默认值**如下所示：

* **参数 data**：必选。待绑定的对象或数组。
* **参数 tpl**：必选。待绑定的 HTML 模板。在绑定过程中，先把 HTML 模板转换为 DOM 元素，然后将“绑定”数据到 DOM 元素。目前只支持 Handlebars.js 语法。
* **参数 callback(content)**：必选。回调函数，当绑定完成后被执行。执行该函数时，会把转换后的 DOM 元素作为参数 content 传入。该函数的上下文（即关键字 this）是参数 data。
* **参数 content**：数组，其中包含了转换后的 DOM 元素。

## BiSheng.unbind(data, tpl)

解除数据和模板之间的双向绑定。

* **BiSheng.unbind(data, tpl)**

    解除数据 data 和模板 tpl 之间的双向绑定。

* **BiSheng.unbind(data)**

    解除数据 data 与所有模板之间的双向绑定。


**参数的含义和默认值**如下所示：

* **参数 data**：必选。待解除绑定的对象或数组。
* **参数 tpl**：可选。待解除绑绑定的 HTML 模板。

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
    // 解除双向绑定
    BiSheng.unbind(data, tpl);
    // 改变数据 data.title，对应的文档区域不会更新
    data.title = 'foo'

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

## BiSheng.unwatch(data, fn)

移除监听函数。

* **BiSheng.unwatch(data, fn)**
    
    移除对象（或数组） data 上绑定的监听函数 fn。

* **BiSheng.unwatch(data)**

    移除对象（或数组） data 上绑定的所有监听函数。

* **BiSheng.unwatch(fn)**

    全局移除监听函数 fn。


**参数的含义和默认值**如下所示：

* **参数 data**：可选。待移除监听函数的对象或数组。
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

<script>
    $('div.catalog ul').addClass('pre')
</script>