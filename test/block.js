module('Block')

test('if-helper missing, interpret as with-helper, delete', function() {
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
    var task = function() {
        delete data.noop
    }
    var expected = function(container) {
        var text = $.trim(container.find('.body').text())
        equal(text, '', container.find('.body').html())
    }
    var before = function(container) {
        var text = $.trim(container.find('.body').text())
        equal(text, 'body', text)
    }
    bindThenCheck(data, tpl, task, expected, before)
})

test('if-helper missing, interpret as with-helper, update', function() {
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
    var task = function() {
        data.noop = {
            body: '123'
        }
    }
    var expected = function(container) {
        equal('123', $.trim(container.find('.body').text()))
    }
    var before = function(container) {
        equal('body', $.trim(container.find('.body').text()))
    }
    bindThenCheck(data, tpl, task, expected, before)
})

test('if-helper missing, interpret as if-helper, update', function() {
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
        noop: false
    })
    var task = function() {
        data.noop = true
        data.body = 123
    }
    var expected = function(container) {
        equal('123', $.trim(container.find('.body').text()))
    }
    var before = function(container) {
        equal('', $.trim(container.find('.body').text()))
    }
    bindThenCheck(data, tpl, task, expected, before)
})

test('with-helper, {} > undefined', function() {
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
    var task = function() {
        data.title = 123
        data.story = undefined
    }
    var expected = function(container) {
        equal('123', $.trim(container.find('h1').text()))
        equal(0, container.find('.intro').length)
        equal(0, container.find('.body').length)
    }
    var before = function(container) {
        equal('title', $.trim(container.find('h1').text()))
        equal(1, container.find('.intro').length)
        equal(1, container.find('.body').length)
    }
    bindThenCheck(data, tpl, task, expected, before)
})

test('with-helper, {} > {}', function() {
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
    var task = function() {
        data.title = 123
        data.story = {
            intro: 456,
            body: 789
        }
    }
    var expected = function(container) {
        equal('123', $.trim(container.find('h1').text()))
        var intro = container.find('.intro').text()
        ok(/intro:\s?456/.test(intro), intro)
        var body = container.find('.body').text()
        ok(/body:\s?789/.test(body), body)
    }
    var before = function(container) {
        equal('title', $.trim(container.find('h1').text()))
        equal(container.find('.intro').text(), 'intro: intro')
        equal(container.find('.body').text(), 'body: body')
    }
    bindThenCheck(data, tpl, task, expected, before)
})

test('each-helper, add', function() {
    var tpl = Mock.heredoc(function() {
        /*
<div class="comments">
  {{#each comments}}
    <div class="comment">
      <h2>{{subject}}</h2>
      <span>{{{body}}}</span>
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
    var task = function() {
        data.comments.push({
            subject: Random.title(1),
            body: Random.sentence(5)
        })
    }
    var expected = function(container) {
        equal(4, container.find('div.comment').length)
        /*
            KISSY 1.4 的选择器不支持 :eq()
        */
        equal(data.comments[3].subject,
            // container.find('div.comment:eq(3) h2').text()
            container.find('div.comment').eq(3).find('h2').text()
        )
        equal(data.comments[3].body,
            // container.find('div.comment:eq(3) span').text()
            container.find('div.comment').eq(3).find('span').text()
        )
        equal(0, container.find('h3').length)
    }
    var before = function(container) {
        equal(3, container.find('div.comment').length)
        equal(0, container.find('h3').length)
    }
    bindThenCheck(data, tpl, task, expected, before)
})

test('each-helper, delete', function() {
    var tpl = Mock.heredoc(function() {
        /*
<div class="comments">
  {{#each comments}}
    <div class="comment">
      <h2>{{subject}}</h2>
      <span>{{{body}}}</span>
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
    var task = function() {
        data.comments.pop()
    }
    var expected = function(container) {
        equal(container.find('div.comment').length, 2, container.html())
        equal(0, container.find('h3').length)
    }
    var before = function(container) {
        equal(container.find('div.comment').length, 3, container.html())
        equal(0, container.find('h3').length)
    }
    bindThenCheck(data, tpl, task, expected, before)
})

test('each-helper, empty', function() {
    var tpl = Mock.heredoc(function() {
        /*
<div class="comments">
  {{#each comments}}
    <div class="comment">
      <h2>{{subject}}</h2>
      <span>{{{body}}}</span>
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
    var task = function() {
        data.comments = []
    }
    var expected = function(container) {
        equal(0, container.find('div.comment').length)
        equal(1, container.find('h3').length)
    }
    var before = function(container) {
        equal(3, container.find('div.comment').length)
        equal(0, container.find('h3').length)
    }
    bindThenCheck(data, tpl, task, expected, before)
})