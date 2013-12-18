/*
    http://emberjs.com/guides/getting-started/planning-the-application/

    1. √ It displays a list of todos for a user to see. This list will grow and shrink as the user adds and removes todos.
    2. √ It accepts text in an <input> for entry of new todos. Hitting the <enter> key creates the new item and displays it in the list below.
    3. √ It provides a checkbox to toggle between complete and incomplete states for each todo. New todos start as incomplete.
    4. √ It displays the number of incomplete todos and keeps this count updated as new todos are added and existing todos are completed.
    5. √ It provides links for the user to navigate between lists showing all, incomplete, and completed todos.
    6. √ It provides a button to remove all completed todos and informs the user of the number of completed todos. This button will not be visible if there are no completed todos.
    7. √ It provides a button to remove a single specific todo. This button displays as a user hovers over a todo and takes the form of a red X.
    8. √ It provides a checkbox to toggle all existing todos between complete and incomplete states. Further, when all todos are completed this checkbox becomes checked without user interaction.
    9. √ It allows a user to double click to show a textfield for editing a single todo. Hitting the <enter> key or moving focus outside of this textfield will persist the changed text.
    10. √ It retains a user's todos between application loads by using the browser's localstorage mechanism.


*/
$(function() {

    var KEY_ENTER = 13;
    var KEY_ESCAPE = 27;

    function store(namespace, data) {
        if (arguments.length > 1) {
            return localStorage.setItem(namespace, JSON.stringify(data));
        } else {
            var store = localStorage.getItem(namespace);
            return (store && JSON.parse(store));
        }
    }

    var tpl = $('script[type="text/x-handlebars"][data-template-name="todos"]').text();
    tpl = $.trim(tpl)

    data = Mock.tpl(tpl, {
        id: '@GUID',
        title: '@TITLE(3)',
        completed: '@BOOLEAN'
    })
    data.todos = store('todos-hyde') || data.todos

    function remaining() {
        var remaining = 0
        for (var i = 0; i < data.todos.length; i++) {
            if (!data.todos[i].completed) remaining++
        }
        return remaining
    }


    function sync() {
        store('todos-hyde', data.todos)
        data.all = data.todos.length
        data.remaining = remaining()
        data.completed = data.all - data.remaining
        if (data.status) {
            $('a.' + data.status).click()
        }
    }

    sync()

    console.log(JSON.stringify(data, null, 4))

    Hyde.bind(data, tpl, function(content) {
        $(content).appendTo('body')
    })
    Loop.watch(data, function(changes) {
        sync()
    })

    $('section#todoapp')
        .on('change', 'input#toggle-all', function(event) {
            var checked = $(event.target).prop('checked')
            $('ul#todo-list > li input.toggle').prop('checked', checked).trigger('change')
        })
        .on('keyup', 'input#new-todo', function(event) {
            var $input = $(this);
            var val = $.trim($input.val());

            if (event.which !== KEY_ENTER || !val) {
                return;
            }

            data.todos.push({
                id: Random.guid(),
                title: val,
                completed: false
            })

            $input.val('')
        })
        .on('click', 'button.destroy', function(event) {
            var id = $(event.target).closest('li').data('id')
            $.each(data.todos, function(index, todo) {
                if (todo.id === id) {
                    data.todos.splice(index, 1)
                    sync()
                    return false
                }
            });
        })
        .on('change', 'input.toggle', function() {
            var checkbox = $('ul#todo-list > li input.toggle')
            $('input#toggle-all').prop('checked',
                checkbox.filter(':checked').length === checkbox.length
            )
        })
        .on('dblclick', 'label', function(event) {
            var $input = $(this).closest('li').addClass('editing').find('input.edit')
            var val = $input.val()
            $input.data('val', val)
            $input.val(val).focus()
        })
        .on('keyup', 'input.edit', function(event) {
            var $input = $(this)
            var cancel = event.which === KEY_ESCAPE
            if (cancel) {
                $(this).closest('li').removeClass('editing')
                $input.val($input.data('val'))
            }
        })
        .on('keypress blur', 'input.edit', function(event) {
            var update = event.type === 'blur' || event.type === 'keypress' && event.which === KEY_ENTER
            if (update) $(this).closest('li').removeClass('editing')

            var val = $.trim($(this).val());
            var id = $(this).closest('li').data('id')

            $.each(data.todos, function(index, todo) {
                if (todo.id === id) {
                    if (val) data.todos[index].title = val
                    else {
                        if (update) data.todos.splice(index, 1)
                    }
                    return false
                }
            });
        })
        .on('click', 'a.all', function() {
            data.status = 'all'
            $('ul#todo-list > li').show()
        })
        .on('click', 'a.active', function() {
            data.status = 'active'
            var active = ':not(:has(input:checked))'
            var completed = ':has(input:checked)'
            $('ul#todo-list > li')
                .filter(active).closest('li').show().end().end()
                .filter(completed).closest('li').hide().end().end()
        })
        .on('click', 'a.completed', function() {
            data.status = 'completed'
            var active = ':not(:has(input:checked))'
            var completed = ':has(input:checked)'
            $('ul#todo-list > li')
                .filter(active).closest('li').hide().end().end()
                .filter(completed).closest('li').show().end().end()
        })
        .on('click', 'button#clear-completed', function(event) {
            for (var i = 0; i < data.todos.length; i++) {
                if (data.todos[i].completed) data.todos.splice(i--, 1)
            }
        })
})