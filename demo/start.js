var tasks = [];
var index = 0;
setInterval(function() {
    if (tasks.length) {
        tasks[index++ % tasks.length]()
        // Random.pick(tasks)()
    }
}, 1000)

var structure = $(
    Mock.heredoc(function() {
        /*!
<div>
    <h2 class="name"></h2>
    <div class="row">
        <div class="col-md-6">
            <div class="panel panel-default">
                <div class="panel-heading">Result:</div>
                <div class="panel-body result"></div>
            </div>
        </div>
        <div class="col-md-6">
            <div class="panel panel-default">
                <div class="panel-heading">Source:</div>
                <div class="panel-body pre source"></div>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-md-6">
            <div class="panel panel-default">
                <div class="panel-heading">Template:</div>
                <div class="panel-body pre tpl"></div>
            </div>
        </div>
        <div class="col-md-6">
            <div class="panel panel-default">
                <div class="panel-heading">Data:</div>
                <div class="panel-body pre data"></div>
            </div>
        </div>
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

/* jshint unused: false */
function doit(data, tpl, name) {
    var target = structure.clone();
    Hyde.bind(data, tpl, function(content) {
        // 可能有多个 'div.container'，记录下来，以便当数据变化时更新对应的页面区域
        target = target
            .find('h2.name').empty().append(name).end()
            .find('div.result').empty().append(content).end()
            .find('div.tpl').empty().text(tpl).end()
            .find('div.data').empty().html(JSON.stringify(data, null, 4)).end()
            .appendTo('div.container')
    })

    Loop.watch(data, function(changes) {
        $.each(changes, function(_, change) {
            // 更新 div.data
            target
                .find('div.data').empty().html(JSON.stringify(data, null, 4)).end()
                .find('div.source').empty().text(
                    target.find('div.result').html()
                ).end()
        })
    })

    Flush.scrollIntoView = function scrollIntoView(event) {
        if (event.target.nodeType) event.target = [event.target]
        event.target.forEach && event.target.forEach(function(item, index) {
            var panel = $(item).parents('.panel')
            if (!panel.length) return
            var top = panel.offset().top
            var height = panel.height()
            var min = $(window).scrollTop()
            var wh = $(window).height()
            var max = min + wh

            if (top >= min && (top + height) <= max) return

            var targetTop
            if (top < min) targetTop = top - 15
            if ((top + height) > max) targetTop = top + height - wh + 15
            $('body').animate({
                scrollTop: targetTop
            }, 'fast')

        })
    }
}