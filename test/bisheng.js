function bindThenCheck(data, tpl, task, expected, before, empty) {
    stop()
    var container = $('div.container')
    BiSheng.bind(data, tpl, function(content) {
        container.append(content)
        container.each(function(index, item) {
            before && before($(item))
        })
    })
    BiSheng.Loop.watch(data, function(changes) {
        container.each(function(index, item) {
            expected($(item))
        })
        if (empty !== false) container.empty()
        // setTimeout(function() {
        BiSheng.unbind(data)
        start()
        // }, 100)
    })
    task(container)
}

module('BiSheng Expression')

test('placeholder', function() {
    var tpl = '{{foo}}'
    var data = {
        foo: 123
    }
    var task = function() {
        data.foo = 456
    }
    var expected = function(container) {
        equal('456', container.text(), tpl)
    }
    bindThenCheck(data, tpl, task, expected)
})

test('escape', function() {
    var tpl = '{{{foo}}}'
    var data = {
        foo: 123
    }
    var task = function() {
        data.foo = 456
    }
    var expected = function(container) {
        equal('456', container.text(), tpl)
    }
    bindThenCheck(data, tpl, task, expected)
})

test('multi-placeholder', function() {

    var tpl = '{{foo}} {{foo}} {{bar}} {{bar}}'
    var data = {
        foo: 1,
        bar: 2
    }
    var task = function() {
        data.foo = 3
        data.bar = 4
    }
    var expected = function(container) {
        equal(container.text(), '3 3 4 4', tpl)
    }
    bindThenCheck(data, tpl, task, expected)
})

test('placeholder + wrapper', function() {
    var tpl = '<span>{{foo}}</span>'
    var data = {
        foo: 123
    }
    var task = function() {
        data.foo = 456
    }
    var expected = function(container) {
        equal('456', container.text(), tpl)
    }
    bindThenCheck(data, tpl, task, expected)
})

test('multi-placeholder + multi-wrapper', function() {
    var tpl = '<span>{{foo}}</span> <span>{{foo}}</span> <span>{{bar}}</span> <span>{{bar}}</span>'
    var data = {
        foo: 1,
        bar: 2
    }
    var task = function() {
        data.foo = 3
        data.bar = 4
    }
    var expected = function(container) {
        equal(container.text(), '3 3 4 4', tpl)
    }
    bindThenCheck(data, tpl, task, expected)
})

test('dot', function() {
    var tpl = '<span>{{article.title}}</span>'
    var data = {
        article: {
            title: 123
        }
    }
    var task = function() {
        data.article.title = 456
    }
    var expected = function(container) {
        equal('456', container.text(), tpl)
    }
    bindThenCheck(data, tpl, task, expected)
})

test('slash', function() {
    var tpl = '<span>{{article/title}}</span>'
    var data = {
        article: {
            title: 123
        }
    }
    var task = function() {
        data.article.title = 456
    }
    var expected = function(container) {
        equal('456', container.text(), tpl)
    }
    bindThenCheck(data, tpl, task, expected)
})

module('BiSheng Attribute')

test('title', function() {
    var tpl = '<span title="{{title}}">{{title}}</span>'
    var data = {
        title: 123
    }
    var task = function() {
        data.title = 456
    }
    var expected = function(container) {
        equal('456', container.find('span').attr('title'), tpl)
        equal('456', container.find('span').text(), tpl)
    }
    bindThenCheck(data, tpl, task, expected)
})

test('class', function() {
    var tpl = '<span class="before {{title}} after">{{title}}</span>'
    var data = {
        title: 123
    }
    var task = function() {
        data.title = 456
    }
    var expected = function(container) {
        ok(container.find('span').hasClass('before'), tpl)
        ok(container.find('span').hasClass('after'), tpl)
        ok(container.find('span').hasClass('456'), tpl)
        equal('456', container.find('span').text(), tpl)
    }
    bindThenCheck(data, tpl, task, expected)
})

/*
    IE 不支持非法的样式值（这里指带有定位符）
*/
test('style', function() {
    var tpl = '<div style="width: {{width}}px; height: {{height}}px; background-color: green;">{{width}}, {{height}}</div>'
    var data = {
        width: 100,
        height: 50
    }
    var task = function() {
        data.width = 200
        data.height = 100
    }
    var expected = function(container) {
        equal(container.find('div').css('width'), '200px', container.find('div')[0].outerHTML)
        equal(container.find('div').css('height'), '100px', 'height')
        equal(container.find('div').text(), '200, 100', 'text')
    }
    bindThenCheck(data, tpl, task, expected)
})

