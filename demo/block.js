$('div.container').append('<h2>Basic Blocks</h2>')

;
(function block() {
    // return
    var tpl = Mock.heredoc(function() {
        /*
<div class="entry">
  <h1>{{title}}</h1>
  <div class="body">
    {{#noop}}{{body}}{{/noop}}
  </div>
</div>
        */
    })
    var data = Mock.tpl(tpl)
    doit(data, tpl)

    tasks.push(
        function() {
            data.title = Random.title(1)
        },
        function() {
            delete data.noop
        },
        function() {
            data.noop = {}
            data.noop.body = Random.sentence(3, 5)
        },
        function() {
            data.noop = {
                body: Random.sentence(3, 5)
            }
        }
    )
})();

(function block() {
    // return
    var tpl = Mock.heredoc(function() {
        /*
<div class="entry">
  <h1>{{title}}</h1>
  <div class="body">
    {{#noop}}{{body}}{{/noop}}
  </div>
</div>
        */
    })
    var data = Mock.tpl(tpl, {
        noop: true
    })
    doit(data, tpl)

    tasks.push(
        function() {
            data.title = Random.title(1)
        },
        function() {
            data.body = Random.sentence(3, 5)
        },
        function() {
            data.noop = !data.noop
        }
    )
})();

$('div.container').append('<h2>The with helper</h2>')

;
(function helper() {
    // return
    var tpl = Mock.heredoc(function() {
        /*
<div class="entry">
  <h1>{{title}}</h1>
  {{#with story}}
    <div class="intro">intro: {{{intro}}}</div>
    <div class="body">body: {{{body}}}</div>
  {{/with}}
</div>
        */
    })
    var data = Mock.tpl(tpl)
    doit(data, tpl)

    tasks.push(
        function() {
            data.story = undefined
        },
        function() {
            data.title = Random.title(1)
        },
        function() {
            if (data.story) data.story.intro = Random.sentence(3, 5)
        },
        function() {
            if (data.story) data.story.body = Random.sentence(5, 7)
        },
        function() {
            data.story = {
                intro: Random.sentence(3, 5),
                body: Random.sentence(5, 7)
            }
        }
    )
})();

$('div.container').append('<h2>Simple Iterators</h2>')

;
(function each() { // TODO 优化数组的更新
    // return
    var tpl = Mock.heredoc(function() {
        /*
<div class="comments">
  {{#each comments}}
    <div class="comment">
      <h2>{{subject}}</h2>
      {{{body}}}
    </div>
  {{/each}}
  {{#unless comments}}
    <h3 class="warning">WARNING: This entry does not have any records!</h3>
  {{/unless}}
</div>
        */
    })
    var data = Mock.tpl(tpl, {
        'comments|3': [{
            subject: '@TITLE(1)',
            body: '@SENTENCE(5)'
        }]
    })
    doit(data, tpl)
    tasks.push(
        function() {
            if (data.comments.length < 6) {
                data.comments.push({
                    subject: Random.title(1),
                    body: Random.sentence(5)
                })
                data.comments.push({
                    subject: Random.title(1),
                    body: Random.sentence(5)
                })
            }
        },
        function() {
            data.comments.pop()
        }
    )
})()

;
(function helper() { // TODO
    return
    Handlebars.registerHelper('list', function(context, options) {
        var ret = "<ul>";
        for (var i = 0, j = context.length; i < j; i++) {
            ret = ret + "<li>" + options.fn(context[i]) + "</li>";
        }
        return ret + "</ul>";
    });

    var tpl = Mock.heredoc(function() {
        /*
<div>
{{#list nav}}
  <a href="{{url}}">{{title}}</a>
{{/list}}
</div>
        */
    })
    var data = Mock.tpl(tpl, {
        'nav|3': [{
            url: '@URL',
            title: '@TITLE(3,5)'
        }]
    })
    doit(data, tpl)
    tasks.push(
        function() {},
        function() {}
    )
})();