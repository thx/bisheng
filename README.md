BiSheng.js（毕昇）
====

[![Build Status](https://api.travis-ci.org/thx/bisheng.png?branch=master)](http://travis-ci.org/thx/bisheng)
[![GitHub version](https://badge.fury.io/gh/nuysoft%2Fbisheng.png)](http://badge.fury.io/gh/nuysoft%2Fbisheng)
[![Bower version](https://badge.fury.io/bo/bishengjs.png)](http://badge.fury.io/bo/bishengjs)
[![Views in the last 24 hours](https://sourcegraph.com/api/repos/github.com/thx/bisheng/counters/views-24h.png)](https://github.com/thx/bisheng/)

<!-- BI-Directional / Two-Way Data-Binding with JavaScript. -->

纯粹的数据双向绑定库。

BiSheng.js 的名称源自“[毕昇]”，他是活字印刷术的发明者。因为单向绑定犹如“刻版印刷”，双向绑定犹如“活字印刷”，故名 BiSheng.js。

[毕昇]: http://baike.baidu.com/subview/33366/11034585.htm?fromtitle=%E6%AF%95%E5%8D%87&fromid=64860&type=syn

## API & 文档

* [BiSheng](doc/bisheng.md)
* [Loop](doc/loop.md)
* [工作原理](doc/how.md)

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
