title: BiSheng.js
author:
  name: 墨智
  email: mozhi.gyy@alibaba-inc.com
  url: http://nuysoft.com
output: what.html
controls: true

--

# BiSheng.js
## 　
## 纯粹的数据双向绑定库

--

### 毕昇

<p style="text-align: center;">
    <img src="image/bisheng.jpg" height="200">
    <img src="image/he.png" height="200">
</p>

<p style="text-align: center;">
    单向绑定犹如“刻版印刷”，双向绑定犹如“活字印刷”，
</p>
<p style="text-align: center;">
    故名 `BiSheng.js`。
</p>

--

### 目录

* 特性
* 浏览器支持
* API
* 示例
* 开发方式
* 工作原理

--

### 特性

* 表达式 <br> `{{foo}}`
* 逻辑块 <br> `{{#with story}}{{{intro}}}{{/with}}`
* 属性 <br> `<span title="{{title}}">{{title}}</span>`
* 表单 <br> `<input class="form-control" value="{{first}}">`

--

### 特性

现在只支持 [Handlebars.js]。

下一步支持 [CROX](gitlab.alibaba-inc.com/thx/crox)、[KISSY XTemplate](http://docs.kissyui.com/1.4/docs/html/api/xtemplate/index.html)。

[Handlebars.js]: http://handlebarsjs.com/

--

### 浏览器支持

* Internet Explorer
    
    6+

* Chrome, Safari, Firefox, Opera
    
    前一个和当前版本（TODO）

--

### API

* BiSheng.bind(data, tpl, callback)

    在模板和数据之间执行双向绑定。

* BiSheng.unbind(data, tpl)

    解除数据和模板之间的双向绑定。

详细说明：[HTML](bisheng.html)，[Markdown](bisheng.md)。

--

### 示例

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

    // 解除双向绑定
    BiSheng.unbind(data, tpl);

    // 改变数据 data.title，对应的文档区域不会更新
    data.title = 'foo'

--

### API

* BiSheng.watch(data, fn(changes))

    为所有属性添加监听函数。

* BiSheng.unwatch(data, fn)
    
    移除监听函数。

详细说明：[HTML](bisheng.html)，[Markdown](bisheng.md)。

--

### 示例

    var data = { foo: 'foo' }
    BiSheng.watch(data, function(changes){
        console.log(JSON.stringify(changes, null, 4))
    })

    data.foo = 'bar'
    // => 见下一页
    
    setTimeout(function(){
        BiSheng.unwatch(data)
        data.foo = 'foo'
        // => 
    }, 1000)

--

### 示例

    // =>
    [
        {
            "type": "update",
            "path": [
                3,
                "foo"
            ],
            "value": "bar",
            "oldValue": "foo",
            "root": {
                "foo": "bar"
            },
            "context": {
                "foo": "bar"
            }
        }
    ]

--
### 开发方式

* 事件驱动编程 & 运行
* 数据驱动编程 & 运行

> 数据要比编程逻辑更容易驾驭。——《Unix 编程艺术》

<!-- 所以接下来，如果要在复杂数据和复杂代码中选择一个，宁愿选择前者。更进一步：在设计中，你应该主动将代码的复杂度转移到数据之中去。 -->

<http://localhost:5000/test/bisheng.html?noglobals=true&notrycatch=true&testNumber=66>

--
### 工作原理

1. 修改语法树，插入定位符。
2. 渲染模板和定位符。
3. 解析定位符。
4. 建立数据到 DOM 元素的连接。
5. 建立 DOM 元素到数据的连接。

详细说明：[HTML](how.html)，[Markdown](how.md)。

--

#### 以模板 `{{title}}` 为例

    // HTML 模板
    var tpl = '{{title}}'
    // 数据对象
    var data = {
      title: '注意，title 的值在这里'
    }
    // 执行双向绑定
    BiSheng.bind(data, tpl, function(content){
      // 然后在回调函数中将绑定后的 DOM 元素插入文档中
      $('div.container').append(content)
    });
    // 改变数据 data.title，对应的文档区域会更新
    data.title = 'bar'

--

#### 1. 修改语法树，插入定位符

    <script guid="1" slot="start" type="" path="{{$lastest title}}" isHelper="false"></script>
    <script guid="1" slot="end"></script>

<p></p>

    Handlebars.registerHelper('$lastest', function(items, options) {
        return items && items.$path || this && this.$path
    })

--

#### 2. 渲染模板和定位符

    Handlebars.compile(ast)(data)

<p></p>
    
    &lt;script guid="1" slot="start" type="" path="1.title" isHelper="false"&gt;&lt;/script&gt;
    注意，title 的值在这里
    &lt;script guid="1" slot="end"&gt;&lt;/script&gt;

--

#### 3. 扫描 DOM 元素，解析定位符

    <script guid="1" slot="start" type="" path="1.title" isHelper="false"></script>
    注意，title 的值在这里
    <script guid="1" slot="end"></script>

--

#### 4. 建立数据到 DOM 元素的连接

    script[slot="start"][path="1.title"]

--

#### 5. 建立 DOM 元素到数据的连接

    $(target).on('change.bisheng keyup.bisheng', function(event) {
        updateValue(data, path, event.target)
    })

--

### 目录

* 特性
* 浏览器支持
* API
* 示例
* 开发方式
* 工作原理

> 只做一件事，并做好。——《Unix 编程艺术》

<style type="text/css">
    pre {
        padding: 0px;
    }
</style>
<link rel="stylesheet" href="../bower_components/highlightjs/styles/rainbow.css">
<script src="../bower_components/highlightjs/highlight.pack.js"></script>
<script>hljs.initHighlightingOnLoad();</script>