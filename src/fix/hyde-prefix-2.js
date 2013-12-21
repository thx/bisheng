    expose(factory, function() {
        // Browser globals
        window.Hyde = factory()
    })
}(function() {