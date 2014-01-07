module('zuanshi.taobao.com')

test('header.html, update user.info.nickname, update user.message.unread', function() {
    var tpl = Mock.heredoc(function() {
        /*
{{#user}}
    {{#info}}
        <span class="nickname">{{nickname}}</span>，退出
    {{/info}}
    {{#message}}
        您有 <span class="unread">{{unread}}</span> 条新消息
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
        equal(container.find('span.nickname').text(), 'foo')
        equal(container.find('span.unread').text(), '123')
    }
    var before = function(container) {
        equal(container.find('span').length, 2)
    }
    bindThenCheck(data, tpl, task, expected, before)
})

test('header.html, delete user.info', function() {
    var tpl = Mock.heredoc(function() {
        /*
{{#user}}
    {{#info}}
        <span class="nickname">{{nickname}}</span>，退出
    {{/info}}
    {{#message}}
        您有 <span class="unread">{{unread}}</span> 条新消息
    {{/message}}
{{/user}}
        */
    })
    var data = Mock.tpl(tpl, {
        nickname: '@NAME',
        unread: '@NATURAL'
    })
    var task = function() {
        if (Math.random() > 0.5) delete data.user.info
        else data.user.info = null
    }
    var expected = function(container) {
        equal(container.find('span.nickname').length, 0)
    }
    var before = function(container) {
        equal(container.find('span').length, 2)
    }
    bindThenCheck(data, tpl, task, expected, before)
})

test('header.html, delete user.message', function() {
    var tpl = Mock.heredoc(function() {
        /*
{{#user}}
    {{#info}}
        <span class="nickname">{{nickname}}</span>，退出
    {{/info}}
    {{#message}}
        您有 <span class="unread">{{unread}}</span> 条新消息
    {{/message}}
{{/user}}
        */
    })
    var data = Mock.tpl(tpl, {
        nickname: '@NAME',
        unread: '@NATURAL'
    })
    var task = function() {
        if (Math.random() > 0.5) delete data.user.message
        else data.user.message = null
    }
    var expected = function(container) {
        equal(container.find('span.unread').length, 0)
    }
    var before = function(container) {
        equal(container.find('span').length, 2)

    }
    bindThenCheck(data, tpl, task, expected, before)
})

test('sidebar.html, permission', function() {
    var config = {
        permission: {
            '_0': '通投',
            '_8': '群体',
            '_16': '访客',
            '_64': '兴趣点',
            '_128': 'DMP人群',
            '_-1': '未知'
        }
    }
    var tpl = function() {
        var tpl = []
        for (var id in config.permission) {
            tpl.push(
                '{{#permission}}{{#' + id + '}}' +
                config.permission[id] +
                '{{/' + id + '}}{{/permission}}'
            )
        }
        return tpl.join('，')
    }()
    var data = function() {
        var user = {
            permission: {}
        }
        for (var id in config.permission) {
            user.permission[id] = Random.boolean()
        }
        return user
    }()
    var task = function() {
        for (var id in config.permission) {
            data.permission[id] = !data.permission[id]
        }
    }
    var expected = function(container) {
        for (var id in config.permission) {
            if (data.permission[id]) ok(
                container.text().indexOf(config.permission[id]) > -1,
                container.text()
            )
        }
    }
    var before = function(container) {
        for (var id in config.permission) {
            if (data.permission[id]) ok(
                container.text().indexOf(config.permission[id]) > -1,
                container.text()
            )
        }
    }
    bindThenCheck(data, tpl, task, expected, before)
})

