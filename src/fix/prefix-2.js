    expose(
        'bisheng', ['jquery', 'handlebars'],
        factory,
        function() {
            // Browser globals
            window.BiSheng = factory()
        }
    )
}(function() {