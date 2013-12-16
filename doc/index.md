# Hyde.js
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
    // 执行双向绑定
    Hyde.bind(data, tpl, function(content){
      // 然后在回调函数中将绑定后的 DOM 元素插入文档中
      $('div.container').append(content)
    })

## Demo

* [监听数据对象的属性](demo/loop.html)
* [监听表达式 {{}}](demo/expression.html)
* [监听 DOM 节点的属性](demo/attribute.html)
* [监听逻辑块](demo/block.html)
* [监听表单元素](demo/form.html)

## 感谢

感谢以下框架给 Hyde.js 的启发：

1. [AngularJS — Superheroic JavaScript MVW Framework](http://angularjs.org/)
2. [Rivets.js — Lightweight and powerful data binding + templating solution for building modern web applications](https://github.com/mikeric/rivets)
3. [nytimes/backbone.stickit](https://github.com/nytimes/backbone.stickit)
4. [Epoxy.js — Elegant Data Binding for Backbone](https://github.com/gmac/backbone.epoxy)
5. [Ember.js — A framework for creating ambitious web applications](http://emberjs.com/)
6. [Knockout — Simplify dynamic JavaScript UIs with the Model-View-View Model (MVVM) pattern](http://knockoutjs.com/)
7. [backbone.modelbinding — Awesome model binding for Backbone.js](https://github.com/derickbailey/backbone.modelbinding/)
8. [RubyLouvre/avalon — 迷你简单易用的MVVM框架](https://github.com/RubyLouvre/avalon)

© 2013 nuysoft