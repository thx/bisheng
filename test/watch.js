module('Watch')


function doBiShengWatch(data, properties, task, expected) {
    stop()

    function doit(changes) {
        deepEqual(changes, expected, task + ' ' + JSON.stringify(changes))
        BiSheng.unwatch(data)
        start()
    }

    properties ? BiSheng.watch(data, properties, doit) :
        BiSheng.watch(data, doit)

    task()
}

test('BiSheng.watch(data, fn(changes))', function() {
    var data = {}
    var task = function() {
        data.foo = 123
    }
    var expected = [{
        type: 'add',
        path: ['foo'],
        value: 123
    }]
    doBiShengWatch(data, undefined, task, expected)
})

test('BiSheng.watch(data, property, fn(change))', function() {
    var data = {}
    var task = function() {
        data.foo = 123
    }
    var expected = {
        type: 'add',
        path: ['foo'],
        value: 123
    }
    doBiShengWatch(data, 'foo', task, expected)
})

test('BiSheng.watch(data, properties, fn(change))', function() {
    var data = {}
    var task = function() {
        data.foo = 123
    }
    var expected = {
        type: 'add',
        path: ['foo'],
        value: 123
    }
    doBiShengWatch(data, ['foo'], task, expected)
})

test('BiSheng.watch(data, property, fn(change)), nested', function() {
    var data = {
        foo: {}
    }
    var task = function() {
        data.foo.bar = 123
    }
    var expected = {
        type: 'add',
        path: ['foo', 'bar'],
        value: 123
    }
    doBiShengWatch(data, 'foo', task, expected)
})

/*
var data = {}
BiSheng.watch(data, ['a', 'b', 'c'], function(change) {
    console.json(change)
})
BiSheng.watch(data, function(change) {
    console.json(change)
})
*/

module('Unwatch')

function doBiShengUnwatch(expected) {
    var data = {}
    var noop = function() {}

    BiSheng.watch(data, 'foo', noop) // 1
    BiSheng.watch(data, ['foo'], noop) // 2
    BiSheng.watch(data, ['foo', 'bar'], noop) // 3
    BiSheng.watch(data, noop) // 4
    equal(BiSheng.Loop.tasks.length, 4, '共计 4 个监听函数')

    expected(data, noop)
}


test('BiSheng.unwatch(data, properties, fn)', function() {
    doBiShengUnwatch(function(data, fn) {
        BiSheng.unwatch(data, 'foo', fn) // 移除第 1、2 个监听函数
        equal(BiSheng.Loop.tasks.length, 2, '移除第 1、2 个监听函数')

        BiSheng.unwatch(data, 'bar', fn) // 移除第 3 个监听函数
        equal(BiSheng.Loop.tasks.length, 1, '移除第 3 个监听函数')

        BiSheng.unwatch(data, fn) // 移除第 4 个监听函数
        equal(BiSheng.Loop.tasks.length, 0, '移除第 4 个监听函数')
    })
})
test('BiSheng.unwatch(data, properties)', function() {
    doBiShengUnwatch(function(data, fn) {
        BiSheng.unwatch(data, 'bar') // 3
        equal(BiSheng.Loop.tasks.length, 4, '移除第 3 个监听函数')

        BiSheng.unwatch(data, 'foo') // 1, 2, 3
        equal(BiSheng.Loop.tasks.length, 1, '移除第 1、2、3 个监听函数')

        BiSheng.unwatch(data, fn) // 4
        equal(BiSheng.Loop.tasks.length, 0, '移除第 4 个监听函数')

    })
})
test('BiSheng.unwatch(data, fn)', function() {
    doBiShengUnwatch(function(data, fn) {
        BiSheng.unwatch(data, fn)
        equal(BiSheng.Loop.tasks.length, 0, '移除所有监听函数')
    })
})
test('BiSheng.unwatch(data)', function() {
    doBiShengUnwatch(function(data, fn) {
        BiSheng.unwatch(data)
        equal(BiSheng.Loop.tasks.length, 0, '移除所有监听函数')
    })
})
test('BiSheng.unwatch(fn)', function() {
    doBiShengUnwatch(function(data, fn) {
        BiSheng.unwatch(fn)
        equal(BiSheng.Loop.tasks.length, 0, '移除所有监听函数')
    })
})