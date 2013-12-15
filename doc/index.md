# Hyde
---

轻量级的数据双向绑定库。

## API

`Hyde.bind(data, tpl, callback)`

> 真的只有一个接口。

使用示例如下说：

    // HTML 模板
    var tpl = '{{title}}'
    // 数据对象
    var data = {
      title: 'foo'
    }
    // 执行双向绑定，然后将绑定后的 DOM 元素插入文档中
    Hyde.bind(data, tpl, function(content){
      $('div.container').append(content)
    })

## Demo

* [test/loop.html](test/loop.html)
* [test/expression.html](test/expression.html?scrollIntoView)
* [test/attribute.html](test/attribute.html?scrollIntoView)
* [test/block.html](test/block.html?scrollIntoView)
* [test/form.html](test/form.html?scrollIntoView)