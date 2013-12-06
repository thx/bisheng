# Hyde

轻量级的数据双向绑定库。

## API

`Hyde.bind(data, tpl, callback)`

使用示例如下说：

    var tpl = '{{title}}'
    var data = {
      title: 'foo'
    }
    Hyde.bind(data, tpl, function(content){
      $('div.container').append(content)
    })

## Demo

* [test/watch.html](test/watch.html)
* [test/expression.html](test/expression.html?scrollIntoView)
* [test/block.html](test/block.html?scrollIntoView)
* [test/form.html](test/form.html?scrollIntoView)
* [test/attribute.html](test/attribute.html?scrollIntoView)