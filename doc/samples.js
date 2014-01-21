$(function() {

    var structure = $(
        Mock.heredoc(function() {
            /*!
<div class="col-sm-6 tc">
    <div class="panel panel-default">
        <div class="panel-heading"></div>
        <div class="panel-body result"></div>
    </div>
</div>
     */
        })
    );

    if (!window.JSON) {
        window.JSON = {
            stringify: function(json) {
                return json
            }
        }
    }

    function doit(data, tpl, name) {
        var target = structure.clone();
        BiSheng.bind(data, tpl, function(content) {
            // 可能有多个 'div#samples'，记录下来，以便当数据变化时更新对应的页面区域
            target = target
                .find('div.panel-heading').empty().append(name).end()
                .find('div.result').empty().append(content).end()
                .appendTo('div#samples')
        })
    }

    (function attribute_title() {
        // return
        var tpl = Mock.heredoc(function() {
            /*
            <div class="form-group">
                <label for="first">First Name:</label>
                <input class="form-control" placeholder="Enter first name" value="{{first}}">
                <label for="last">Last Name:</label>
                <input class="form-control" placeholder="Enter last name" value="{{last}}">
            </div>
            <p>Hello {{first}} {{last}}!</p>
            */
        })
        var data = {
            first: 'Zhi',
            last: 'Mo'
        }
        doit(data, tpl, 'Auto-updating Handlebars Templates') // 自动更新 Handlebars 模板
    })();

    (function attribute_src() {
        // return
        var tpl = Mock.heredoc(function() {
            /*
            <div>
                <p style="text-align: center;">
                    <img src="https://1.gravatar.com/avatar/{{md5}}?s=128">
                </p>
                <input class="form-control" placeholder="Enter email" value="{{email}}" style="text-align: center;">
            </div>
            */
        })
        var data = {
            md5: md5('nuysoft@gmail.com'),
            email: 'nuysoft@gmail.com'
        }
        BiSheng.watch(data, 'email', function(change) {
            data.md5 = md5(change.value)
        })
        doit(data, tpl, 'Retrieve a Gravatar Image Dynamically') // Retrieve a gravatar image dynamically from any e-mail address
    })();


})