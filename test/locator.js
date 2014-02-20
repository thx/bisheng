module('Locator')

// 创建

test('create script locator', function() {
    var ScriptLocator = BiSheng.Locators[0]
    var locator = ScriptLocator.create({
        guid: 1,
        slot: "start"
    })
    var parsed = $('<div>' + locator + '</div>').contents()[0].nodeValue
    equal(parsed, '<script guid="1" slot="start"></script>', parsed)
})

test('create comment locator', function() {
    var JsonCommentLocator = BiSheng.Locators[1]
    var locator = JsonCommentLocator.create({
        guid: 1,
        slot: "start"
    })
    var parsed = $('<div>' + locator + '</div>').contents()[0].nodeValue
    equal(parsed, '<!-- {"guid":1,"slot":"start"} -->', parsed)
})

// 匹配

test('match script locator', function() {
    var ScriptLocator = BiSheng.Locators[0]
    var locator = '<script guid="1" slot="start"></script>'
    var ma = ScriptLocator.getLocatorRegExp().exec(locator)
    ok(ma, ma[0])
    equal(ma[1], locator, ma[1])
})

test('match comment locator', function() {
    var JsonCommentLocator = BiSheng.Locators[1]
    var locator = '<!-- {"guid":1,"slot":"start"} -->'
    var ma = JsonCommentLocator.getLocatorRegExp().exec(locator)
    ok(ma, ma[0])
    equal(ma[2], '{"guid":1,"slot":"start"}', ma[2])
})

// 查找

test('find script locator', function() {
    var ScriptLocator = BiSheng.Locators[0]
    var container = $('<div>')
        .append('<script guid="1" slot="start" type="todo"></script>')
        .append('<script guid="1" slot="end"   type="todo"></script>')
        .append('<script guid="2" slot="start" type="todo"></script>')
        .append('<script guid="2" slot="end"   type="todo"></script>')
    var locators = ScriptLocator.find({
        slot: 'start'
    }, container)
    equal(locators.length, 2,
        locators.map(function() {
            // KISSY 的 this 是 NodeList，jQuery 的 this 是原生 Element
            return window.KISSY ? this[0].outerHTML : this.outerHTML
        }).toArray().join(', ')
    )
})

test('find json comment locator', function() {
    var JsonCommentLocator = BiSheng.Locators[1]
    var container = $('<div>')
        .append('<!-- {guid:"1",slot:"start"} -->')
        .append('<!-- {guid:"1",slot:"end"} -->')
        .append('<!-- {guid:"2",slot:"start"} -->')
        .append('<!-- {guid:"2",slot:"end"} -->')
    var locators = JsonCommentLocator.find({
        slot: 'start'
    }, container)
    equal(locators.length, 2,
        locators.map(function() {
            return this.nodeValue
        }).toArray().join(', ')
    )
})

// 解析

test('parse script locator', function() {
    var ScriptLocator = BiSheng.Locators[0]
    expect(2)
    var container = $('<div>')
        .append('<script guid="1" slot="start" type="todo"></script>')
        .append('<script guid="1" slot="end"   type="todo"></script>')
        .append('<script guid="2" slot="start" type="todo"></script>')
        .append('<script guid="2" slot="end"   type="todo"></script>')
    var locators = ScriptLocator.find({
        slot: 'start'
    }, container)
    locators._each(function(locator, index) {
        equal(ScriptLocator.parse(locator, 'slot'), 'start', locator.outerHTML)
    })
})

test('parse json comment locator', function() {
    var JsonCommentLocator = BiSheng.Locators[1]
    expect(4)
    var container = $('<div>')
        .append('<!-- {guid:"1",slot:"start"} -->')
        .append('<!-- {guid:"1",slot:"end"} -->')
        .append('<!-- {guid:"2",slot:"start"} -->')
        .append('<!-- {guid:"2",slot:"end"} -->')
    var locators = JsonCommentLocator.find({
        slot: 'start'
    }, container)
    locators._each(function(locator, index) {
        equal(JsonCommentLocator.parse(locator, 'slot'), 'start', locator.nodeValue)
    })

    JsonCommentLocator.find({
        guid: '1'
    }, container)
        ._each(function(locator, index) {
            equal(JsonCommentLocator.parse(locator, 'guid'), '1', locator.nodeValue)
        })
})

// 更新

test('update json comment locator', function() {
    var JsonCommentLocator = BiSheng.Locators[1]
    expect(4)
    var container = $('<div>')
        .append('<!-- {guid:"1",slot:"start"} -->')
        .append('<!-- {guid:"1",slot:"end"} -->')
        .append('<!-- {guid:"2",slot:"start"} -->')
        .append('<!-- {guid:"2",slot:"end"} -->')

    JsonCommentLocator.find({
        slot: 'start'
    }, container)
        ._each(function(locator, index) {
            JsonCommentLocator.update(locator, {
                type: 'text',
                path: [1, 2, 3].join('.')
            })
        })

    JsonCommentLocator.find({
        slot: 'start'
    }, container)
        ._each(function(locator, index) {
            equal(JsonCommentLocator.parse(locator, 'type'), 'text', locator.nodeValue)
            equal(JsonCommentLocator.parse(locator, 'path'), '1.2.3', locator.nodeValue)
        })
})

// 目标元素

test('parse target', function() {
    var JsonCommentLocator = BiSheng.Locators[1]
    var container = $('<div>')
        .append('<!-- {guid:"1",slot:"start"} -->')
        .append('<span>target1-1</span>')
        .append('<span>target1-2</span>')
        .append('<!-- {guid:"1",slot:"end"} -->')
        .append('<!-- {guid:"2",slot:"start"} -->')
        .append('<span>target2-1</span>')
        .append('<span>target2-2</span>')
        .append('<!-- {guid:"2",slot:"end"} -->')
    JsonCommentLocator.find({
        slot: 'start'
    }, container)
        ._each(function(locator, index) {
            var target = JsonCommentLocator.parseTarget(locator)
            equal(target.length, 2, target.html())
        })

})