test('bs-style', function() {
    var tpl = '<div bs-style="width: {{width}}px; height: {{height}}px; background-color: green;">{{width}}, {{height}}</div>'
    var data = {
        width: 100,
        height: 50
    }
    var task = function() {
        data.width = 200
        data.height = 100
    }
    var expected = function(container) {
        equal(container.find('div').attr('bs-style'), 'width: 200px; height: 100px; background-color: green;', container.find('div').attr('bs-style'))
        equal(container.find('div').text(), '200, 100', container.find('div').text())
    }
    bindThenCheck(data, tpl, task, expected)
})

test('part', function() {
    var tpl = '<a href="/testcase/{{id}}">{{id}}</a>'
    var data = {
        id: 123
    }
    var task = function() {
        data.id = 456
    }
    var expected = function(container) {
        equal('/testcase/456', container.find('a').attr('href'), tpl)
        equal('456', container.find('a').text(), tpl)
    }
    bindThenCheck(data, tpl, task, expected)
})

test('block unless true > false', function() {
    var tpl = '<div class="before {{#if length}}show{{/if}} {{#unless length}}hide{{/unless}} after">{{length}}</div>'
    var data = {
        length: true
    }
    var task = function() {
        data.length = false
    }
    var expected = function(container) {
        ok(container.find('div').hasClass('before'), tpl)
        ok(container.find('div').hasClass('after'), tpl)
        ok(container.find('div').hasClass('hide'), tpl)
        ok(!container.find('div').hasClass('show'), tpl)
        equal('false', container.find('div').text(), tpl)
    }
    var before = function(container) {
        ok(!container.find('div').hasClass('hide'), tpl)
        ok(container.find('div').hasClass('show'), tpl)
        equal('true', container.find('div').text(), tpl)
    }
    bindThenCheck(data, tpl, task, expected, before)
})

test('block unless', function() {
    var tpl = '<div class="before {{#if length}}show{{/if}} {{#unless length}}hide{{/unless}} after">{{length}}</div>'
    var data = {
        length: false
    }
    var task = function() {
        data.length = true
    }
    var expected = function(container) {
        ok(container.find('div').hasClass('before'), tpl)
        ok(container.find('div').hasClass('after'), tpl)
        ok(!container.find('div').hasClass('hide'), tpl)
        equal('true', container.find('div').text(), tpl)
    }
    var before = function(container) {
        ok(!container.find('div').hasClass('show'), tpl)
        ok(container.find('div').hasClass('hide'), tpl)
        equal('false', container.find('div').text(), tpl)
    }
    bindThenCheck(data, tpl, task, expected, before)
})

