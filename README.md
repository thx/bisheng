BiSheng.js（毕昇）
====

[![Build Status](https://api.travis-ci.org/thx/bisheng.png?branch=master)](http://travis-ci.org/thx/bisheng)
[![GitHub version](https://badge.fury.io/gh/thx%2Fbisheng.png)](http://badge.fury.io/gh/thx%2Fbisheng)
[![Bower version](https://badge.fury.io/bo/bishengjs.png)](http://badge.fury.io/bo/bishengjs)
[![Views in the last 24 hours](https://sourcegraph.com/api/repos/github.com/thx/bisheng/counters/views-24h.png)](https://github.com/thx/bisheng/)
[![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

<!-- BI-Directional / Two-Way Data-Binding with JavaScript. -->

纯粹的数据双向绑定库。

BiSheng.js 的名称源自活字印刷术的发明者“[毕昇]”。因为单向绑定犹如“刻版印刷”，双向绑定犹如“活字印刷”，故名 BiSheng.js。

[毕昇]: http://baike.baidu.com/subview/33366/11034585.htm?fromtitle=%E6%AF%95%E5%8D%87&fromid=64860&type=syn

## API & 文档

* [BiSheng](doc/bisheng.md)
* [简介](doc/what.md)
* [工作原理](doc/how.md)

## 快速开始

1. 下载 BiSheng.js

        bower install bishengjs

2. 引入 BiSheng.js

        <script src="./bower_components/bishengjs/dist/bisheng.js"></script>

3. 使用

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

## 目录

**代码的结构**按照职责来设计，见下表；**打包后的文件**在 [dist/] 目录下；**API 和文档**在 [doc/] 目录下；**测试用例**在 [test/] 目录下，基本覆盖了目前已实现的功能。

源文件            | 职责 & 功能
----------------- | -------------------------------------
[src/ast.js]      | 修改语法树，插入定位符。
[src/bisheng.js]  | 双向绑定的入口。
[src/expose.js]   | 模块化，适配主流加载器。
[src/flush.js]    | 更新 DOM 元素。
[src/html.js]     | 转换 HTML 字符串为 DOM 元素。
[src/locator.js]  | 生成定位符，解析、更新定位符的属性。
[src/loop.js]     | 数据属性监听工具。
[src/scan.js]     | 扫描 DOM 元素，解析定位符。

[src/ast.js]: https://github.com/thx/bisheng/tree/master/src/ast.js
[src/bisheng.js]: https://github.com/thx/bisheng/tree/master/src/bisheng.js
[src/expose.js]: https://github.com/thx/bisheng/tree/master/src/expose.js
[src/flush.js]: https://github.com/thx/bisheng/tree/master/src/flush.js
[src/html.js]: https://github.com/thx/bisheng/tree/master/src/html.js
[src/locator.js]: https://github.com/thx/bisheng/tree/master/src/locator.js
[src/loop.js]: https://github.com/thx/bisheng/tree/master/src/loop.js
[src/scan.js]: https://github.com/thx/bisheng/tree/master/src/scan.js

[dist/]: https://github.com/thx/bisheng/tree/master/dist/
[doc/]: https://github.com/thx/bisheng/tree/master/doc/
[test/]: https://github.com/thx/bisheng/tree/master/test/

## 更多演示

    grunt 

访问 <http://localhost:5000/>。
