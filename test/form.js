(function input() {
    // return
    var tpl = Mock.heredoc(function() {
        /*!
<p>
    <input class="form-control" value="{{first}}">
</p>
<p>
    {{first}}
</p>
         */
    })
    var data = Mock.tpl(tpl, {
        first: '@FIRST'
    })
    doit(data, tpl)

    tasks.push(
        function() {
            data.first = Random.first()
        }
    )
})();

(function select() {
    // return
    var tpl = Mock.heredoc(function() {
        /*!
<p> 
    <select class="form-control" value="{{role}}"">
        <option>Admin</option>
        <option>User</option>
    </select>
</p>
<p>
    {{role}}
</p>
         */
    })
    var data = Mock.tpl(tpl)
    doit(data, tpl)

    tasks.push(
        function() {
            data.role = Random.pick(['Admin', 'User'])
        }
    )
})();

(function textarea() {
    // return
    var tpl = Mock.heredoc(function() {
        /*!
<p> 
    <textarea class="form-control" rows="3" value="{{description}}">{{description}}</textarea>
</p>
<p>
    {{description}}
</p>
         */
    })
    var data = Mock.tpl(tpl, {
        description: '@SENTENCE'
    })
    doit(data, tpl)

    tasks.push(
        function() {
            data.description = Random.sentence()
        }
    )
})();

(function checkbox() {
    // return
    var tpl = Mock.heredoc(function() {
        /*!
<div class="checkbox">
    <label>
        <input type="checkbox" value="{{checkboxValue}}" checked="{{checkboxChecked}}">
        Option one is this and that&mdash;be sure to include why it's great
    </label>
</div>
<p>
    {{#if checkboxChecked}}
        Ok.
    {{else}}
        Your must agree it!
    {{/if}}
</p>
<!-- Mock { 
    title: '@TITLE',
    'checkboxChecked|1': ['checked',false]
} -->

         */
    })
    var data = Mock.tpl(tpl)
    doit(data, tpl)

    tasks.push(
        function() {
            data.checkboxValue = Random.integer()
        },
        function() {
            data.checkboxChecked = Random.boolean()
        }
    )
})();

(function radio() {
    var tpl = Mock.heredoc(function() {
        /*!
<div class="radio">
    <label>
        <input type="radio" name="optionsRadios" value="{{radioValue1}}" checked="{{radioChecked1}}">
        Option one is this and that&mdash;be sure to include why it's great
    </label>
</div>
<div class="radio">
    <label>
        <input type="radio" name="optionsRadios" value="{{radioValue2}}" checked="{{radioChecked2}}">
        Option two can be something else and selecting it will deselect option one
    </label>
</div>
<p>
    {{optionsRadios}}
</p>
         */
    })
    var data = Mock.tpl(tpl, {
        optionsRadios: ''
    })
    doit(data, tpl)

    tasks.push(
        function() {
            data.radioChecked1 = !data.radioChecked1.valueOf()
            data.radioChecked2 = !data.radioChecked1.valueOf()
        }
    )
})();