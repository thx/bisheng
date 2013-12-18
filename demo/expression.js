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

(function expression_escap() {
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

(function expression_placeholder() {
    // return
    var tpl = '<span>{{{lines}}}</span>'
    var data = Mock.tpl(tpl, {
        lines: '@LINES'
    })
    doit(data, tpl, arguments.callee.name)

    tasks.push(
        function() {
            data.lines = Random.lines()
        }
    )
})();