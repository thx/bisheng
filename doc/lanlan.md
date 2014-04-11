title: BiSheng.js
author:
  name: 墨智 / 高云
  email: mozhi.gyy@alibaba-inc.com
  url: http://nuysoft.com
output: lanlan.html
controls: true

--

<!-- 
    TODO 借用结构
    https://speakerdeck.com/zcbenz/node-webkit-app-runtime-based-on-chromium-and-node-dot-js 

    * BiSheng.js 是什么？
    * 应用场景
    * 快速开始
    * 实现细节
    * 问答
    * 一点私货
-->

<!-- 
    随堂问题：

    我在分享的过程中会做一些提问和调查，需要各位的配合，我会根据你们的回答调整分享的内容。

    * 知道 AngularJS、Ember.js 的请举一下手
    * 读过 Backbone.js 源码的有多少呢
    * 在项目中应用过双向绑定的有多少呢，包括公司的业务和业余项目
    * 了解 AngularJS、Ember.js 实现原理的有多少呢
    * 使用过程中的感受如何
    * 了解过 Handlebars.js 或 KISSY XTemplate 语法树的有多少呢

    * 读过 jQuery 源码的请配合举一下手
    * 看过哪些模块呢，看的较多的有些模块呢，有什么样的启发
 -->

<style type="text/css">
    @font-face {
        font-family: 'logo';
        src: url('http://at.alicdn.com/t/font_1390195988_9420388.eot'); /* IE9*/
        src: url('http://at.alicdn.com/t/font_1390195988_9420388.eot?#iefix') format('embedded-opentype'), /* IE6-IE8 */
        url('http://at.alicdn.com/t/font_1390195989_0386753.woff') format('woff'), /* chrome、firefox */
        url('http://at.alicdn.com/t/font_1390195988_7969282.ttf') format('truetype'), /* chrome、firefox、opera、Safari, Android, iOS 4.2+*/
        url('http://at.alicdn.com/t/font_1390195989_0668917.svg#svgFontName') format('svg'); /* iOS 4.1- */
    }
    .iconlogo {
        font-family: "logo";
        /*font-size: 40px;*/
        font-style: normal;
        font-weight: normal;
        font-variant: normal;
        display: inline-block;
        speak: none;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }
    .dependencies img { 
        max-height: 100px; 
        padding: 18px;
    }
    .dependencies .text {
        display: inline-block;
        height: 100px;
        padding: 18px;
        text-align: center;
        min-width: 100px;
    }
    .mt20 {
        margin-top: 20px;
    }
    .ml20 {
        margin-left: 20px;
    }
</style>

<h1 style="color: #428BCA; ">
    <i class="iconlogo">&#x3438;</i>
    BiSheng.js
</h1>

<!-- # BiSheng.js -->
<!-- ## 　 -->

## 小巧轻便的数据双向绑定库

<div style="text-align: center; font-size: 18px; margin-top: 36px;">
    <div style="margin-bottom: 4px;">墨智 / 高云</div>
    <div style="margin-bottom: 4px;">[mozhi.gyy@alibaba-inc.com](mailto:mozhi.gyy@alibaba-inc.com)</div>
    <div style="margin-bottom: 4px;"><https://github.com/thx/bisheng></div>
    <div style="margin-bottom: 4px;"><http://bishengjs.com/></div>
    <div>
        <iframe src="http://ghbtns.com/github-btn.html?user=thx&repo=bisheng&type=watch&count=true&size=large" allowtransparency="true" frameborder="0" scrolling="0" width="131" height="30"></iframe>
        <iframe src="http://ghbtns.com/github-btn.html?user=thx&repo=bisheng&type=fork&count=true&size=large"allowtransparency="true" frameborder="0" scrolling="0" width="140" height="30"></iframe>
    </div>
</div>

--

### 毕昇

<table>
    <tr>
        <td style="padding: 32px 0;">
            <img src="image/bisheng.jpg" height="300">
        </td>
        <td style="padding: 32px 0 32px 32px;">
            <p>单向绑定犹如“刻版印刷”，</p>
            <p>双向绑定犹如“活字印刷”，</p>
            <p>故名 `BiSheng.js`。</p>
        </td>
    </tr>
</table>

--

### 开始之前

