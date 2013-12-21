(function expression() {
    // return
    var tpl = '{{title}}'
    var data = Mock.tpl(tpl, {
        title: '@TITLE'
    })
    doit(data, tpl, arguments.callee.name)

    tasks.push(
        function() {
            data.title = Random.title(3)
        }
    )
})();

(function expression() {
    // return
    var tpl = '<span>{{title}}</span>'
    var data = Mock.tpl(tpl, {
        title: '@TITLE'
    })
    doit(data, tpl, arguments.callee.name)

    tasks.push(
        function() {
            data.title = Random.title(3)
        }
    )
})();

(function expression_dot() {
    // return
    var tpl = '<span>{{article.title}}</span>'
    var data = Mock.tpl(tpl)
    doit(data, tpl, arguments.callee.name)

    tasks.push(
        function() {
            data.article = {
                title: Random.guid()
            }
        }
    )
})();

(function expression_slash() {
    // return
    var tpl = '<span>{{article/title}}</span>'
    var data = Mock.tpl(tpl)
    doit(data, tpl, arguments.callee.name)

    tasks.push(
        function() {
            data.article = {
                title: Random.sentence()
            }
        }
    )
})();

(function expression_escape() {
    // return
    var tpl = '<span>{{{foo}}}</span>'
    var data = Mock.tpl(tpl)
    doit(data, tpl, arguments.callee.name)

    tasks.push(
        function() {
            data.foo = '<a href="#">' + Random.title(3) + '</a>'
        }
    )
})();

(function expression_complex() {
    // return
    var tpl = Mock.heredoc(function() {
        /*
{{#with hero}}
<div class="media">
    <a class="pull-left" href="#">
      <img class="media-object" src="{{icon}}" style="width: 64px; height: 64px;">
    </a>
    <div class="media-body">
        <h4 class="media-heading">{{name}}</h4>
        {{tooltip}}
    </div>
</div>
{{/with}}
         */
    })
    var data = Mock.tpl(tpl, {
        hero: Random.hero()
    })
    doit(data, tpl, arguments.callee.name)

    tasks.push(
        function() {
            data.hero = Random.hero()
        }
    )
})();