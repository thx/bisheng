module('Attribute')

test('title', function() {
	var tpl = '<span title="{{title}}">{{title}}</span>'
	var data = {
		title: 123
	}
	var task = function() {
		data.title = 456
	}
	var expected = function(container) {
		equal('456', container.find('span').attr('title'), tpl)
		equal('456', container.find('span').text(), tpl)
	}
	bindThenCheck(data, tpl, task, expected)
})

test('class', function() {
	var tpl = '<span class="before {{title}} after">{{title}}</span>'
	var data = {
		title: 123
	}
	var task = function() {
		data.title = 456
	}
	var expected = function(container) {
		ok(container.find('span').hasClass('before'), tpl)
		ok(container.find('span').hasClass('after'), tpl)
		ok(container.find('span').hasClass('456'), tpl)
		equal('456', container.find('span').text(), tpl)
	}
	bindThenCheck(data, tpl, task, expected)
})

/*
    IE 不支持非法的样式值（这里指插入了定位符），导致无法扫描到需监听的样式。
    在 BiSheng.js 内部，会先把 style 替换为 bs-style，待渲染、扫描之后，再改回 style。
*/
test('style', function() {
	var tpl = '<div style="width: {{width}}px; height: {{height}}px; background-color: green;">{{width}}, {{height}}</div>'
	var data = {
		width: 100,
		height: 50
	}
	var task = function() {
		data.width = 200
		data.height = 100
	}
	var expected = function(container) {
		equal(container.find('div').css('width'), '200px', container.find('div')[0].outerHTML)
		equal(container.find('div').css('height'), '100px', 'height')

		var content = container.find('div').text()
		ok(/200,\s?100/.test(content), 'text') // IE 会自动忽略前导空白符

		var color = container.find('div').css('backgroundColor')
		ok(color === 'rgb(0, 128, 0)' || color === 'green', 'background-color')
	}
	bindThenCheck(data, tpl, task, expected)
})

test('part', function() {
	var tpl = '<a href="/testcase/{{id}}">{{id}}</a>'
	var data = {
		id: 123
	}
	var task = function() {
		data.id = 456
	}
	var expected = function(container) {
		var href = container.find('a').attr('href')
		ok(/\/testcase\/456$/.test(href), href)
		equal('456', container.find('a').text(), tpl)
	}
	bindThenCheck(data, tpl, task, expected)
})

test('block unless true > false', function() {
	var tpl = '<div class="before {{#if length}}show{{/if}} {{#unless length}}hide{{/unless}} after">{{length}}</div>'
	var data = {
		length: true
	}
	var task = function() {
		data.length = false
	}
	var expected = function(container) {
		ok(container.find('div').hasClass('before'), tpl)
		ok(container.find('div').hasClass('after'), tpl)
		ok(container.find('div').hasClass('hide'), tpl)
		ok(!container.find('div').hasClass('show'), tpl)
		equal('false', container.find('div').text(), tpl)
	}
	var before = function(container) {
		ok(!container.find('div').hasClass('hide'), tpl)
		ok(container.find('div').hasClass('show'), tpl)
		equal('true', container.find('div').text(), tpl)
	}
	bindThenCheck(data, tpl, task, expected, before)
})

test('block unless', function() {
	var tpl = '<div class="before {{#if length}}show{{/if}} {{#unless length}}hide{{/unless}} after">{{length}}</div>'
	var data = {
		length: false
	}
	var task = function() {
		data.length = true
	}
	var expected = function(container) {
		ok(container.find('div').hasClass('before'), tpl)
		ok(container.find('div').hasClass('after'), tpl)
		ok(!container.find('div').hasClass('hide'), tpl)
		equal('true', container.find('div').text(), tpl)
	}
	var before = function(container) {
		ok(!container.find('div').hasClass('show'), tpl)
		ok(container.find('div').hasClass('hide'), tpl)
		equal('false', container.find('div').text(), tpl)
	}
	bindThenCheck(data, tpl, task, expected, before)
})