[bishengjs.com](http://bishengjs.com/)

[![](image/guides.png)](http://bishengjs.com/doc/index.html#API)

--

### 内容

* BiSheng.js 是什么
* 快速开始
* 应用场景和示例
* 实现细节
* 未来规划
* 问答
* 一点私货

<!-- 
    * 事件驱动编程
    * 数据驱动编程
    * 浏览器支持
    * 依赖关系
    * API
 -->

--

### BiSheng.js 是什么

小巧轻便的数据双向绑定库。

<table width="100%">
    <tr>
        <td><img src="image/One_Way_Data_Binding.png"></td>
        <td><img src="image/Two_Way_Data_Binding.png"></td>
    </tr>
</table>

*图片来自 <http://docs.angularjs.org/guide/databinding>*

--

### BiSheng.js 是什么

* 帮助快速开发 Web 组件和应用
* 可以单独使用
* 可以方便地集成到第三方框架

<p style="text-align: center;">
    <img src="image/超级赛亚人合体.jpg" width="400">
</p>
*图片来自 <http://www.nerdssomosnozes.com/2009/08/nasce-o-bingoo-ou-yahing.html>*

--

### BiSheng.js 是什么

支持所有主流浏览器，包括 IE6。

<table width="100%">
    <tr>
        <td style="padding: 32px 32px 32px 0;">
            <img width="96" src="./image/Browsers_MIN/Png/IE.png">
        </td>
        <td style="padding: 32px 32px 32px 0;">
            <img width="96" src="./image/Browsers_MIN/Png/Chrome.png">
            <img width="96" src="./image/Browsers_MIN/Png/Safari.png">
            <img width="96" src="./image/Browsers_MIN/Png/Firefox.png">
            <img width="96" src="./image/Browsers_MIN/Png/Opera.png">
        </td>
    </tr>
    <tr>
        <td>6+</td>
        <td>(Current - 1) or Current</td>
    </tr>
</table>

--

### BiSheng.js 是什么

* 基于模板引擎 Handlebars.js 实现
* 可扩展支持其他基于语法树的模板引擎
* 兼容 jQuery、Zepto.js 和 KISSY

<p class="dependencies">
    <img style="background-color: #F7931E;" src="image/logo_handlebars.png">
    <img style="background-color: #0769AD;" src="image/logo_jquery.png">
    <img style="background-color: #EDEDED;" src="image/logo_kissy.png">
    <img style="background-color: #F3EAFF;" src="image/logo_zepto.png">
</p>

--

### BiSheng.js 是什么

支持包管理器 Bower 和主流的模块加载器。

<div class="dependencies">
    <img style="background-color: #FFCC2F; float: left;" src="image/logo_bower.png">
    <div class="text ml20">**AMD**<br>*RequireJS*</div>
    <div class="text">**CMD**<br>*SeaJS*</div>
    <div class="text">**KMD**<br>*KISSY*</div>   
</div>

--
### BiSheng.js 是什么

* 数据驱动编程
    * Data-Driven Programming，DDP
    * 自动在 DOM 结构与数据模型之间建立映射关系
    * 事件也作为数据的一部分

前端应用程序应该以数据为中心，而不应该以处理和展现为中心。因为数据结构是稳定、唯一的，而业务和展现则是多变、多场景的。

<!-- 
* 事件驱动编程
    * Event-Driven Programming，EDP
    * 耦合了 DOM 结构、事件模型、数据模型
 -->

--

### 快速开始

1. 安装 BiSheng.js 和依赖库。

        bower install bishengjs

2. 引入 BiSheng.js, jQuery 和 Handlebars.js。

        <script src="../bower_components/jquery/jquery.js"></script>
        <script src="../bower_components/handlebars/handlebars.js"></script>
        <script src="../bower_components/bishengjs/dist/bisheng.js"></script>

--
### 快速开始

1. 安装。。。
2. 引入。。。
3. 调用 `BiSheng.bind()`。

        var tpl = $('#hello').html()
        var data = {
            first: 'Zhi',
            last: 'Mo'
        }
        BiSheng.bind(data, tpl, function(content){
            $('.container').append(content)
        })
--
### 快速开始

<iframe width="100%" height="250" class="mt20" src="http://jsfiddle.net/zj2WF/embedded/js,html,result" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

--

### 应用场景和示例

前端应用程序的场景可以归纳为四类：

* 表达式
* 逻辑块
* HTML 属性
* 表单

--
### 应用场景和示例

以表达式 `{{foo}}` 为例。

**首先**，我们定义容器节点 `div.container`、模板 `tpl` 和数据 `data`：

    <div class="container"></div>

    var tpl = '{{foo}}'
    var data = {
        foo: 'foo'
    }

所有的准备工作已经就绪（这些步骤和普通的开发过程没什么区别），可以开始绑定模板 `tpl` 和数据 `data` 了。

--
### 应用场景和示例

**然后**，调用方法 `BiSheng.bind(data, tpl, context)` 执行双向绑定：

    BiSheng.bind(data, tpl, $('div.container'))

**最后**，用一个定时器 `setInterval` 来模拟数据的变化，改变数据时需要用 `BiSheng.apply(fn)` 包裹起来：

    setInterval(function(){
        BiSheng.apply(function(){
            data.foo = new Date()
        })
    }, 1000)

--
### 应用场景和示例

<iframe width="100%" height="250" class="mt20" src="http://jsfiddle.net/8gAjL/embedded/result,js,html" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

实施 BiSheng.js 的步骤都是如此，所以，在后面的示例中，我不再罗列每个步骤，只展示运行结果。

--
### 应用场景和示例

以逻辑块 `{{#with story}}{{{intro}}}{{/with}}` 为例。

<iframe width="100%" height="280" src="http://jsfiddle.net/nNsrQ/embedded/js,html,result" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

--

### 应用场景和示例

以 HTML 属性 `<span title="{{title}}">{{title}}</span>` 为例。

<iframe width="100%" height="250" src="http://jsfiddle.net/nv7er/embedded/js,html,result" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

--

### 应用场景和示例

以表单元素 `<input value="{{first}}">` 为例。

<iframe width="100%" height="160" src="http://jsfiddle.net/MjV6S/embedded/js,html,result" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

--
### 实现细节

BiSheng.js 的 API 非常简洁和符合直觉，总共只有 5 个公开方法：

* BiSheng.bind(data, tpl, callback)
* BiSheng.unbind(data, tpl)
* BiSheng.watch(data, properties, fn(change))
* BiSheng.unwatch(data, fn)
* BiSheng.apply(fn)

`BiSheng` 是唯一的入口对象。

--
### 实现细节

详细的 API 文档，请访问 [HTML](/doc/bisheng.html) 或 [Markdown](/doc/bisheng.md)。

![](image/bishengjs_api.png)

--
### 实现细节

1. 需要能够监听到数据的变化。
2. 需要能够将数据的属性关联到 DOM 元素上。
3. 需要能够监听到表单元素的变化。

--
### 实现细节

BiSheng.js 会修改模板语法树，插入定位符，通过定位符来建立数据和 DOM 元素之间的连接。

1. 修改模板语法树，插入定位符。
2. 渲染模板和定位符。
3. 解析定位符。
4. 建立数据到 DOM 元素的连接。
5. 建立 DOM 元素到数据的连接。

--
### 实现细节

关于 BiSheng.js 的实现原理，您可以在 [How BiSheng.js works](http://bishengjs.com/doc/how.html) 看到详细的设计过程和原理分析。

--
### 未来规划

支持 [CROX](http://gitlab.alibaba-inc.com/thx/crox)、[KISSY XTemplate](http://docs.kissyui.com/1.4/docs/html/api/xtemplate/index.html)。

--
### 写作工具

* <https://github.com/jdan/cleaver/>
* <https://github.com/Bartvds/grunt-cleaver>

--
### 回顾一下

* BiSheng.js 是什么
* 应用场景和示例
* 实现细节

> 只做一件事，并做好。——《Unix 编程艺术》

--
### 问答

1. 已经有了 AngularJS、Ember.js 等等优秀的双向绑定框架，为什么开发 BiSheng.js 呢？

    兴趣 & 学习 & KPI。

2. 已经有了 AngularJS、Ember.js 等等优秀的双向绑定框架，为什么选择 BiSheng.js 呢？

    * 太多的概念和编码约定
    * 对既有架构的冲击大
    * DOM 模板天生不支持 IE6、IE7

--
### 问答

<p style="text-align: center; font-size: 128px; ">？</p>

--
### 一点私货

<p style="text-align: center;">
    <img src="http://nuysoft.com/assets/jquery_internals/shupi.jpg" width="256">
</p>

--
### 《jQuery 技术内幕》

* 采用由浅入深的方式，先概述功能、用法、结构和实现原理，然后介绍关键步骤和和分析源码实现。
* 每个模块辅以大量插图，总结了公开方法和底层方法的调用关系、执行过程。

--
### 《jQuery 技术内幕》

* 前端工程师通过阅读本书可以巩固基础知识、洞悉 jQuery 背后的实现原理、学习进行源码分析的方法和技巧，从而快速成长。
* 资深前端通过阅读本书可以借鉴和印证 jQuery 的架构设计和实现方式。

--
### 没有了

<p style="text-align: center; font-size: 64px;">谢谢各位的聆听</p>

无论您对双向绑定有什么见解，或者对 BiSheng.js 有什么建议，或者遇到什么不爽的地方，欢迎来 [砸砖](https://github.com/thx/bisheng/issues/) 和 [交流](mailto:nuysoft@gmail.com)。

<!-- 
    BiSheng.js 才刚刚起步，尚不完善。
    如果从我今天的分享中学到了东西或有所启发，请在 GitHub 上打赏一个赞。
 -->

<style type="text/css">
    pre {
        padding: 0px;
    }
</style>
<link rel="stylesheet" href="../bower_components/highlightjs/styles/rainbow.css">
<script src="../bower_components/highlightjs/highlight.pack.js"></script>
<script>hljs.initHighlightingOnLoad();</script>