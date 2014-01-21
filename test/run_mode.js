module('Run Mode')

/*
    ## Run Mode

    * Manual & Synchronous

        BiSheng.auto(false)
        BiSheng.apply(function() {
            // data.foo = ...
        })

    * Automatic & Asynchronous

        BiSheng.auto(false)
        // data.foo = ...
*/

test('Manual & Synchronous', function() { // 
    var data = {}
    var task = function() {
        data.foo = 123
    }
    var expected = [{
        type: 'add',
        path: ['foo'],
        value: 123
    }]

    BiSheng
        .auto(false)
        .watch(data, function(changes) {
            deepEqual(changes, expected, task + ', ' + JSON.stringify(changes))
        })
        .apply(function() {
            task()
        })
        .unwatch(data)
        .auto(true)

})

test('Automatic & Asynchronous', function() {
    var data = {}
    var task = function() {
        data.foo = 123
    }
    var expected = [{
        type: 'add',
        path: ['foo'],
        value: 123
    }]

    stop()
    BiSheng.watch(data, function(changes) {
        deepEqual(changes, expected, task + ', ' + JSON.stringify(changes))
        BiSheng.unwatch(data)
        start()
    })
    task()

})