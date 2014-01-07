/*
    program:

    ['prog', statements]

    statement:

    ['if', expr, statements]
    ['if', expr, statements, statements]
    ['each', expr, statements, index, value]
    ['set', id, expr]
    ['eval', expr, true]
    ['eval', expr, false]
    ['text', text]

    PrimaryExpression: literal
    ['lit', string/number/boolean/]
    ['id', id]

    MemberExpression:
    ['.', MemberExpression, id]
    ['[]', MemberExpression, expr]

    UnaryExpression:
    ['!', UnaryExpression]
    ['u-', UnaryExpression]

    MultiplicativeExpression:
    ['', Expression, Expression]
        * / %
        + -
        < > <= >= 
        eq ne 
        && ||

*/

var structure = $(
    Mock.heredoc(function() {
        /*!
<div class="tc">
    <h2 class="name"></h2>
    <div class="row">
        <div class="col-md-4">
            <div class="panel panel-default">
                <div class="panel-heading">Template</div>
                <div class="panel-body pre template"></div>
            </div>
        </div>
        <div class="col-md-8">
            <div class="panel panel-default">
                <div class="panel-heading">AST</div>
                <div class="panel-body pre ast"></div>
            </div>
        </div>
    </div>
</div>
     */
    })
);

function show(tpl) {
    var ast = Crox.parse(tpl)
    structure.clone()
        .find('.template').text(tpl).end()
        .find('.ast').text(JSON.stringify(ast, null, 4)).end()
        .appendTo('.container')


}

$(function() {
    
    show('{{title}}')

    show(
        Mock.heredoc(function() {
            /*
{{#if condition}}
    {{title}}
{{/if}}
            */
        })
    )

    show(
        Mock.heredoc(function() {
            /*
{{#each list "item"}}
    {{item.title}}
{{/each}}
            */
        })
    )
})

/*
    ## 
    * each 的参数可以不是字符串么
    * 
*/