module('Expression')

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
        /*
            IE 3344
            其他 3 3 4 4
        */
        ok(/3\s?3\s?4\s?4/.test(container.text()), tpl)
        // equal(container.text(), '3 3 4 4', tpl)
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