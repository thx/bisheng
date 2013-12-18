/*! Hyde 18-12-2013 */
/*! src/expose.js */
"use strict";

(function(factory) {
    var expose = factory();
    expose(factory, function() {
        window.expose = expose;
    });
})(function() {
    function expose(factory, globals) {
        if (typeof module === "object" && module.exports) {
            module.exports = factory();
        } else if (typeof define === "function" && define.amd) {
            define(factory);
        } else if (typeof define === "function" && define.cmd) {
            define(factory);
        } else if (typeof KISSY != "undefined") {
            KISSY.add(factory);
        } else {
            if (globals) globals();
        }
    }
    return expose;
});

/*! src/loop.js */
"use strict";

(function(factory) {
    expose(factory, function() {
        window.Loop = factory();
    });
})(function() {
    var guid = 1;
    var tasks = [];
    function letMeSee() {
        for (var i = 0; i < tasks.length; i++) {
            tasks[i]();
        }
        setTimeout(letMeSee, 50);
    }
    setTimeout(letMeSee, 50);
    var TYPES = {
        ADD: "add",
        DELETE: "delete",
        UPDATE: "update"
    };
    function watch(data, fn) {
        var id = guid++;
        var shadow = clone(data, true, [ id ]);
        function task() {
            var result = diff(data, shadow, [ id ], true);
            if (result && result.length) {
                fn(result, data, shadow);
                shadow = clone(data, true, [ id ]);
            }
        }
        tasks.push(task);
        return shadow;
    }
    function clone(obj, autoboxing, path) {
        var target = obj.constructor(), name, value;
        path = path || [];
        if (obj === null || typeof obj != "object") {
            return obj;
        }
        if (autoboxing) target.$path = path.join(".");
        for (name in obj) {
            value = obj[name];
            if (value !== undefined) {
                if (value.constructor === Object || value.constructor === Array) {
                    value = clone(value, autoboxing, path.concat(name));
                } else {
                    if (autoboxing) {
                        value = new Object(value);
                        value.$path = path.concat(name).join(".");
                    }
                }
            }
            target[name] = value;
        }
        return target;
    }
    function diff(newObject, oldObject, path, fix) {
        var result = result || [];
        path = path || [];
        if (typeof newObject !== "object" || typeof oldObject !== "object") {
            if (result.length) return result;
        }
        added(newObject, oldObject, path, result);
        removed(newObject, oldObject, path, result);
        updated(newObject, oldObject, path, result);
        function getContext(root, path) {
            return function() {
                var context = root;
                for (var index = 1; index < path.length - 1; index++) {
                    context = context[path[index]];
                }
                return context;
            };
        }
        if (fix) {
            for (var index = 0, change; index < result.length; index++) {
                change = result[index];
                change.root = newObject;
                change.context = getContext(newObject, change.path)();
                change.getContext = getContext;
            }
        }
        if (result.length) return result;
    }
    function added(newValue, oldValue, path, result, type) {
        var name, value;
        for (name in newValue) {
            if (/\$guid|\$path|\$blocks|\$helpers/.test(name)) continue;
            value = newValue[name];
            if (!(name in oldValue)) {
                result.push({
                    type: type || TYPES.ADD,
                    path: path.concat(name),
                    value: newValue[name]
                });
                continue;
            }
            if (value === undefined) continue;
            if (oldValue[name] === undefined) continue;
            if (value.constructor !== oldValue[name].constructor) continue;
            if (value.constructor === Object || value.constructor === Array) {
                added(value, oldValue[name], path.concat(name), result, type);
            }
        }
        if (result.length) return result;
    }
    function removed(newValue, oldValue, path, result) {
        return added(oldValue, newValue, path, result, TYPES.DELETE);
    }
    function updated(newValue, oldValue, path, result) {
        var name, value;
        for (name in newValue) {
            if (/\$guid|\$path|\$blocks|\$helpers/.test(name)) continue;
            value = newValue[name];
            if (!(name in oldValue)) continue;
            if (value === undefined && oldValue[name] === undefined) continue;
            if (value === undefined || oldValue[name] === undefined || value.constructor !== oldValue[name].constructor) {
                result.push({
                    type: TYPES.UPDATE,
                    path: path.concat(name),
                    value: value,
                    oldValue: oldValue[name] !== undefined ? oldValue[name].valueOf() : oldValue[name]
                });
                continue;
            }
            if (value.constructor === Object || value.constructor === Array) {
                updated(value, oldValue[name], path.concat(name), result);
                continue;
            }
            if (value.valueOf() !== oldValue[name].valueOf()) {
                result.push({
                    type: TYPES.UPDATE,
                    path: path.concat(name),
                    value: value,
                    oldValue: oldValue[name]
                });
            }
        }
        if (result.length) return result;
    }
    return {
        TYPES: TYPES,
        watch: watch,
        clone: clone,
        diff: diff
    };
});

