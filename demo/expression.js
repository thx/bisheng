(function expression() {
    // return
    var tpl = '<span>{{title}}</span>'
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

(function expression() {
    // return
    var tpl = '<span>{{article.title}}</span>'
    var data = Mock.tpl(tpl)
    doit(data, tpl)

    tasks.push(
        function() {
            data.article = {
                title: Random.guid()
            }
        }
    )
})();

(function expression() {
    // return
    var tpl = '<span>{{article/title}}</span>'
    var data = Mock.tpl(tpl)
    doit(data, tpl)

    tasks.push(
        function() {
            data.article = {
                title: Random.sentence()
            }
        }
    )
})();

(function expression() {
    // return
    var tpl = '<span>{{{foo}}}</span>'
    var data = Mock.tpl(tpl)
    doit(data, tpl)

    tasks.push(
        function() {
            data.foo = '<a href="#">' + Random.title(3) + '</a>'
        }
    )
})();