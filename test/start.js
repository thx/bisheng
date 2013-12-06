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
<div class="row">
    <div class="col-md-4">
        <div class="panel panel-default">
            <div class="panel-heading">Result:</div>
            <div class="panel-body result"></div>
        </div>
    </div>
    <div class="col-md-4">
        <div class="panel panel-default">
            <div class="panel-heading">Template:</div>
            <div class="panel-body pre tpl"></div>
        </div>
    </div>
    <div class="col-md-4">
        <div class="panel panel-default">
            <div class="panel-heading">Data:</div>
            <div class="panel-body pre data"></div>
        </div>
    </div>
</div>
     */
    })
);

/* jshint unused: false */
function doit(data, tpl) {
    var target = structure.clone();
    bind(data, tpl, function(content) {
        target
            .find('div.result').empty().append(content).end()
            .find('div.tpl').empty().text(tpl).end()
            .find('div.data').empty().html(JSON.stringify(data.$data, null, 4)).end()
            .appendTo('div.container')
    })

    Watch.watch(data, ['change'], function(event, _) {
        Watch.log(event, _)

        /*
            如果 URL 中含有参数 scrollIntoView，则自动滚动至发生变化的元素。
            用于调试、演示，或者在项目中提醒用户。
        */
        if (location.href.indexOf('scrollIntoView') > -1) scrollIntoView(event, _)

        // 更新 div.data
        target
            .find('div.data').empty().html(JSON.stringify(data.$data, null, 4)).end()
    })

    function scrollIntoView(event, _) {
        if (event.target.nodeType) event.target = [event.target]
        Watch.define.defining.push(true)
        event.target.forEach && event.target.forEach(function(item, index) {
            var panel = $(item).parents('.panel')
            if(!panel.length) return
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
        Watch.define.defining.pop()
    }
}