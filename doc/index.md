# BiSheng.js
---

[![Build Status](https://api.travis-ci.org/thx/bisheng.png?branch=master)](http://travis-ci.org/thx/bisheng)
[![Views in the last 24 hours](https://sourcegraph.com/api/repos/github.com/thx/bisheng/counters/views-24h.png)](https://github.com/thx/bisheng/)

BI-Directional / Two-Way Data-Binding Library with JavaScript.

<!-- 双向数据绑定工具库。 -->

## Downloads

> Right-click, and use "Save As".

<p>
    <a href="../dist/bisheng.js" class="btn btn-success w250">
        Development Version (0.1.0)
    </a> - 
    <i><span id="uncompressed">?</span>kB, Full source, tons of comments</i>
</p>
<p>
    <a href="../dist/bisheng-min.js" class="btn btn-primary w250">
        Production Version (0.1.0)
    </a> - 
    <i><span id="minified">?</span>kB, Packed and gzipped (<a href="../dist/bisheng-min.map">Source Map</a>)</i>
</p>
<p>
    <a href="https://raw2.github.com/thx/bisheng/master/dist/bisheng.js" class="btn btn-default w250">
        Edge Version (master)
    </a> - 
    <i>Unreleased, use at your own risk</i>
</p>

<iframe src="http://ghbtns.com/github-btn.html?user=thx&repo=bisheng&type=watch&count=true&size=large"
  allowtransparency="true" frameborder="0" scrolling="0" width="131" height="30"></iframe>

<iframe src="http://ghbtns.com/github-btn.html?user=thx&repo=bisheng&type=fork&count=true&size=large"
  allowtransparency="true" frameborder="0" scrolling="0" width="140" height="30"></iframe>

<script type="text/javascript">
    function size(file, target) {
        $.ajax({
            type: 'head',
            url: file
        }).success(function(_, __, jqXHR) {
            var size = jqXHR.getResponseHeader('Content-Length')
            size = parseInt(size / 1024, 10)
            $(target).html(size)
        })
    }
    size('/dist/bisheng.js', '#uncompressed')
    size('/dist/bisheng-min.js','#minified')
</script>
  
## API

* [BiSheng API](./bisheng.html)
<!-- <a href="./bisheng.html" type="button" class="btn btn-success">BiSheng</a> -->
<!-- <a href="./loop.html" type="button" class="btn btn-default">Loop</a> -->

## Guides

* [What is BiSheng.js](./what.html)
* [How BiSheng.js works](./how.html)
* Why BiSheng.js (TODO)
<!-- * [Why BiSheng.js](./why.html) -->

<!-- 
<a href="./what.html" type="button" class="btn btn-default">What is BiSheng.js</a>
<a href="./how.html" type="button" class="btn btn-default">How BiSheng.js works</a>
<a href="./why.html" type="button" class="btn btn-default">Why BiSheng.js</a>
 -->

## Browser Support

<table>
    <tr>
        <td>
            <img width="32" src="./image/Browsers_MIN/Png/IE.png">
        </td>
        <td>
            <img width="32" src="./image/Browsers_MIN/Png/Chrome.png">
            <img width="32" src="./image/Browsers_MIN/Png/Safari.png">
            <img width="32" src="./image/Browsers_MIN/Png/Firefox.png">
            <img width="32" src="./image/Browsers_MIN/Png/Opera.png">
        </td>
    </tr>
    <tr>
        <td>6+</td>
        <td>(Current - 1) or Current</td>
    </tr>
</table>




<!--
* Internet Explorer：6+
* Chrome, Safari, Firefox, Opera：前一个或当前版本
-->
<!-- IE：IE6 IE8 IE9 IE10 IE11 -->

## Examples

<div id="samples" class="row"></div>
<script src="../bower_components/js-md5/js/md5.min.js"></script>
<script src="./samples.js"></script>

## Getting started

1. Install BiSheng.js

        bower install bishengjs

2. Reference BiSheng.js

        <script src="./bower_components/bishengjs/dist/bisheng.js"></script>

3. Use `BiSheng.bind()`

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

## More Examples

* [TodoMVC](../demo/todo/index.html)
* [Watch Properties of Data Object](../demo/loop.html)
* [Watch Expressions `{{}}`](../demo/expression.html)
* [Watch Attributes of DOM](../demo/attribute.html)
* [Watch Block](../demo/block.html)
* [Wach Form Elements](../demo/form.html)

<!-- 监听数据对象的属性 -->
<!-- 监听表达式 -->
<!-- 监听 DOM 节点的属性 -->
<!-- 监听逻辑块 -->
<!-- 监听表单元素 -->

## Unit Testing

* [QUnit](../test/bisheng.html?noglobals=true&notrycatch=true)

<!-- 
## Thanks

Thanks to the following articles and frameworks for giving BiSheng.js this inspiration:

感谢以下框架和文章给 BiSheng.js 的启发：

1. [AngularJS — Superheroic JavaScript MVW Framework](http://angularjs.org/)
2. [Rivets.js — Lightweight and powerful data binding + templating solution for building modern web applications](https://github.com/mikeric/rivets)
3. [nytimes/backbone.stickit](https://github.com/nytimes/backbone.stickit)
4. [Epoxy.js — Elegant Data Binding for Backbone](https://github.com/gmac/backbone.epoxy)
5. [Ember.js — A framework for creating ambitious web applications](http://emberjs.com/)
6. [Knockout — Simplify dynamic JavaScript UIs with the Model-View-View Model (MVVM) pattern](http://knockoutjs.com/)
7. [backbone.modelbinding — Awesome model binding for Backbone.js](https://github.com/derickbailey/backbone.modelbinding/)
8. [RubyLouvre/avalon — 迷你简单易用的MVVM框架](https://github.com/RubyLouvre/avalon)
9. [shepherdwind/bidi - MVVM for KISSY](https://github.com/shepherdwind/bidi)
10. [$watch How the $apply Runs a $digest](http://angular-tips.com/blog/2013/08/watch-how-the-apply-runs-a-digest/)，[翻译](http://blog.csdn.net/leekangtaqi/article/details/10376363)
 -->