var tasks = [];
var index = 0;
setInterval(function() {
    if (tasks.length) {
        tasks[index++ % tasks.length]()
    }
}, 1000)

var structure = $(
    Mock.heredoc(function() {
        /*!
<div class="case">
    <h2 class="name"></h2>
    <div class="row">
        <div class="col-md-6">
            <div class="panel panel-default">
                <div class="panel-heading">Diff:</div>
                <div class="panel-body pre diff"></div>
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

/* jshint unused: false */
function doit(data, name) {
    var target = structure.clone();
    target
        .find('h2.name').empty().append(name).end()
        .find('div.diff').empty().append('').end()
        .find('div.data').empty().html(JSON.stringify(data, null, 2)).end()
        .appendTo('div.container')

    Loop.watch(data, function(diff) {
        target
            .find('div.diff').empty().html(JSON.stringify(diff, null, 2)).end()
            .find('div.data').empty().html(JSON.stringify(data, null, 2)).end()
    })

}

(function object() {
    // return
    var data = {
        a: {
            b: 'c'
        }
    }
    doit(data, 'Object')

    tasks.push(
        function() {
            data.a.b = Random.guid()
        },
        function() {
            data.title = Random.title()
        },
        function() {
            delete data.title
        }
    )
})();

(function array() {
    // return
    var data = [1, 2, 3]
    doit(data, 'Array')

    tasks.push(
        function() {
            data.push(Random.guid())
            data.push(Random.guid())
        },
        function() {
            data.pop()
            data.pop()
        },
        function() {
            data.title = Random.title()
        },
        function() {
            delete data.title
        }
    )
})();