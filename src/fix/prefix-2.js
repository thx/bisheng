    expose(
        'bisheng', ['handlebars'],
        factory,
        function() {
            // Browser globals
            window.BiSheng = factory()
        }
    )
}(function() {