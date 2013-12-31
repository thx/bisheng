module('Form')

test('input, data => value', function() {
    var tpl = Mock.heredoc(function() {
        /*
<p><input class="form-control" value="{{first}}"></p>
<p>{{first}}</p>
        */
    })
    var data = Mock.tpl(tpl)
    var task = function() {
        data.first = 123
    }
    var expected = function(container) {
        equal('123', container.find('input').val())
        equal('123', container.find('p:eq(1)').text())
    }
    var before = function(container) {
        equal('first', container.find('input').val())
        equal('first', container.find('p:eq(1)').text())
    }
    bindThenCheck(data, tpl, task, expected, before)
})

test('input, value => data', function() {
    var tpl = Mock.heredoc(function() {
        /*
<p><input class="form-control" value="{{first}}"></p>
<p>{{first}}</p>
        */
    })
    var data = Mock.tpl(tpl)
    var task = function(container) {
        container.find('input').val(123).trigger('change')
    }
    var expected = function(container) {
        equal('123', data.first)
    }
    var before = function(container) {
        equal('first', container.find('input').val())
        equal('first', container.find('p:eq(1)').text())
    }
    bindThenCheck(data, tpl, task, expected, before)
})

test('select, data => value', function() {
    var tpl = Mock.heredoc(function() {
        /*
<p> 
    <select class="form-control" value="{{role}}"">
        <option>Admin</option>
        <option>User</option>
    </select>
</p>
<p>{{role}}</p>
        */
    })
    var data = Mock.tpl(tpl)
    var task = function() {
        data.role = 'User'
    }
    var expected = function(container) {
        equal('User', container.find('select').val())
        equal('User', container.find('p:eq(1)').text())
    }
    var before = function(container) {
        equal('Admin', container.find('select').val())
        equal('role', container.find('p:eq(1)').text())
    }
    bindThenCheck(data, tpl, task, expected, before)
})

test('select, value => data', function() {
    var tpl = Mock.heredoc(function() {
        /*
<p> 
    <select class="form-control" value="{{role}}"">
        <option>Admin</option>
        <option>User</option>
    </select>
</p>
<p>{{role}}</p>
        */
    })
    var data = Mock.tpl(tpl)
    var task = function(container) {
        container.find('select').val('User').trigger('change') // 必须 trigger 吗？
    }
    var expected = function(container) {
        equal('User', data.role)
    }
    var before = function(container) {
        equal('Admin', container.find('select').val())
        equal('role', container.find('p:eq(1)').text())
    }
    bindThenCheck(data, tpl, task, expected, before)
})

test('textarea, data => dom', function() {
    var tpl = Mock.heredoc(function() {
        /*
<p><textarea class="form-control" rows="3" value="{{description}}">{{description}}</textarea></p>
<p>{{description}}</p>
        */
    })
    var data = Mock.tpl(tpl)
    var task = function() {
        data.description = 123
    }
    var expected = function(container) {
        equal('123', container.find('textarea').val())
        equal('123', container.find('p:eq(1)').text())
    }
    var before = function(container) {
        equal('description', container.find('textarea').val())
        equal('description', container.find('p:eq(1)').text())
    }
    bindThenCheck(data, tpl, task, expected, before)
})

test('textarea, dom => data', function() {
    var tpl = Mock.heredoc(function() {
        /*
<p><textarea class="form-control" rows="3" value="{{description}}">{{description}}</textarea></p>
<p>{{description}}</p>
        */
    })
    var data = Mock.tpl(tpl)
    var task = function(container) {
        container.find('textarea').val(123).trigger('change')
    }
    var expected = function(container) {
        equal('123', data.description)
    }
    var before = function(container) {
        equal('description', container.find('textarea').val())
        equal('description', container.find('p:eq(1)').text())
    }
    bindThenCheck(data, tpl, task, expected, before)
})

test('checkbox, checked, data => dom, false => true', function() {
    var tpl = Mock.heredoc(function() {
        /*
<label>
    <input type="checkbox" checked="{{checkboxChecked}}">
    Option one is this and that&mdash;be sure to include why it's great
</label>
<p>
    {{#if checkboxChecked}}
        Ok.
    {{else}}
        Your must agree it!
    {{/if}}
</p>
        */
    })
    var data = Mock.tpl(tpl, {
        checkboxChecked: 'false'
    })
    var task = function(container) {
        data.checkboxChecked = true
    }
    var expected = function(container) {
        equal(true, container.find('input').prop('checked'))
        equal('Ok.', $.trim(container.find('p').text()))
    }
    var before = function(container) {
        equal(false, container.find('input').prop('checked'))
        equal('Your must agree it!', $.trim(container.find('p').text()))
    }
    bindThenCheck(data, tpl, task, expected, before)
})

