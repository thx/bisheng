(function attribute_title() {
    // return
    var tpl = Mock.heredoc(function() {
        /*
<span title="{{title}}">
    属性 <code>title</code> 在变
</span>
         */
    })
    var data = Mock.tpl(tpl, {
        title: '@TITLE'
    })
    doit(data, tpl)

    tasks.push(
        function() {
            data.title = Random.title(3)
        }
    )
})();

(function attribute_class() {
    // return
    var tpl = Mock.heredoc(function() {
        /*
<span class="before {{title}} after">
    属性 <code>class</code> 的一部分在变
</span>'
         */
    })
    var data = Mock.tpl(tpl, {
        title: '@TITLE'
    })
    doit(data, tpl)

    tasks.push(
        function() {
            data.title = Random.title(3)
        }
    )
})();

(function attribute_style() {
    // return
    var tpl = Mock.heredoc(function() {
        /*
<span style="width: {{width}}px; height: auto">
    属性 <code>style</code> 的一部分在变
</span>
         */
    })
    var data = Mock.tpl(tpl, {
        width: '@INTEGER(200,500)'
    })
    doit(data, tpl)

    tasks.push(
        function() {
            data.width = Random.integer(60, 100) + '%'
        }
    )
})();

(function attribute_part() {
    return
    var tpl = Mock.heredoc(function() {
        /*
<a href="/mock/{{guid}}">
    属性 href 再变
</a>
         */
    })
    var data = Mock.tpl(tpl, {
        guid: '@GUID'
    })
    doit(data, tpl)

    tasks.push(
        function() {
            data.guid = Random.guid()
        }
    )
})();

(function attribute_block() {
    // return
    var tpl = Mock.heredoc(function() {
        /*
<div class="{{#unless length}}hide{{/unless}}">
    我一路种下了蘑菇、只为让你知道回家的路。 --- 迅捷斥候
</div>
<span>{{length}}</span>
         */
    })
    var data = Mock.tpl(tpl, {
        length: '@BOOLEAN'
    })
    doit(data, tpl)

    tasks.push(
        function() {
            data.length = Random.boolean()
        }
    )
})();