/*! src/ast.js */
"use strict";

(function(factory) {
    expose(factory, function() {
        window.AST = factory();
    });
})(function() {
    var guid = 1;
    var ifHelp = Handlebars.helpers["if"];
    Handlebars.registerHelper("if", function(conditional, options) {
        return ifHelp.call(this, conditional !== undefined ? conditional.valueOf() : conditional, options);
    });
    Handlebars.registerHelper("$lastest", function(items, options) {
        return items && items.$path || this && this.$path;
    });
    return {
        createPathHTML: function createPathHTML(attrs) {
            var escape = Handlebars.Utils.escapeExpression;
            var pathHTML = escape("<script");
            for (var key in attrs) {
                if (attrs[key] === undefined) continue;
                pathHTML += " " + key + escape('="') + attrs[key] + escape('"');
            }
            pathHTML += escape("></script>");
            return pathHTML;
        },
        handle: function handle(node, context, index, blocks, helpers) {
            if (arguments.length === 2) {
                blocks = context;
                context = undefined;
                helpers = {};
            }
            if (arguments.length === 3) {
                blocks = context;
                helpers = index;
                context = index = undefined;
            }
            if (this[node.type]) this[node.type](node, context, index, blocks, helpers);
            return node;
        },
        program: function program(node, context, index, blocks, helpers) {
            for (var i = 0; i < node.statements.length; i++) {
                this.handle(node.statements[i], node.statements, i, blocks, helpers);
            }
        },
        mustache: function(node, context, index, blocks, helpers) {
            if (node.binded) return;
            var prop = [];
            if (node.isHelper) {
                node.params.forEach(function(param) {
                    if (param.type === "ID") {
                        prop.push(param.string);
                    }
                });
            } else {
                prop.push(node.id.string);
            }
            prop = prop.join(" ");
            var attrs = {
                guid: guid,
                slot: "",
                type: "",
                path: "{{$lastest " + prop + "}}",
                isHelper: !!node.isHelper
            };
            var placeholder;
            var statements;
            attrs.slot = "start";
            placeholder = this.createPathHTML(attrs);
            statements = Handlebars.parse(placeholder).statements;
            statements[1].binded = true;
            context.splice.apply(context, [ index, 0 ].concat(statements));
            placeholder = this.createPathHTML({
                guid: attrs.guid,
                slot: "end"
            });
            statements = Handlebars.parse(placeholder).statements;
            context.splice.apply(context, [ index + 4, 0 ].concat(statements));
            helpers[guid++] = {
                constructor: Handlebars.AST.ProgramNode,
                type: "program",
                statements: [ node ]
            };
            node.binded = true;
        },
        block: function block(node, context, index, blocks, helpers) {
            if (node.binded) return;
            var helper, prop;
            if (node.mustache.params.length === 0) {
                helper = "";
                prop = node.mustache.id.string;
            } else {
                helper = node.mustache.id.string;
                prop = node.mustache.params[0].string;
            }
            var attrs = {
                guid: guid,
                slot: "",
                type: "block",
                path: "{{$lastest " + prop + "}}",
                helper: helper
            };
            var placeholder;
            var statements;
            attrs.slot = "start";
            placeholder = this.createPathHTML(attrs);
            statements = Handlebars.parse(placeholder).statements;
            statements[1].binded = true;
            context.splice.apply(context, [ index, 0 ].concat(statements));
            placeholder = this.createPathHTML({
                guid: attrs.guid,
                slot: "end"
            });
            statements = Handlebars.parse(placeholder).statements;
            context.splice.apply(context, [ index + 4, 0 ].concat(statements));
            blocks[guid++] = {
                constructor: Handlebars.AST.ProgramNode,
                type: "program",
                statements: [ node ]
            };
            node.binded = true;
            this.handle(node.program || node.inverse, context, index, blocks, helpers);
        }
    };
});

