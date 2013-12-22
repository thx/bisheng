$(function() {

    var structure = $(
        Mock.heredoc(function() {
            /*!
<div class="tc">
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
                <input class="form-control" id="first" placeholder="Enter first name" value="{{first}}">
                <label for="last">Last Name:</label>
                <input class="form-control" id="last" placeholder="Enter last name" value="{{last}}">
            </div>
            <p>Hello {{first}} {{last}}!</p>
            */
        })
        var data = {
            first: '',
            last: ''
        }
        doit(data, tpl, '自动更新 Handlebars 模板')
    })();


})