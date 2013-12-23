"use strict";

/* global window */
/* global define */
/* global KISSY */

/*
    https://gist.github.com/nuysoft/7974409
*/

(function(factory) {

    var expose = factory()
    expose(factory, function() {
        window.expose = expose
    })

}(function() {
    // BEGIN(BROWSER)
    
    /*
        # expose(factory, globals)

        模块化，适配主流加载器。
        Modular
    */
    function expose(factory, globals) {
        if (typeof module === 'object' && module.exports) {
            // CommonJS
            module.exports = factory()


        } else if (typeof define === "function" && define.amd) {
            // AMD modules
            define(factory)

        } else if (typeof define === "function" && define.cmd) {
            // CMD modules
            define(factory)

        } else if (typeof KISSY != 'undefined') {
            // For KISSY 1.4
            KISSY.add(factory)

        } else {
            // Browser globals
            if (globals) globals()

        }
    }

    // END(BROWSER)

    return expose

}));