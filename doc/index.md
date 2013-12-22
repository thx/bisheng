# BiSheng.js
---

纯粹的数据双向绑定库。

## 下载

<p>
    <a href="./dist/bisheng.js" class="btn btn-success w250">
        Development Version (0.1.0)
    </a> - <i>43kB, Uncompressed</i>
</p>
<p>
    <a href="./dist/bisheng-min.js" class="btn btn-primary w250">
        Production Version (0.1.0)
    </a> - <i>10kB, Minified</i>
</p>
<p>
    <a href="https://github.com/nuysoft/bisheng" class="btn btn-default w250">
        从 Github 获取最新版本
    </a> - <i>Unreleased</i>
</p>

<iframe src="http://ghbtns.com/github-btn.html?user=nuysoft&repo=bisheng&type=watch&count=true&size=large"
  allowtransparency="true" frameborder="0" scrolling="0" width="131" height="30"></iframe>

<iframe src="http://ghbtns.com/github-btn.html?user=nuysoft&repo=bisheng&type=fork&count=true&size=large"
  allowtransparency="true" frameborder="0" scrolling="0" width="140" height="30"></iframe>

## API & 文档

<a href="doc/bisheng.html" type="button" class="btn btn-success">BiSheng</a>
<a href="doc/loop.html" type="button" class="btn btn-default">Loop</a>
<a href="doc/how.html" type="button" class="btn btn-default">工作原理</a>

## 开始

`BiSheng.bind(data, tpl, callback)`

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

## 示例

<div id="samples"></div>
<script src="/doc/samples.js"></script>

**更多示例：**

* [TodoMVC](demo/todo/index.html)
* [监听数据对象的属性](demo/loop.html)
* [监听表达式 {{}}](demo/expression.html)
* [监听 DOM 节点的属性](demo/attribute.html)
* [监听逻辑块](demo/block.html)
* [监听表单元素](demo/form.html)

## 感谢

感谢以下框架给 BiSheng.js 的启发：

1. [AngularJS — Superheroic JavaScript MVW Framework](http://angularjs.org/)
2. [Rivets.js — Lightweight and powerful data binding + templating solution for building modern web applications](https://github.com/mikeric/rivets)
3. [nytimes/backbone.stickit](https://github.com/nytimes/backbone.stickit)
4. [Epoxy.js — Elegant Data Binding for Backbone](https://github.com/gmac/backbone.epoxy)
5. [Ember.js — A framework for creating ambitious web applications](http://emberjs.com/)
6. [Knockout — Simplify dynamic JavaScript UIs with the Model-View-View Model (MVVM) pattern](http://knockoutjs.com/)
7. [backbone.modelbinding — Awesome model binding for Backbone.js](https://github.com/derickbailey/backbone.modelbinding/)
8. [RubyLouvre/avalon — 迷你简单易用的MVVM框架](https://github.com/RubyLouvre/avalon)
