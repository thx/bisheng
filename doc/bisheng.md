# BiSheng
---

双向绑定的入口对象，含有两个方法：BiSheng.bind(data, tpl, callback) 和 BiSheng.unbind(data)。

## BiSheng.bind(data, tpl, callback(content))

在模板和数据之间执行双向绑定。

* BiSheng.bind(data, tpl, callback(content))

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
    BiSheng.bind(data, tpl, function(content){
      // 然后在回调函数中将绑定后的 DOM 元素插入文档中
      $('div.container').append(content)
    });
    // 改变数据 data.title，对应的文档区域会更新
    data.title = 'bar'


## BiSheng.unbind(data, tpl)

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
    });
    // 改变数据 data.title，对应的文档区域会更新
    data.title = 'bar'
    // 解除双向绑定
    BiSheng.unbind(data, tpl);
    // 改变数据 data.title，对应的文档区域不会更新
    data.title = 'foo'

<script>
    $('div.catalog ul').addClass('pre')
</script>