/*! src/scan.js */
(function(factory) {
    expose(factory, function() {
        window.scan = factory();
    });
})(function() {
    function scan(node, data) {
        scanNode(node);
        scanBlocks(node);
        scanFormElements(node, data);
    }
    function scanNode(node) {
        switch (node.nodeType) {
          case 1:
          case 9:
          case 11:
            scanAttributes(node);
            scanChildNode(node);
            break;

          case 3:
            replaceTexNode(node);
            break;
        }
    }
    function replaceTexNode(node) {
        var content = node.textContent || node.innerText || node.nodeValue;
        $("<div>" + content + "</div>").contents().each(function(index, elem) {
            if (elem.nodeName === "SCRIPT" && elem.getAttribute("path")) {
                if (!elem.getAttribute("type")) elem.setAttribute("type", "text");
            }
        }).replaceAll(node);
    }
    function scanAttributes(node) {
        var reph = /(<script(?:.*?)><\/script>)/gi;
        var restyle = /([^;]*?): ([^;]*)/gi;
        var attributes = [];
        $.each(function() {
            var re = [];
            var all = node.attributes;
            for (var i = 0; i < all.length; i++) re.push(all[i]);
            return re;
        }(), function(index, attributeNode) {
            if (!attributeNode.specified) return;
            var nodeName = attributeNode.nodeName, nodeValue = attributeNode.nodeValue, ma, stylema;
            if (nodeName === "style") {
                restyle.exec("");
                while (stylema = restyle.exec(nodeValue)) {
                    reph.exec("");
                    while (ma = reph.exec(stylema[2])) {
                        attributes.push($("<div>" + ma[1] + "</div>").contents().attr({
                            type: "attribute",
                            name: attributeNode.nodeName.toLowerCase(),
                            css: $.trim(stylema[1])
                        })[0]);
                    }
                }
            } else {
                reph.exec("");
                while (ma = reph.exec(nodeValue)) {
                    attributes.push($("<div>" + ma[1] + "</div>").contents().attr({
                        type: "attribute",
                        name: attributeNode.nodeName.toLowerCase()
                    })[0]);
                }
            }
            if (attributes.length) {
                nodeValue = nodeValue.replace(reph, "");
                attributeNode.nodeValue = nodeValue;
                $(attributes).each(function(index, elem) {
                    var slot = $(elem).attr("slot");
                    if (slot === "start") $(node).before(elem);
                    if (slot === "end") $(node).after(elem);
                });
            }
        });
    }
    function scanChildNode(node) {
        $(node.childNodes).each(function(index, childNode) {
            scanNode(childNode);
        });
    }
    function scanBlocks(node) {
        var selector = 'script[slot="start"][type="block"]';
        var blocks = $(selector);
        var path;
        blocks.each(function(index, item) {
            if (item.nextSibling.nodeType === 8) {
                path = item.nextSibling.nodeValue;
                path = path.split(",");
                path = path.length > 2 ? path.slice(0, -1).join(".") : path;
                item.setAttribute("path", path);
                var guid = item.getAttribute("guid");
                slice.call(node.querySelectorAll('script[slot="end"][guid="' + guid + '"]') || [], 0).forEach(function(end) {
                    end.setAttribute("path", path);
                });
            }
        });
    }
    function scanFormElements(node, data) {
        $('script[slot="start"][type="attribute"][name="value"]', node).each(function(index, script) {
            var path = $(script).attr("path").split("."), target = script;
            while (target = target.nextSibling) {
                if (target.nodeName !== "SCRIPT") break;
            }
            $(target).on("change keyup", function(event) {
                updateValue(data, path, event.target);
            });
        });
        $('script[slot="start"][type="attribute"][name="checked"]', node).each(function(_, script) {
            var path = $(script).attr("path").split("."), target = script;
            while (target = target.nextSibling) {
                if (target.nodeName !== "SCRIPT") break;
            }
            var value = data;
            for (var index = 1; index < path.length; index++) {
                value = value[path[index]];
            }
            if (value === undefined || value.valueOf() === false || value.valueOf() === "false") {
                $(target).prop("checked", false);
            }
            $(target).on("change", function(event) {
                updateChecked(data, path, event.target);
            });
        });
    }
    function updateValue(data, path, target) {
        for (var index = 1; index < path.length - 1; index++) {
            data = data[path[index]];
        }
        var $target = $(target), value;
        switch (target.nodeName.toLowerCase()) {
          case "input":
            switch (target.type) {
              case "text":
                value = $target.val();
                break;

              case "radio":
              case "checkbox":
                return;

              default:
                value = $target.val();
            }
            break;

          case "select":
            value = $target.val();
            break;

          case "textarea":
            value = $target.val();
            break;

          default:
            value = $target.val();
        }
        data[path[path.length - 1]] = value;
    }
    function updateChecked(data, path, target) {
        for (var index = 1; index < path.length - 1; index++) {
            data = data[path[index]];
        }
        var $target = $(target), value;
        switch (target.nodeName.toLowerCase()) {
          case "input":
            switch (target.type) {
              case "radio":
              case "checkbox":
                value = $target.prop("checked");
            }
            break;

          default:        }
        data[path[path.length - 1]] = value;
    }
    return scan;
});

