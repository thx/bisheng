BiSheng.js（毕昇）
====

[![Build Status](https://api.travis-ci.org/nuysoft/bisheng.png?branch=master)](http://travis-ci.org/nuysoft/bisheng)
[![GitHub version](https://badge.fury.io/gh/nuysoft%2Fbisheng.png)](http://badge.fury.io/gh/nuysoft%2Fbisheng)
[![Bower version](https://badge.fury.io/bo/bishengjs.png)](http://badge.fury.io/bo/bishengjs)
[![Views in the last 24 hours](https://sourcegraph.com/api/repos/github.com/nuysoft/bisheng/counters/views-24h.png)](https://github.com/nuysoft/bisheng/)

<!-- BI-Directional / Two-Way Data-Binding with JavaScript. -->

纯粹的数据双向绑定库。

## API & 文档

* [BiSheng](blob/master/doc/bisheng.md)
* [Loop](blob/master/doc/loop.md)
* [工作原理](blob/master/doc/how.md)

## 开始

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

## 更多演示

    grunt 

访问 <http://localhost:5000/>。
