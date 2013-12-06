module('watch.js')

if (!console.group) {
    console.group = console.log
    console.groupEnd = console.log
}

/* jslint evil: true */
function run(data, code, expected, debug) {
    debug = true
    var records = []
    // 'add', 'delete', 
    Watch.watch(data, ['get', 'set', 'change'], function(event, data) {
        debug && Watch.log(event, data)
        records.push([event.type, data.path.slice(1).join('.')])
    })

    debug && console.group(code)
    eval(code)
    debug && console.groupEnd(code)

    deepEqual(records, expected, code)
    records = []

    Watch.unwatch(data)
}

test('Simple Object', function() {
    var data = {
        prop: 'foo'
    }
    console.group('Simple Object', JSON.stringify(data))
    run(data, "data.prop = 'foo'", [
        ['set', 'prop']
    ])
    run(data, "data.prop = 'bar'", [
        ['set', 'prop'],
        ['change', 'prop']
    ])
    run(data, "data.prop = 'bar'", [
        ['set', 'prop']
    ])
    console.groupEnd('Simple Object')
})

test('Nested Object', function() {
    var data = {
        prop1: {
            prop2: 'foo'
        }
    }
    console.group('Nested Object', JSON.stringify(data))
    run(data, "data.prop1", [
        ['get', 'prop1']
    ])
    run(data, "data.prop1.prop2", [
        ['get', 'prop1'],
        ['get', 'prop1.prop2'],
    ])
    run(data, "data.prop1.prop2 = 'foo'", [
        ['get', 'prop1'],
        ['set', 'prop1.prop2']
    ])
    run(data, "data.prop1.prop2 = 'bar'", [
        ['get', 'prop1'],
        ['set', 'prop1.prop2'],
        ['change', 'prop1.prop2']

    ])
    run(data, "data.prop1.prop2 = 'bar'", [
        ['get', 'prop1'],
        ['set', 'prop1.prop2']
    ])
    run(data, "data.prop1 = { prop3: 'foo'}", [
        ["set", "prop1"],
        ["change", "prop1"],
        ["get", "prop1.prop3"],
        ["change", "prop1.prop3"]
    ])
    run(data, "data.prop1.prop3", [
        ['get', 'prop1'],
        ['get', 'prop1.prop3']
    ])
    run(data, "data.prop1.prop3 = 'foo'", [
        ['get', 'prop1'],
        ['set', 'prop1.prop3']
    ])
    run(data, "data.prop1.prop3 = 'bar'", [
        ["get", "prop1"],
        ["set", "prop1.prop3"],
        ["change", "prop1.prop3"]
    ])
    run(data, "data.prop1.prop3 = 'bar'", [
        ["get", "prop1"],
        ["set", "prop1.prop3"]
    ])
    console.groupEnd('Nested Object')
})

test('Simple Array', function() {
    var data = [0, 1, 2]
    console.group('Simple Array', JSON.stringify(data))
    run(data, "data[0]", [
        ['get', '0']
    ])
    run(data, "data[0] = '00'", [
        ['set', '0'],
        ['change', '0']
    ])
    run(data, "data[0] = '00'", [
        ['set', '0']
    ])
    run(data, "data[0] = data[1]", [
        ['get', '1'],
        ['set', '0'],
        ['change', '0']
    ])
    run(data, "data.push(333)", [
        ["change", ""]
    ])
    console.groupEnd('Simple Array')
})

test('Nested Array', function() {
    var data = [
        [0, 1, 2],
        [11, 12, 13],
        [21, 22, 23]
    ]
    console.group('Nested Array', JSON.stringify(data))
    run(data, "data[0]", [
        ['get', '0']
    ])
    run(data, "data[0] = '00'", [
        ['set', '0'],
        ['change', '0']
    ])
    run(data, "data[0] = '00'", [
        ['set', '0']
    ])
    run(data, "data[0] = data[1]", [
        ['get', '1'],
        ['set', '0'],
        ['change', '0'],
        ['get', '0.0'],
        ['change', '0.0'],
        ['get', '0.1'],
        ['change', '0.1'],
        ['get', '0.2'],
        ['change', '0.2']
    ])
    run(data, "data.push(333)", [
        ["change", ""]
    ])
    console.groupEnd('Nested Array')
})