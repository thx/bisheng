module('Locator')

var ScriptLocator = BiSheng.Locators[0]
var JsonCommentLocator = BiSheng.Locators[1]

// 创建

test('create script locator', function() {
    var locator = ScriptLocator.create({
        guid: 1,
        slot: "start"
    })
    var parsed = $('<div>' + locator + '</div>').contents()[0].nodeValue
    equal(parsed, '<script guid="1" slot="start"></script>')
})

test('create comment locator', function() {
    var locator = JsonCommentLocator.create({
        guid: 1,
        slot: "start"
    })
    var parsed = $('<div>' + locator + '</div>').contents()[0].nodeValue
    equal(parsed, '<!-- {"guid":1,"slot":"start"} -->')
})

// 匹配

test('match script locator', function() {
    var locator = '<script guid="1" slot="start"></script>'
    var ma = ScriptLocator.getLocatorRegExp().exec(locator)
    ok(ma)
    equal(ma[1], locator)
})

test('match comment locator', function() {
    var locator = '<!-- {"guid":1,"slot":"start"} -->'
    var ma = JsonCommentLocator.getLocatorRegExp().exec(locator)
    ok(ma)
    equal(ma[2], '{"guid":1,"slot":"start"}')
})

// 查找

test('find script locator', function() {
    var container = $('<div>')
        .append('<script guid="1" slot="start"></script>')
        .append('<script guid="1" slot="end"></script>')
        .append('<script guid="2" slot="start"></script>')
        .append('<script guid="2" slot="end"></script>')
    var locators = ScriptLocator.find({
        slot: 'start'
    }, container)
    equal(locators.length, 2)
})

test('find json comment locator', function() {
    var container = $('<div>')
        .append('<!-- {guid:"1",slot:"start"} -->')
        .append('<!-- {guid:"1",slot:"end"} -->')
        .append('<!-- {guid:"2",slot:"start"} -->')
        .append('<!-- {guid:"2",slot:"end"} -->')
    var locators = JsonCommentLocator.find({
        slot: 'start'
    }, container)
    equal(locators.length, 2)
})

// 解析

test('parse script locator', function() {
    expect(2)
    var container = $('<div>')
        .append('<script guid="1" slot="start"></script>')
        .append('<script guid="1" slot="end"></script>')
        .append('<script guid="2" slot="start"></script>')
        .append('<script guid="2" slot="end"></script>')
    var locators = ScriptLocator.find({
        slot: 'start'
    }, container)
    locators.each(function(index, locator) {
        equal(ScriptLocator.parse(locator, 'slot'), 'start')
    })
})

test('parse json comment locator', function() {
    expect(4)
    var container = $('<div>')
        .append('<!-- {guid:"1",slot:"start"} -->')
        .append('<!-- {guid:"1",slot:"end"} -->')
        .append('<!-- {guid:"2",slot:"start"} -->')
        .append('<!-- {guid:"2",slot:"end"} -->')
    var locators = JsonCommentLocator.find({
        slot: 'start'
    }, container)
    locators.each(function(index, locator) {
        equal(JsonCommentLocator.parse(locator, 'slot'), 'start')
    })

    JsonCommentLocator.find({
        guid: '1'
    }, container)
        .each(function(index, locator) {
            equal(JsonCommentLocator.parse(locator, 'guid'), '1')
        })
})

// 更新

test('update json comment locator', function() {
    expect(4)
    var container = $('<div>')
        .append('<!-- {guid:"1",slot:"start"} -->')
        .append('<!-- {guid:"1",slot:"end"} -->')
        .append('<!-- {guid:"2",slot:"start"} -->')
        .append('<!-- {guid:"2",slot:"end"} -->')

    JsonCommentLocator.find({
        slot: 'start'
    }, container)
        .each(function(index, locator) {
            JsonCommentLocator.update(locator, {
                type: 'text',
                path: [1, 2, 3].join('.')
            })
        })

    JsonCommentLocator.find({
        slot: 'start'
    }, container)
        .each(function(index, locator) {
            equal(JsonCommentLocator.parse(locator, 'type'), 'text')
            equal(JsonCommentLocator.parse(locator, 'path'), '1.2.3')
        })
})

// 目标元素

test('parse target', function() {
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
        .each(function(index, locator) {
            var target = JsonCommentLocator.parseTarget(locator)
            equal(target.length, 2, target.html())
        })

})