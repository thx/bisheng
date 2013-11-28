var Watch = require('../../src/watch');
var Mock = require('../../bower_components/mockjs/dist/mock.js');

require('./console.group')

console.log(Mock.heredoc(function() {
    /*
 _    _       _       _       _     
| |  | |     | |     | |     (_)    
| |  | | __ _| |_ ___| |__    _ ___ 
| |/\| |/ _` | __/ __| '_ \  | / __|
\  /\  / (_| | || (__| | | |_| \__ \
 \/  \/ \__,_|\__\___|_| |_(_) |___/
                            _/ |    
                           |__/     
     */
}))

/* jslint evil: true */
function run(data, code, expected, test, debug) {
    var records = []
    Watch.watch(data, ['get', 'set', 'add', 'delete', 'change'], function(event, data) {
        debug && Watch.log(event, data)
        records.push([event.type, data.path])
    })

    debug && console.group(code)
    eval(code)
    debug && console.groupEnd(code)

    test.deepEqual(records, expected)

    Watch.unwatch(data)
}

exports.simple_object_get = function(test) {
    var data = {
        prop: 'foo'
    }

    run(data, "data.prop", [
        ['get', [1, 'prop']]
    ], test)

    test.done()
}

/*exports.simple_object_set = function(test) {
    var data = {
        prop: 'foo'
    }

    run(data, "data.prop = 'foo'", [
        ['set', ['prop']]
    ], test)

    test.done()
}

exports.simple_object_change = function(test) {
    var data = {
        prop: 'foo'
    }

    run(data, "data.prop = 'bar'", [
        ['set', ['prop']],
        ['change', ['prop']]
    ], test)
    run(data, "data.prop = 'bar'", [
        ['set', ['prop']]
    ], test)

    test.done()
}

exports.nested_object_get = function(test) {
    var data = {
        a: {
            b: {
                c: {
                    d: {
                        e: {
                            f: {
                                g: 'g'
                            }
                        }
                    }
                }
            }
        }
    }

    run(data, "data.a", [
        ['get', ['a']]
    ], test)
    run(data, "data.a.b", [
        ['get', ['a']],
        ['get', ['a', 'b']],
    ], test)
    run(data, "data.a.b.c", [
        ['get', ['a']],
        ['get', ['a', 'b']],
        ['get', ['a', 'b', 'c']]
    ], test)
    run(data, "data.a.b.c.d", [
        ['get', ['a']],
        ['get', ['a', 'b']],
        ['get', ['a', 'b', 'c']],
        ['get', ['a', 'b', 'c', 'd']]
    ], test)
    run(data, "data.a.b.c.d.e", [
        ['get', ['a']],
        ['get', ['a', 'b']],
        ['get', ['a', 'b', 'c']],
        ['get', ['a', 'b', 'c', 'd']],
        ['get', ['a', 'b', 'c', 'd', 'e']]
    ], test)
    run(data, "data.a.b.c.d.e.f", [
        ['get', ['a']],
        ['get', ['a', 'b']],
        ['get', ['a', 'b', 'c']],
        ['get', ['a', 'b', 'c', 'd']],
        ['get', ['a', 'b', 'c', 'd', 'e']],
        ['get', ['a', 'b', 'c', 'd', 'e', 'f']]
    ], test)
    run(data, "data.a.b.c.d.e.f.g", [
        ['get', ['a']],
        ['get', ['a', 'b']],
        ['get', ['a', 'b', 'c']],
        ['get', ['a', 'b', 'c', 'd']],
        ['get', ['a', 'b', 'c', 'd', 'e']],
        ['get', ['a', 'b', 'c', 'd', 'e', 'f']],
        ['get', ['a', 'b', 'c', 'd', 'e', 'f', 'g']]
    ], test)

    test.done()
}

exports.nested_object_set = function(test) {
    var data = {
        a: {
            b: {
                c: {
                    d: {
                        e: {
                            f: {
                                g: 'g'
                            }
                        }
                    }
                }
            }
        }
    }

    run(data, "data.a.b.c.d.e.f.g = data.a.b.c.d.e.f.g", [
        ['get', ['a']],
        ['get', ['a', 'b']],
        ['get', ['a', 'b', 'c']],
        ['get', ['a', 'b', 'c', 'd']],
        ['get', ['a', 'b', 'c', 'd', 'e']],
        ['get', ['a', 'b', 'c', 'd', 'e', 'f']],
        ['get', ['a']],
        ['get', ['a', 'b']],
        ['get', ['a', 'b', 'c']],
        ['get', ['a', 'b', 'c', 'd']],
        ['get', ['a', 'b', 'c', 'd', 'e']],
        ['get', ['a', 'b', 'c', 'd', 'e', 'f']],
        ['get', ['a', 'b', 'c', 'd', 'e', 'f', 'g']],
        ['set', ['a', 'b', 'c', 'd', 'e', 'f', 'g']]
    ], test)
    run(data, "data.a.b.c.d.e.f.g = 'g'", [
        ['get', ['a']],
        ['get', ['a', 'b']],
        ['get', ['a', 'b', 'c']],
        ['get', ['a', 'b', 'c', 'd']],
        ['get', ['a', 'b', 'c', 'd', 'e']],
        ['get', ['a', 'b', 'c', 'd', 'e', 'f']],
        ['set', ['a', 'b', 'c', 'd', 'e', 'f', 'g']]
    ], test)

    test.done()
}

exports.nested_object_change_as_primitive = function(test) {
    var data = {
        a: {
            b: {
                c: {
                    d: {
                        e: {
                            f: {
                                g: 'g'
                            }
                        }
                    }
                }
            }
        }
    }

    run(data, "data.a.b.c.d.e.f.g = Mock.Random.guid()", [
        ['get', ['a']],
        ['get', ['a', 'b']],
        ['get', ['a', 'b', 'c']],
        ['get', ['a', 'b', 'c', 'd']],
        ['get', ['a', 'b', 'c', 'd', 'e']],
        ['get', ['a', 'b', 'c', 'd', 'e', 'f']],
        ['set', ['a', 'b', 'c', 'd', 'e', 'f', 'g']],
        ['change', ['a', 'b', 'c', 'd', 'e', 'f', 'g']]
    ], test)

    test.done()
}

exports.nested_object_change_as_object = function(test) {
    var data = {
        a: {
            b: {
                c: {
                    d: {
                        e: {
                            f: {
                                g: 'g'
                            }
                        }
                    }
                }
            }
        }
    }

    run(data, "data.a = { h: 'h' }", [
        ['set', ['a']],
        ['change', ['a']]
    ], test)

    run(data, "data.a.h", [
        ['get', ['a']],
        ['get', ['a', 'h']]
    ], test)

    run(data, "data.a.h = Mock.Random.guid()", [
        ['get', ['a']],
        ['set', ['a', 'h']],
        ['change', ['a', 'h']]
    ], test)

    test.done()
}

exports.nested_object_change_as_function = function(test) {
    var data = {
        a: {
            b: {
                c: {
                    d: {
                        e: {
                            f: {
                                g: 'g'
                            }
                        }
                    }
                }
            }
        }
    }

    run(data, "data.a.b.c.d.e.f.g = Mock.Random.guid", [
        ['get', ['a']],
        ['get', ['a', 'b']],
        ['get', ['a', 'b', 'c']],
        ['get', ['a', 'b', 'c', 'd']],
        ['get', ['a', 'b', 'c', 'd', 'e']],
        ['get', ['a', 'b', 'c', 'd', 'e', 'f']],
        ['set', ['a', 'b', 'c', 'd', 'e', 'f', 'g']],
        ['change', ['a', 'b', 'c', 'd', 'e', 'f', 'g']]
    ], test)

    test.done()
}

exports.simple_array_get = function(test) {
    var data = Mock.mock({
        'list|3': ['@EMAIL']
    })

    run(data, "data.list[0]", [
        ['get', ['list']],
        ['get', ['list', 0]],
    ], test)
    run(data, "data.list[1]", [
        ['get', ['list']],
        ['get', ['list', 1]],
    ], test)
    run(data, "data.list[2]", [
        ['get', ['list']],
        ['get', ['list', 2]],
    ], test)
    run(data, "data.list[3]", [
        ['get', ['list']]
    ], test)

    test.done()
}

exports.simple_array_set = function(test) {
    var data = Mock.mock({
        'list|3': ['@EMAIL']
    })

    run(data, "data.list[0] = '00'", [
        ['get', ['list']],
        ['set', ['list', 0]],
        ['change', ['list', 0]],
    ], test)

    run(data, "data.list[0] = '00'", [
        ['get', ['list']],
        ['set', ['list', 0]],
    ], test)
    run(data, "data.list[0] = data.list[1]", [
        ['get', ['list']],
        ['get', ['list']],
        ['get', ['list', 1]],
        ['set', ['list', 0]],
        ['change', ['list', 0]]
    ], test)

    test.done()
}

exports.simple_array_method = function(test) {
    var data = Mock.mock({
        'list|10': ['@EMAIL']
    });

    function run(data, code, expected, test, debug) {
        var records = []
        Watch.watch(data, ['get', 'set', 'add', 'delete', 'change'], function(event, data) {
            debug && Watch.log(event, data)
            records.push([event.type, data.path, data.value.length])
        })

        debug && console.group(code)
        eval(code)
        debug && console.groupEnd(code)

        test.deepEqual(records, expected)

        Watch.unwatch(data)
    }

    run(data, "data.list.pop()", [
        ['get', ['list'], 10],
        ['delete', ['list'], 1],
        ['change', ['list'], 9],
    ], test)
    run(data, "data.list.push(Mock.Random.email())", [
        ['get', ['list'], 9],
        ['add', ['list'], 1],
        ['change', ['list'], 10],
    ], test)
    run(data, "data.list.reverse()", [
        ['get', ['list'], 10],
    ], test)
    run(data, "data.list.shift()", [
        ['get', ['list'], 10],
        ['delete', ['list'], 1],
        ['change', ['list'], 9],
    ], test)
    run(data, "data.list.sort()", [
        ['get', ['list'], 9],
    ], test)
    run(data, "data.list.slice(1, 1)", [
        ['get', ['list'], 9],
    ], test)
    run(data, "data.list.unshift(Mock.Random.email())", [
        ['get', ['list'], 9],
        ['add', ['list'], 1],
        ['change', ['list'], 10]
    ], test)

    test.done()
}

exports.nested_array_get = function(test) {
    var data = Mock.mock({
        'list|3': [{
            'list|3': [{
                'list|3': ['@EMAIL']
            }]
        }]
    })

    run(data, "data.list", [
        ['get', ['list']],
    ], test)
    run(data, "data.list[0]", [
        ['get', ['list']],
        ['get', ['list', 0]],
    ], test)
    run(data, "data.list[0].list[0]", [
        ['get', ['list']],
        ['get', ['list', 0]],
        ['get', ['list', 0, 'list']],
        ['get', ['list', 0, 'list', 0]],
    ], test)
    run(data, "data.list[0].list[0].list[0]", [
        ['get', ['list']],
        ['get', ['list', 0]],
        ['get', ['list', 0, 'list']],
        ['get', ['list', 0, 'list', 0]],
        ['get', ['list', 0, 'list', 0, 'list']],
        ['get', ['list', 0, 'list', 0, 'list', 0]]
    ], test)

    test.done()
}

exports.nested_array_set = function(test) {
    var data = Mock.mock({
        'list|3': [{
            'list|3': [{
                'list|3': ['@EMAIL']
            }]
        }]
    })

    run(data, "data.list[0].list[0].list[0] = Mock.Random.email()", [
        ['get', ['list']],
        ['get', ['list', 0]],
        ['get', ['list', 0, 'list']],
        ['get', ['list', 0, 'list', 0]],
        ['get', ['list', 0, 'list', 0, 'list']],
        ['set', ['list', 0, 'list', 0, 'list', 0]],
        ['change', ['list', 0, 'list', 0, 'list', 0]],
    ], test)
    run(data, "data.list[0].list[0] = Mock.Random.email()", [
        ['get', ['list']],
        ['get', ['list', 0]],
        ['get', ['list', 0, 'list']],
        ['set', ['list', 0, 'list', 0]],
        ['change', ['list', 0, 'list', 0]],
    ], test)
    run(data, "data.list[0] = Mock.Random.email()", [
        ['get', ['list']],
        ['set', ['list', 0]],
        ['change', ['list', 0]],
    ], test)
    run(data, "data.list = Mock.Random.email()", [
        ['set', ['list']],
        ['change', ['list']]
    ], test)

    test.done()
}

exports.watch_properties = function(test) {
    var data = {
        a: {
            b: {
                c: 'ccc'
            }
        }
    }

    var tcs = {
        'data.a': [
            ['get', 'a']
        ],
        'data.a.b': [
            ['get', 'a'],
            ['get', 'a.b']
        ],
        'data.a.b.c': [
            ['get', 'a'],
            ['get', 'a.b'],
            ['get', 'a.b.c']
        ],
    }

    var records
    Watch.watchProperty(data, ['a', 'a.b', 'a.b.c'], function(event, data) {
        records.push([event.type, data.path.join('.')])
    })

    for (var code in tcs) {
        records = []
        eval(code)
        test.deepEqual(records, tcs[code])
        records = []
    }

    Watch.unwatch(data)

    test.done()
}*/