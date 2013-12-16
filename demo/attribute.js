(function attribute() {
    return
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

(function attribute() {
    return
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

(function attribute() {
    return
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

(function attribute() {
    // return
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