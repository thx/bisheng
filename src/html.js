"use strict";

/* global expose */
/* global window: true */
/* global document: true */
/* global $: true */

(function(factory) {

    expose(factory, function() {
        window.HTML = factory()
    })

}(function() {

    // BEGIN(BROWSER)

    var HTML = {}
    var rtagName = /<([\w:]+)/
    var wrapMap = {
        option: [1, "<select multiple='multiple'>", "</select>"],
        thead: [1, "<table>", "</table>"],
        tr: [2, "<table><tbody>", "</tbody></table>"],
        td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],
        _default: [1, "<div>", "</div>"]
    }
    wrapMap.optgroup = wrapMap.option
    wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead
    wrapMap.th = wrapMap.td


    HTML.wrap = function wrap(html) {

    }
    HTML.convert = function convert(html) {
        var tag = (rtagName.exec(html) || ["", ""])[1].toLowerCase()
        var wrap = wrapMap[tag] || wrapMap._default
        var depth = wrap[0]
        var div = document.createElement('div')
        div.innerHTML = wrap[1] + html + wrap[2]
        while (depth--) {
            div = div.lastChild
        }

        return $(div)
    }

    HTML.table = function table(html) {
        return html.replace(/(<table.*?>)([\w\W]*?)(<\/table>)/g, function($0) {
            return $0.replace(/(>)([\w\W]*?)(<)/g, function(_, $1, $2, $3) {
                if ($2.indexOf('&lt;') > -1) {
                    var re = ''
                    HTML.convert($2).contents().each(function(index, node) {
                        re += node.nodeValue
                    })
                    return $1 + re + $3
                }
                return $1 + $2 + $3
            })
        })
    }

    // END(BROWSER)

    return HTML

}));