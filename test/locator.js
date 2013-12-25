module('Locator')

var Locator = BiSheng.Locator

// 创建

test('create script locator', function() {
    var locator = Locator.createScriptLocator({
        guid: 1,
        slot: "start"
    })
    var parsed = $('<div>' + locator + '</div>').contents()[0].nodeValue
    equal(parsed, '<script guid="1" slot="start"></script>')
})

test('create comment locator', function() {
    var locator = Locator.createJsonCommentLocator({
        guid: 1,
        slot: "start"
    })
    var parsed = $('<div>' + locator + '</div>').contents()[0].nodeValue
    equal(parsed, '<!-- {"guid":1,"slot":"start"} -->')
})

// 匹配

test('match script locator', function() {
    var locator = '<script guid="1" slot="start"></script>'
    var ma = Locator.scriptLocatorRegExp.exec(locator)
    ok(ma)
    equal(ma[1], locator)
})

test('match comment locator', function() {
    var locator = '<!-- {"guid":1,"slot":"start"} -->'
    var ma = Locator.jsonCommentLocatorRegExp.exec(locator)
    ok(ma)
    equal(ma[1], '{"guid":1,"slot":"start"}')
})

// 查找

test('find script locator', function() {
    var container = $('<div>')
        .append('<script guid="1" slot="start"></script>')
        .append('<script guid="1" slot="end"></script>')
        .append('<script guid="2" slot="start"></script>')
        .append('<script guid="2" slot="end"></script>')
    var locators = Locator.findScriptLocator({
        slot: 'start'
    }, container)
    equal(locators.length, 2)
})

test('find comment locator', function() {
    var container = $('<div>')
        .append('<!-- guid="1" slot="start" -->')
        .append('<!-- guid="1" slot="end" -->')
        .append('<!-- guid="2" slot="start" -->')
        .append('<!-- guid="2" slot="end" -->')
    var locators = Locator.findCommentLocator({
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
    var locators = Locator.findJsonCommentLocator({
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
    var locators = Locator.findScriptLocator({
        slot: 'start'
    }, container)
    locators.each(function(index, locator) {
        equal(Locator.parseScriptLocator(locator, 'slot'), 'start')
    })
})

test('parse json comment locator', function() {
    expect(4)
    var container = $('<div>')
        .append('<!-- {guid:"1",slot:"start"} -->')
        .append('<!-- {guid:"1",slot:"end"} -->')
        .append('<!-- {guid:"2",slot:"start"} -->')
        .append('<!-- {guid:"2",slot:"end"} -->')
    var locators = Locator.findJsonCommentLocator({
        slot: 'start'
    }, container)
    locators.each(function(index, locator) {
        equal(Locator.parseJsonCommentLocator(locator, 'slot'), 'start')
    })

    Locator.findJsonCommentLocator({
        guid: '1'
    }, container)
        .each(function(index, locator) {
            equal(Locator.parseJsonCommentLocator(locator, 'guid'), '1')
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

    Locator.findJsonCommentLocator({
        slot: 'start'
    }, container)
        .each(function(index, locator) {
            Locator.updateJsonCommentLocator(locator, {
                type: 'text',
                path: [1, 2, 3].join('.')
            })
        })

    Locator.findJsonCommentLocator({
        slot: 'start'
    }, container)
        .each(function(index, locator) {
            equal(Locator.parseJsonCommentLocator(locator, 'type'), 'text')
            equal(Locator.parseJsonCommentLocator(locator, 'path'), '1.2.3')
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
    Locator.findJsonCommentLocator({
        slot: 'start'
    }, container)
        .each(function(index, locator) {
            var target = Locator.parseTargetOfJsonCommentLocator(locator)
            equal(target.length, 2, target.html())
        })

})