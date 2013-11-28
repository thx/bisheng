var tasks = []
setInterval(function() {
    if (tasks.length) Random.pick(tasks)()
}, 1000)

;
(function expression() {
    // return
    var tpl = Mock.heredoc(function() {
        /*
        <h2>Expression</h2>
        <p>{{title}}</p>
        */
    })
    var data = Mock.tpl(tpl)
    bind(data, tpl, function(content) {
        $('div.container').append(content)
    })

    tasks.push(
        function() {
            data.title = Random.title(3)
        }
    )

})()

;
(function attribute() {
    // return
    var tpl = Mock.heredoc(function() {
        /*
        <h2>Attribute</h2>
        <p>
            <ul>
                <li title="{{title}}">属性 <code>title</code> 在变</li>
                <li class="before {{title}} after">属性 <code>class</code> 的一部分在变</li>
                <li style="width: {{width}}px; height: auto">属性 <code>style</code> 的一部分在变</li>
            </ul>
        </p>
        <!-- Mock { width: '@INTEGER(200,500)'}-->
        */
    })
    var data = Mock.tpl(tpl)
    bind(data, tpl, function(content) {
        $('div.container').append(content)
    })

    tasks.push(
        function() {
            data.title = Random.title(3)
        },
        function() {
            data.width = Random.integer(200, 500)
        }
    )

})()

;
(function form() {
    var tpl = Mock.heredoc(function() {
        /*
        <h2>Form</h2>
        <p>
            <input class="form-control" value="{{first}}">
        </p>
        <p>
            <input class="form-control" value="{{last}}">
        </p>
        <p> 
            <select class="form-control" value="{{role}}"">
                <option>Admin</option>
                <option>User</option>
            </select>
        </p>
        <p> 
            <textarea class="form-control" value="{{description}}"></textarea>
        </p>
        <p>
            <div class="checkbox">
              <label>
                <input type="checkbox" value="{{remember}}">
                Option one is this and that&mdash;be sure to include why it's great
              </label>
            </div>
            <div class="radio">
              <label>
                <input type="radio" name="optionsRadios" value="{{option1}}" checked>
                Option one is this and that&mdash;be sure to include why it's great
              </label>
            </div>
            <div class="radio">
              <label>
                <input type="radio" name="optionsRadios" value="{{option2}}">
                Option two can be something else and selecting it will deselect option one
              </label>
            </div>
        </p>
        <div class="panel panel-success">
            <div class="panel-heading">Result</div>
            <div class="panel-body">
                {{first}}, {{last}}, {{role}}, {{description}}
            </div>
        </div>

        <!-- Mock { first: '@FIRST'}-->
        <!-- Mock { last: '@LAST'}-->
        <!-- Mock { role: 'Role'}-->
        <!-- Mock { description: '@SENTENCE'}-->
        */
    })
    var data = Mock.tpl(tpl)
    bind(data, tpl, function(content) {
        $('div.container').append(content)
    })

    tasks.push(
        function() {
            data.first = Random.first()
        },
        function() {
            data.last = Random.last()
        },
        function() {
            data.description = Random.sentence()
        }
    )

})()

;
(function each() {
    // return
    var tpl = Mock.heredoc(function() {
        /*
        <h2>#each, #unless</h2>
        <table class="table table-hover">
            <tr>
                <th width="20%">#</th>
                <th width="40%">Date</th>
                <th width="40%">Email</th>
            </tr>
            {{#each list}}
            <tr>
                <td>{{@index}}</td>
                <td>{{date}}</td>
                <td>{{email}}</td>
            </tr>
            {{/each}}
            {{#unless list}}
            <tr class="warning">
                <td colspan="3" class="text-center">
                    <h3 class="warning">WARNING: This entry does not have any records!</h3>
                </td>
            </tr>
            {{/unless}}
        </table>

        <!-- Mock {
            'list|1-10': [{
              date: '@DATE',
              email: '@EMAIL'
            }]
          }-->
        */
    })
    var data = Mock.tpl(tpl)
    bind(data, tpl, function(content) {
        $('div.container').append(content)
    })

    tasks.push(
        function() {
            if (data.list.length) Random.pick(data.list).date = Random.date()
        },
        function() {
            if (data.list.length) Random.pick(data.list).email = Random.email()
        },
        function() {
            data.list.push({
                date: Random.date(),
                email: Random.email()
            })
        },
        function() {
            data.list.pop()
        },
        function() {
            data.list.unshift({
                date: Random.date(),
                email: Random.email()
            })
        },
        function() {
            data.list.shift()
        }
    )

})()