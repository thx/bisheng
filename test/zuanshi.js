module('zuanshi.taobao.com')

test('header.html', function() {
    var tpl = Mock.heredoc(function() {
        /*
{{#user}}
    {{#info}}
        <span>{{nickname}}</span>，退出
    {{/info}}
    {{#message}}
        您有 <span>{{unread}}</span> 条新消息
    {{/message}}
{{/user}}
        */
    })
    var data = Mock.tpl(tpl, {
        nickname: '@NAME',
        unread: '@NATURAL'
    })
    var task = function() {
        data.user.info.nickname = 'foo'
        data.user.message.unread = 123
    }
    var expected = function(container) {
        equal(container.find('span:eq(0)').text(), 'foo')
        equal(container.find('span:eq(1)').text(), '123')
    }
    var before = function(container) {
        equal(container.find('span').length, 2)

    }
    bindThenCheck(data, tpl, task, expected, before)
})