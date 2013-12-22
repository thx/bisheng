BiSheng.js（毕昇，活字版印刷术发明者）
====

<!-- BI-Directional / Two-Way Data-Binding with JavaScript. -->

轻量级的数据双向绑定库。

## 目录
<!-- TODO -->

    bisheng
    ├── dist
    │   ├── bisheng.js
    │   ├── bisheng-min.js
    │   └── bisheng-min.map
    ├── doc
    │   ├── index.md
    │   ├── loop.md
    │   └── template.html
    ├── src
    │   ├── ast.js
    │   ├── expose.js
    │   ├── flush.js
    │   ├── bisheng.js
    │   ├── loop.js
    │   └── scan.js
    └── test
        ├── attribute.html
        ├── attribute.js
        ├── block.html
        ├── block.js
        ├── expression.html
        ├── expression.js
        ├── form.html
        ├── form.js
        ├── loop.html
        └── loop.js

## 用法

### 安装包和依赖关系

    $ npm install -g bower
    $ npm install
    $ bower install

### BiSheng.bind(data, tpl, callback)

    // HTML 模板
    var tpl = '{{title}}'
    // 数据对象
    var data = {
      title: 'foo'
    }
    // 执行双向绑定，然后在回调函数中将绑定后的 DOM 元素插入文档中
    BiSheng.bind(data, tpl, function(content){
      $('div.container').append(content)
    })

## 演示

    grunt 

访问 <http://localhost:5000/>。