/*! src/flush.js */
"use strict";

if (typeof module === "object" && module.exports) {
    window = require("jsdom").jsdom().createWindow();
    document = window.document;
}

(function(factory) {
    expose(factory, function() {
        window.Flush = factory();
    });
})(function() {
    function expressionTarget(node) {
        while (node = node.nextSibling) {
            if (node.nodeName !== "SCRIPT") return node;
        }
    }
    function handle(event, change, defined) {
        var selector = 'script[slot="start"][path="' + change.path.join(".") + '"]';
        var paths = $(selector);
        var type;
        if (paths.length === 0 && change.context instanceof Array) {
            change.path.pop();
            change.context = change.getContext(change.root, change.path)();
            handle(event, change, defined);
        }
        paths.each(function(index, path) {
            type = path.getAttribute("type");
            if (handle[type]) handle[type](path, event, change, defined);
        });
    }
    handle.text = function text(path, event, change, defined) {
        var guid = path.getAttribute("guid");
        var helper = path.getAttribute("helper");
        var endPath = $('script[slot="end"][guid="' + guid + '"]')[0];
        var content;
        var target = [], cur = path, to = endPath;
        while ((cur = cur.nextSibling) && cur !== to) {
            target.push(cur);
        }
        if (target.length === 1 && target[0].nodeType === 3) {
            event.target.push(target[0]);
            target[0].nodeValue = change.value;
        } else {
            if (helper === "true") {
                content = Handlebars.compile(defined.$helpers[guid])(change.context);
            } else {
                content = change.value;
            }
            $("<div>" + content + "</div>").contents().insertAfter(path).each(function(index, elem) {
                event.target.push(elem);
            });
            $(target).remove();
        }
    };
    handle.attribute = function attribute(path, event, change, defined) {
        var currentTarget, name, $target;
        event.target.push(currentTarget = expressionTarget(path));
        $target = $(currentTarget);
        var ast = defined.$blocks[path.getAttribute("guid")];
        var value = ast ? Handlebars.compile(ast)(change.context) : change.value;
        var oldValue = function() {
            var oldValue;
            change.context[change.path[change.path.length - 1]] = change.oldValue !== undefined ? change.oldValue.valueOf() : change.oldValue;
            oldValue = ast ? Handlebars.compile(ast)(change.context) : change.oldValue;
            change.context[change.path[change.path.length - 1]] = change.value;
            return oldValue;
        }();
        name = path.getAttribute("name");
        switch (name) {
          case "class":
            $target.removeClass("" + oldValue).addClass("" + value);
            break;

          case "style":
            $target.css(path.getAttribute("css"), value);
            break;

          case "value":
            if ($target.val() !== value) $target.val(value);
            break;

          case "checked":
            $target.prop(name, value);
            name = $target.attr("name");
            if (name && $target.prop("checked")) {
                setTimeout(function() {
                    change.context[name] = $target.val();
                }, 0);
            }
            break;

          default:
            $target.attr(name, function(index, attr) {
                return oldValue === undefined ? value : attr !== oldValue.valueOf() ? attr.replace(oldValue, value) : value;
            });
        }
    };
    handle.block = function block(path, event, change, defined) {
        var guid = path.getAttribute("guid");
        var endPath = document.querySelector('script[slot="end"][guid="' + guid + '"]');
        var ast = defined.$blocks[guid];
        var context = Loop.clone(change.context, true, change.path.slice(0, -1));
        var content = Handlebars.compile(ast)(context);
        content = $("<div>" + content + "</div>");
        scan(content[0], change.context);
        content = content.contents();
        var target = [], cur = path, to = endPath;
        while ((cur = cur.nextSibling) && cur !== to) {
            target.push(cur);
        }
        if (content.length < target.length) $(target.splice(content.length)).remove();
        content.each(function(index, element) {
            if (!target[index]) {
                to.parentNode.insertBefore(element, to);
                event.target.push(element);
                return;
            }
            if (element.nodeType !== target[index].nodeType) {
                target[index].parentNode.insertBefore(element, target[index]);
                target[index].parentNode.removeChild(target[index]);
                event.target.push(element);
                return;
            }
            if (element.nodeType === 3 && element.nodeValue !== target[index].nodeValue) {
                target[index].nodeValue = element.nodeValue;
                return;
            }
            if (element.nodeType === 8 && element.nodeValue !== target[index].nodeValue) {
                target[index].nodeValue = element.nodeValue;
                return;
            }
            if (element.nodeType === 1) {
                if (element.outerHTML !== target[index].outerHTML) {
                    target[index].parentNode.insertBefore(element, target[index]);
                    target[index].parentNode.removeChild(target[index]);
                    event.target.push(element);
                    return;
                }
            }
        });
    };
    function scrollIntoView(event, change) {
        return;
        if (event.target.nodeType) event.target = [ event.target ];
        event.target.forEach && event.target.forEach(function(item, index) {
            switch (item.nodeType) {
              case 3:
                item.parentNode.scrollIntoView();
                break;

              case 1:
                item.scrollIntoView();
                break;
            }
        });
    }
    function highlight(event, change) {
        if (event.target.nodeType) event.target = [ event.target ];
        event.target.forEach && event.target.forEach(function(item, index) {
            switch (item.nodeType) {
              case 3:
                $(item).wrap("<span>").parent().addClass("transition highlight");
                setTimeout(function() {
                    $(item).unwrap("<span>").removeClass("transition highlight");
                }, 500);
                break;

              case 1:
                $(item).addClass("transition highlight");
                setTimeout(function() {
                    $(item).removeClass("transition highlight");
                }, 500);
                break;
            }
        });
    }
    return {
        handle: handle,
        scrollIntoView: scrollIntoView,
        highlight: highlight
    };
});

/*! src/hyde.js */
"use strict";

(function(factory) {
    expose(factory, function() {
        window.Hyde = factory();
    });
})(function() {
    return {
        version: "0.1.0",
        bind: function bind(data, tpl, callback) {
            var clone = Loop.watch(data, function(changes) {
                $.each(changes, function(_, change) {
                    var event = {
                        target: []
                    };
                    Flush.handle(event, change, clone);
                    if (location.href.indexOf("scrollIntoView") > -1) Flush.scrollIntoView(event, data);
                    Flush.highlight(event, data);
                });
            });
            var ast = Handlebars.parse(tpl);
            AST.handle(ast, undefined, undefined, clone.$blocks = {}, clone.$helpers = {});
            var compiled = Handlebars.compile(ast);
            var html = compiled(clone);
            var content = $("<div>" + html + "</div>");
            if (content.length) scan(content[0], data);
            content = content.contents();
            if (callback) return callback.call(data, content) || data;
            return content;
        },
        unbind: function unbind(data) {
            return;
        }
    };
});