// plan_list
;
(function() {
    var tpl = Mock.heredoc(function() {
        /*
<table class="ux-table" border="1">
    <thead>
        <tr class="{{#noData}}nodata{{/noData}}">
            <th>#</th>
            <th>名称</th>
            <th>类型</th>
            <th>预算</th>
            <th>时间</th>
            <th>操作</th>
        </tr>
    </thead>
    <tbody>
        {{#list}}
        <tr class="item">
            <td>{{id}}</td>
            <td>{{transName}}</td>
            <td>{{list_transType}}</td>
            <td>{{list_dayBudget}} 元</td>
            <td>{{{list_time}}}</td>
            <td>
                <a href="{{list_report}}">报表</a>
                <a href="{{list_edit}}">编辑</a>
                <a href="javascript:;" mxclick="copyPlan:{{id}}:{{transName}}:{{transType}}">复制</a>
            </td>
        </tr>
        {{/list}}

        {{^list}}
        <tr class="none">
            <td colspan="6">没有相关记录</td>
        </tr>
        {{/list}}
    </tbody>
    {{^noPages}}
    <tfoot>
        <tr class="pages">
            <td colspan="6">
                <div id="pages">1 2 3 4 5 ...</div>
            </td>
        </tr>
    </tfoot>
    {{/noPages}}
</table>
    */
    })

    var dataTpl = {
        noData: false,
        noPages: false,
        'list|3': [{
            id: '@INC',
            transName: '@TITLE(1)',
            transType: '@INT(1,3)',
            list_transType: function() {
                return this.transType
            },
            dayBudget: '@FLOAT(1,100,1,2)',
            list_dayBudget: function() {
                return this.dayBudget
            },
            time: '@DATETIME',
            list_time: function() {
                return this.time
            },

            list_report: function() {
                return '/' + this.id
            },
            list_edit: function() {
                return '/' + this.id
            }
        }]
    }

    test('plan_list.html, add', function() {
        var data = Mock.mock(dataTpl)
        data.list[0].list_dayBudget = function() {
            return this.dayBudget
        }
        var task = function() {
            data.list.push(Mock.mock(dataTpl).list[0])
        }
        var expected = function(container) {
            equal(container.find('tr.item').length, 4)
            equal(container.find('tr.none').length, 0)
        }
        var before = function(container) {
            equal(container.find('tr.item').length, 3)
            equal(container.find('tr.none').length, 0)
        }
        bindThenCheck(data, tpl, task, expected, before)
    })

    test('plan_list.html, delete', function() {
        var data = Mock.mock(dataTpl)
        var task = function() {
            data.list.pop()
        }
        var expected = function(container) {
            equal(container.find('tr.item').length, 2)
            equal(container.find('tr.none').length, 0)
        }
        var before = function(container) {
            equal(container.find('tr.item').length, 3)
            equal(container.find('tr.none').length, 0)
        }
        bindThenCheck(data, tpl, task, expected, before)
    })

    test('plan_list.html, update', function() {
        var data = Mock.mock(dataTpl)
        var task = function() {
            data.list[0].id = 123
        }
        var expected = function(container) {
            equal(container.find('tr.item:eq(0) td:eq(0)').text(), data.list[0].id, data.list[0].id)
        }
        var before = function(container) {
            equal(container.find('tr.item:eq(0) td:eq(0)').text(), data.list[0].id, data.list[0].id)
        }
        bindThenCheck(data, tpl, task, expected, before)
    })

    test('plan_list.html, empty', function() {
        var data = Mock.mock(dataTpl)
        var task = function() {
            data.list.pop()
            data.list.pop()
            data.list.pop()
        }
        var expected = function(container) {
            equal(container.find('tr.item').length, 0, 'tr.item')
            equal(container.find('tr.none').length, 1, 'tr.none')
        }
        var before = function(container) {
            equal(container.find('tr.item').length, 3, 'tr.none')
            equal(container.find('tr.none').length, 0, 'tr.none')
        }
        bindThenCheck(data, tpl, task, expected, before)
    })

})()

test('plan_handle.html, ', function() {
    var tpl = Mock.heredoc(function() {
        /*
<div class="plan">
    <style scoped>
        .plan img { max-width: 70%; max-height: 50px; }
    </style>
    <h3>计划信息</h3>
    <input type="text" name="transId" value="{{transId}}" data-value="{{transId}}">
    <input type="text" name="adzoneId" value="{{adzoneId}}">
    <input type="text" name="transName" value="{{transName}}">
    {{#setting}}
    <a class="setting">
        {{#more}}更多设置{{/more}}
        {{#edit}}编辑设置{{/edit}}
        {{#close}}关闭设置{{/close}}
    </a>
    {{/setting}}
    <h3>创意列表 boards</h3>
    <ul class="boards">
        {{#each boards}}
        <li>
            <span>{{boardName}}</span> <!-- Mock { boardName: '@WORD(5)' }-->
            <a href="{{boardPoster}}">
                <img src="{{boardPoster}}"> <!-- Mock { boardPoster: '@DATAIMAGE' }-->
            </a>
        </li>
        {{/each}}
    </ul>
    <div class="target target-scene" style="display: {{#permission}}{{^_256}}none{{/_256}}{{/permission}};">
        <h3>场景定向 permission._256</h3>
        <ul>
            {{#each scenes}}
            <li>
                <span>{{name}}</span> <!-- Mock { name: '@WORD(5)' }-->
                <input value="{{premium}}"> <!-- Mock { premium: '@FLOAT' }-->
            </li>
            {{/each}}
        </ul>
    </div>
    <div class="target target-group" style="display: {{#permission}}{{^_8}}none{{/_8}}{{/permission}};">
        <h3>群体定向 permission._8</h3>
        <ul>
            {{#each groups}}
            <li>
                <span>{{name}}</span> <!-- Mock { name: '@WORD(5)' }-->
                <input value="{{premium}}"> <!-- Mock { premium: '@FLOAT' }-->
            </li>
            {{/each}}
        </ul>
    </div>

    <div class="valid {{^message}}hide{{/message}}">{{message}}</div> <!-- Mock { 'message': '' } -->
</div>
        */
    })
    var data = Mock.tpl(tpl)
    BiSheng.watch(data, function(changes) {
        $.each(changes, function(index, change) {
            var path = change.path.slice(1, change.path.length)
            if (path[0] === 'setting' && change.value === true) {
                for (var key in data.setting) {
                    if (key !== path[1]) data.setting[key] = false
                }
            }
        })
    })
    data.setting = {
        more: true,
        edit: false,
        close: false
    }
    data.permission = {
        _256: true,
        _8: true
    }
    window.data = data
    var task = function() {
        data.transId = Random.integer()
    }
    var expected = function(container) {
        equal(container.find('input[name=transId]').val(), data.transId, data.transId)
    }
    var before = function(container) {}
    bindThenCheck(data, tpl, task, expected, before)
})