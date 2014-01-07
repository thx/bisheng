/* jshint unused: true */
/* exported bindThenCheck */
function bindThenCheck(data, tpl, task, expected, before, empty) {
    stop()
    var container = $('div.container')
    BiSheng.bind(data, tpl, function(content) {
        container.append(content)
        container.each(function(index, item) {
            before && before($(item))
        })
    }, container)
    var started = false
    BiSheng.Loop.watch(data, function( /*changes*/ ) {
        if (!started) container.each(function(index, item) {
            expected($(item))
        })
        if (empty !== false) {
            container.empty()
            BiSheng.unbind(data)
        }
        if (!started) start()
        started = true
    })
    task(container)
}

// module('Helper')