function bind(data, tpl, task, expected, before) {
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
        container.empty()
        BiSheng.unbind(data)
        start()
    })
    task()
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
    bind(data, tpl, task, expected)
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
    bind(data, tpl, task, expected)
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
        equal('3 3 4 4', container.text(), tpl)
    }
    bind(data, tpl, task, expected)
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
    bind(data, tpl, task, expected)
})

test('multi-placeholder + multi-wrapper', function() {
    var tpl = '<span>{{foo}}</span> <span>{{foo}}</span> <span>{{bar}}</span> <span>{{bar}}</span>'
    var data = {
        foo: 1,bar:2
    }
    var task = function() {
        data.foo = 3
        data.bar = 4
    }
    var expected = function(container) {
        equal('3 3 4 4', container.text(), tpl)
    }
    bind(data, tpl, task, expected)
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
    bind(data, tpl, task, expected)
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
    bind(data, tpl, task, expected)
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
    bind(data, tpl, task, expected)
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
    bind(data, tpl, task, expected)
})

test('style', function() {
    var tpl = '<div style="width: {{width}}px; height: {{height}}px; background-color: red;">{{width}}, {{height}}</div>'
    var data = {
        width: 100,
        height: 50
    }
    var task = function() {
        data.width = 200
        data.height = 100
    }
    var expected = function(container) {
        equal('200px', container.find('div').css('width'), tpl)
        equal('100px', container.find('div').css('height'), tpl)
        equal('200, 100', container.find('div').text(), tpl)
    }
    bind(data, tpl, task, expected)
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
    bind(data, tpl, task, expected)
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
    bind(data, tpl, task, expected, before)
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
    bind(data, tpl, task, expected, before)
})

module('BiSheng Block')


module('BiSheng Form')


module('BiSheng Helper')

