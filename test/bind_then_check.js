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
    })
    BiSheng.Loop.watch(data, function( /*changes*/ ) {
        container.each(function(index, item) {
            expected($(item))
        })
        if (empty !== false) {
            container.empty()
            BiSheng.unbind(data)
        }
        start()
    })
    task(container)
}

// module('Helper')