module('BiSheng Block')

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
        equal('', $.trim(container.find('.body').text()))
    }
    var before = function(container) {
        equal('body', $.trim(container.find('.body').text()))
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
        equal('intro: 456', container.find('.intro').text())
        equal('body: 789', container.find('.body').text())
    }
    var before = function(container) {
        equal('title', $.trim(container.find('h1').text()))
        equal('intro: intro', container.find('.intro').text())
        equal('body: body', container.find('.body').text())
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
        equal(data.comments[3].subject, container.find('div.comment:eq(3) h2').text())
        equal(data.comments[3].body, container.find('div.comment:eq(3) span').text())
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
        equal(2, container.find('div.comment').length)
        equal(0, container.find('h3').length)
    }
    var before = function(container) {
        equal(3, container.find('div.comment').length)
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


module('BiSheng Form')

test('input, data => value', function() {
    var tpl = Mock.heredoc(function() {
        /*
<p><input class="form-control" value="{{first}}"></p>
<p>{{first}}</p>
        */
    })
    var data = Mock.tpl(tpl)
    var task = function() {
        data.first = 123
    }
    var expected = function(container) {
        equal('123', container.find('input').val())
        equal('123', container.find('p:eq(1)').text())
    }
    var before = function(container) {
        equal('first', container.find('input').val())
        equal('first', container.find('p:eq(1)').text())
    }
    bindThenCheck(data, tpl, task, expected, before)
})

test('input, value => data', function() {
    var tpl = Mock.heredoc(function() {
        /*
<p><input class="form-control" value="{{first}}"></p>
<p>{{first}}</p>
        */
    })
    var data = Mock.tpl(tpl)
    var task = function(container) {
        container.find('input').val(123).trigger('change')
    }
    var expected = function(container) {
        equal('123', data.first)
    }
    var before = function(container) {
        equal('first', container.find('input').val())
        equal('first', container.find('p:eq(1)').text())
    }
    bindThenCheck(data, tpl, task, expected, before)
})

test('select, data => value', function() {
    var tpl = Mock.heredoc(function() {
        /*
<p> 
    <select class="form-control" value="{{role}}"">
        <option>Admin</option>
        <option>User</option>
    </select>
</p>
<p>{{role}}</p>
        */
    })
    var data = Mock.tpl(tpl)
    var task = function() {
        data.role = 'User'
    }
    var expected = function(container) {
        equal('User', container.find('select').val())
        equal('User', container.find('p:eq(1)').text())
    }
    var before = function(container) {
        equal('Admin', container.find('select').val())
        equal('role', container.find('p:eq(1)').text())
    }
    bindThenCheck(data, tpl, task, expected, before)
})

test('select, value => data', function() {
    var tpl = Mock.heredoc(function() {
        /*
<p> 
    <select class="form-control" value="{{role}}"">
        <option>Admin</option>
        <option>User</option>
    </select>
</p>
<p>{{role}}</p>
        */
    })
    var data = Mock.tpl(tpl)
    var task = function(container) {
        container.find('select').val('User').trigger('change') // 必须 trigger 吗？
    }
    var expected = function(container) {
        equal('User', data.role)
    }
    var before = function(container) {
        equal('Admin', container.find('select').val())
        equal('role', container.find('p:eq(1)').text())
    }
    bindThenCheck(data, tpl, task, expected, before)
})

test('textarea, data => dom', function() {
    var tpl = Mock.heredoc(function() {
        /*
<p><textarea class="form-control" rows="3" value="{{description}}">{{description}}</textarea></p>
<p>{{description}}</p>
        */
    })
    var data = Mock.tpl(tpl)
    var task = function() {
        data.description = 123
    }
    var expected = function(container) {
        equal('123', container.find('textarea').val())
        equal('123', container.find('p:eq(1)').text())
    }
    var before = function(container) {
        equal('description', container.find('textarea').val())
        equal('description', container.find('p:eq(1)').text())
    }
    bindThenCheck(data, tpl, task, expected, before)
})

test('textarea, dom => data', function() {
    var tpl = Mock.heredoc(function() {
        /*
<p><textarea class="form-control" rows="3" value="{{description}}">{{description}}</textarea></p>
<p>{{description}}</p>
        */
    })
    var data = Mock.tpl(tpl)
    var task = function(container) {
        container.find('textarea').val(123).trigger('change')
    }
    var expected = function(container) {
        equal('123', data.description)
    }
    var before = function(container) {
        equal('description', container.find('textarea').val())
        equal('description', container.find('p:eq(1)').text())
    }
    bindThenCheck(data, tpl, task, expected, before)
})

test('checkbox, checked, data => dom, false => true', function() {
    var tpl = Mock.heredoc(function() {
        /*
<label>
    <input type="checkbox" checked="{{checkboxChecked}}">
    Option one is this and that&mdash;be sure to include why it's great
</label>
<p>
    {{#if checkboxChecked}}
        Ok.
    {{else}}
        Your must agree it!
    {{/if}}
</p>
        */
    })
    var data = Mock.tpl(tpl, {
        checkboxChecked: 'false'
    })
    var task = function(container) {
        data.checkboxChecked = true
    }
    var expected = function(container) {
        equal(true, container.find('input').prop('checked'))
        equal('Ok.', $.trim(container.find('p').text()))
    }
    var before = function(container) {
        equal(false, container.find('input').prop('checked'))
        equal('Your must agree it!', $.trim(container.find('p').text()))
    }
    bindThenCheck(data, tpl, task, expected, before)
})

test('checkbox, checked, data => dom, true => false', function() {
    var tpl = Mock.heredoc(function() {
        /*
<label>
    <input type="checkbox" checked="{{checkboxChecked}}">
    Option one is this and that&mdash;be sure to include why it's great
</label>
<p>
    {{#if checkboxChecked}}
        Ok.
    {{else}}
        Your must agree it!
    {{/if}}
</p>
        */
    })
    var data = Mock.tpl(tpl, {
        checkboxChecked: 'checked'
    })
    var task = function(container) {
        data.checkboxChecked = false
    }
    var expected = function(container) {
        equal(false, container.find('input').prop('checked'))
        equal('Your must agree it!', $.trim(container.find('p').text()))
    }
    var before = function(container) {
        equal(true, container.find('input').prop('checked'))
        equal('Ok.', $.trim(container.find('p').text()))
    }
    bindThenCheck(data, tpl, task, expected, before)
})

test('checkbox, checked, dom => data, false => true', function() {
    var tpl = Mock.heredoc(function() {
        /*
<label>
    <input type="checkbox" checked="{{checkboxChecked}}">
    Option one is this and that&mdash;be sure to include why it's great
</label>
<p>
    {{#if checkboxChecked}}
        Ok.
    {{else}}
        Your must agree it!
    {{/if}}
</p>
        */
    })
    var data = Mock.tpl(tpl, {
        checkboxChecked: false
    })
    var task = function(container) {
        container.find('input').prop('checked', true).trigger('change')
    }
    var expected = function(container) {
        equal(true, data.checkboxChecked)
        equal('Ok.', $.trim(container.find('p').text()))
    }
    var before = function(container) {
        equal(false, container.find('input').prop('checked'))
        equal('Your must agree it!', $.trim(container.find('p').text()))
    }
    bindThenCheck(data, tpl, task, expected, before)
})

test('checkbox, checked, dom => data, true > false', function() {
    var tpl = Mock.heredoc(function() {
        /*
<label>
    <input type="checkbox" checked="{{checkboxChecked}}">
    Option one is this and that&mdash;be sure to include why it's great
</label>
<p>
    {{#if checkboxChecked}}
        Ok.
    {{else}}
        Your must agree it!
    {{/if}}
</p>
        */
    })
    var data = Mock.tpl(tpl, {
        checkboxChecked: true
    })
    var task = function(container) {
        container.find('input').prop('checked', false).trigger('change')
    }
    var expected = function(container) {
        equal(false, data.checkboxChecked)
        equal('Your must agree it!', $.trim(container.find('p').text()))
    }
    var before = function(container) {
        equal(true, container.find('input').prop('checked'))
        equal('Ok.', $.trim(container.find('p').text()))
    }
    bindThenCheck(data, tpl, task, expected, before)
})

// TODO radio

test('radio, checked, data => dom', function() {
    var tpl = Mock.heredoc(function() {
        /*
<form>
<div class="radio">
    <label>
        <input type="radio" name="optionsRadios" value="{{radioValue1}}" checked="{{radioChecked1}}">
        Option one is this and that&mdash;be sure to include why it's great
    </label>
</div>
<div class="radio">
    <label>
        <input type="radio" name="optionsRadios" value="{{radioValue2}}" checked="{{radioChecked2}}">
        Option two can be something else and selecting it will deselect option one
    </label>
</div>
<p>
    {{optionsRadios}}
</p>
</form>
        */
    })
    var data = Mock.tpl(tpl, {
        radioChecked1: true,
        radioChecked2: false
    })
    var task = function(container) {
        data.radioChecked1 = false
        data.radioChecked2 = true
    }
    var expected = function(container) {
        equal(false, container.find('input:eq(0)').prop('checked'))
        equal(true, container.find('input:eq(1)').prop('checked'))
    }
    var before = function(container) {
        equal(true, container.find('input:eq(0)').prop('checked'))
        equal(false, container.find('input:eq(1)').prop('checked'))
    }
    bindThenCheck(data, tpl, task, expected, before)
})

test('radio, checked, doom => data', function() {
    var tpl = Mock.heredoc(function() {
        /*
<form>
<div class="radio">
    <label>
        <input type="radio" name="optionsRadios" value="{{radioValue1}}" checked="{{radioChecked1}}">
        Option one is this and that&mdash;be sure to include why it's great
    </label>
</div>
<div class="radio">
    <label>
        <input type="radio" name="optionsRadios" value="{{radioValue2}}" checked="{{radioChecked2}}">
        Option two can be something else and selecting it will deselect option one
    </label>
</div>
<p>
    {{optionsRadios}}
</p>
</form>
        */
    })
    var data = Mock.tpl(tpl, {
        radioChecked1: true,
        radioChecked2: false
    })
    var task = function(container) {
        container.find('input:eq(0)').prop('checked', false).trigger('change')
        container.find('input:eq(1)').prop('checked', true).trigger('change')
    }
    var expected = function(container) {
        equal(false, container.find('input:eq(0)').prop('checked'))
        equal(true, container.find('input:eq(1)').prop('checked'))
        equal('radioValue2', $.trim(container.find('p').text()))
    }
    var before = function(container) {
        equal(true, container.find('input:eq(0)').prop('checked'))
        equal(false, container.find('input:eq(1)').prop('checked'))
        equal('optionsRadios', $.trim(container.find('p').text()))
    }
    bindThenCheck(data, tpl, task, expected, before)
})


module('BiSheng Helper')