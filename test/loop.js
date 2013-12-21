module('Loop')

console.json = function(json) {
    console.log(JSON.stringify(json, null, 4))
}

function doit(data, task, expected) {
    stop()
    Hyde.Loop.watch(data, function(changes) {
        deepEqual(changes, expected, task)
        Hyde.Loop.watch(data)
        start()
    })
    task()
}

test('object add', function() {
    var data = {}
    var task = function() {
        data.foo = 123
    }
    var expected = [{
        type: 'add',
        path: ['foo'],
        value: 123
    }]
    doit(data, task, expected)
})

test('object delete', function() {
    var data = {
        foo: 123
    }
    var task = function() {
        delete data.foo
    }
    var expected = [{
        type: 'delete',
        path: ['foo'],
        value: 123
    }]
    doit(data, task, expected)
})

test('object update', function() {
    var data = {
        foo: 123
    }
    var task = function() {
        data.foo = 456
    }
    var expected = [{
        type: 'update',
        path: ['foo'],
        value: 456,
        oldValue: 123
    }]
    doit(data, task, expected)
})

test('nested object add', function() {
    var data = {
        a: {
            b: {
                c: {}
            }
        }
    }
    var task = function() {
        data.a.b.c.d = 123
    }
    var expected = [{
        type: 'add',
        path: ['a', 'b', 'c', 'd'],
        value: 123
    }]
    doit(data, task, expected)
})

test('nested object delete', function() {
    var data = {
        a: {
            b: {
                c: {
                    d: 123
                }
            }
        }
    }
    var task = function() {
        delete data.a.b.c.d
    }
    var expected = [{
        type: 'delete',
        path: ['a', 'b', 'c', 'd'],
        value: 123
    }]
    doit(data, task, expected)
})

test('nested object update', function() {
    var data = {
        a: {
            b: {
                c: {
                    d: 123
                }
            }
        }
    }
    var task = function() {
        data.a.b.c.d = 456
    }
    var expected = [{
        type: 'update',
        path: ['a', 'b', 'c', 'd'],
        value: 456,
        oldValue: 123
    }]
    doit(data, task, expected)
})

test('array add', function() {
    var data = []
    var task = function() {
        data.push(123)
    }
    var expected = [{
        type: 'add',
        path: ['0'],
        value: 123
    }]
    doit(data, task, expected)
})

test('array delete', function() {
    var data = [123]
    var task = function() {
        data.pop()
    }
    var expected = [{
        type: 'delete',
        path: ['0'],
        value: 123
    }]
    doit(data, task, expected)
})

test('array update', function() {
    var data = [123]
    var task = function() {
        data[0] = 456
    }
    var expected = [{
        type: 'update',
        path: ['0'],
        value: 456,
        oldValue: 123
    }]
    doit(data, task, expected)
})

test('nested array add', function() {
    var data = [
        []
    ]
    var task = function() {
        data[0].push(123)
    }
    var expected = [{
        type: 'add',
        path: ['0', '0'],
        value: 123
    }]
    doit(data, task, expected)
})

test('nested array delete', function() {
    var data = [
        [123]
    ]
    var task = function() {
        data[0].pop()
    }
    var expected = [{
        type: 'delete',
        path: ['0', '0'],
        value: 123
    }]
    doit(data, task, expected)
})

test('nested array update', function() {
    var data = [
        [123]
    ]
    var task = function() {
        data[0][0] = 456
    }
    var expected = [{
        type: 'update',
        path: ['0', '0'],
        value: 456,
        oldValue: 123
    }]
    doit(data, task, expected)
})