test('checkbox, checked, data => dom, true => false', function() {
    var tpl = Mock.heredoc(function() {
        /*
<label>
    <input type="checkbox" checked="{{checkboxChecked}}">
    Option one is this and that&mdash;be sure to include why it's great
</label>
<p>
    {{#if checkboxChecked}}
        Ok.
    {{else}}
        Your must agree it!
    {{/if}}
</p>
        */
    })
    var data = Mock.tpl(tpl, {
        checkboxChecked: 'checked'
    })
    var task = function(container) {
        data.checkboxChecked = false
    }
    var expected = function(container) {
        equal(false, container.find('input').prop('checked'))
        equal('Your must agree it!', $.trim(container.find('p').text()))
    }
    var before = function(container) {
        equal(true, container.find('input').prop('checked'))
        equal('Ok.', $.trim(container.find('p').text()))
    }
    bindThenCheck(data, tpl, task, expected, before)
})

test('checkbox, checked, dom => data, false => true', function() {
    var tpl = Mock.heredoc(function() {
        /*
<label>
    <input type="checkbox" checked="{{checkboxChecked}}">
    Option one is this and that&mdash;be sure to include why it's great
</label>
<p>
    {{#if checkboxChecked}}
        Ok.
    {{else}}
        Your must agree it!
    {{/if}}
</p>
        */
    })
    var data = Mock.tpl(tpl, {
        checkboxChecked: false
    })
    var task = function(container) {
        container.find('input').prop('checked', true).trigger('change')
    }
    var expected = function(container) {
        equal(true, data.checkboxChecked)
        equal('Ok.', $.trim(container.find('p').text()))
    }
    var before = function(container) {
        equal(false, container.find('input').prop('checked'))
        equal('Your must agree it!', $.trim(container.find('p').text()))
    }
    bindThenCheck(data, tpl, task, expected, before)
})

test('checkbox, checked, dom => data, true > false', function() {
    var tpl = Mock.heredoc(function() {
        /*
<label>
    <input type="checkbox" checked="{{checkboxChecked}}">
    Option one is this and that&mdash;be sure to include why it's great
</label>
<p>
    {{#if checkboxChecked}}
        Ok.
    {{else}}
        Your must agree it!
    {{/if}}
</p>
        */
    })
    var data = Mock.tpl(tpl, {
        checkboxChecked: true
    })
    var task = function(container) {
        container.find('input').prop('checked', false).trigger('change')
    }
    var expected = function(container) {
        equal(false, data.checkboxChecked)
        equal('Your must agree it!', $.trim(container.find('p').text()))
    }
    var before = function(container) {
        equal(true, container.find('input').prop('checked'))
        equal('Ok.', $.trim(container.find('p').text()))
    }
    bindThenCheck(data, tpl, task, expected, before)
})

// TODO radio

test('radio, checked, data => dom', function() {
    var tpl = Mock.heredoc(function() {
        /*
<form>
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
</form>
        */
    })
    var data = Mock.tpl(tpl, {
        radioChecked1: true,
        radioChecked2: false
    })
    var task = function(container) {
        data.radioChecked1 = false
        data.radioChecked2 = true
    }
    var expected = function(container) {
        equal(false, container.find('input:eq(0)').prop('checked'))
        equal(true, container.find('input:eq(1)').prop('checked'))
    }
    var before = function(container) {
        equal(true, container.find('input:eq(0)').prop('checked'))
        equal(false, container.find('input:eq(1)').prop('checked'))
    }
    bindThenCheck(data, tpl, task, expected, before)
})

test('radio, checked, doom => data', function() {
    var tpl = Mock.heredoc(function() {
        /*
<form>
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
</form>
        */
    })
    var data = Mock.tpl(tpl, {
        radioChecked1: true,
        radioChecked2: false
    })
    var task = function(container) {
        container.find('input:eq(0)').prop('checked', false).trigger('change')
        container.find('input:eq(1)').prop('checked', true).trigger('change')
    }
    var expected = function(container) {
        equal(false, container.find('input:eq(0)').prop('checked'))
        equal(true, container.find('input:eq(1)').prop('checked'))
        equal('radioValue2', $.trim(container.find('p').text()))
    }
    var before = function(container) {
        equal(true, container.find('input:eq(0)').prop('checked'))
        equal(false, container.find('input:eq(1)').prop('checked'))
        equal('optionsRadios', $.trim(container.find('p').text()))
    }
    bindThenCheck(data, tpl, task, expected, before)
})
