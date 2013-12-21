module('Hyde')

function dohyde(data, tpl, task, expected) {
    stop()
    var container = $('div.container')
    Hyde.bind(data, tpl, function(content) {
        container.append(content)
    })
    Hyde.Loop.watch(data, function(changes) {
        container.each(function(index, item){
            expected($(item))
        })
        container.empty()
        start()
    })
    task()
}

test('hyde expression, placeholder', function() {
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
    dohyde(data, tpl, task, expected)
})

test('hyde expression, escape', function() {
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
    dohyde(data, tpl, task, expected)
})

test('hyde expression, placeholder + wrapper', function() {
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
    dohyde(data, tpl, task, expected)
})

test('hyde expression, dot', function() {
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
    dohyde(data, tpl, task, expected)
})

test('hyde expression, slash', function() {
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
    dohyde(data, tpl, task, expected)
})

test('hyde expression, attribute title', function() {
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
    dohyde(data, tpl, task, expected)
})

test('hyde expression, attribute class', function() {
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
    dohyde(data, tpl, task, expected)
})

test('hyde expression, attribute style', function() {
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
    dohyde(data, tpl, task, expected)
})

test('hyde expression, attribute part', function() {
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
    dohyde(data, tpl, task, expected)
})

test('hyde expression, attribute block', function() {
    var tpl = '<div class="before {{#unless length}}hide{{/unless}} after">{{length}}</div>'
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
        equal('false', container.find('div').text(), tpl)
    }
    dohyde(data, tpl, task, expected)
})

test('hyde expression, attribute block', function() {
    var tpl = '<div class="before {{#unless length}}hide{{/unless}} after">{{length}}</div>'
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
    dohyde(data, tpl, task, expected)
})