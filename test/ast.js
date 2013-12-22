module('AST')

test('object expression', function() {
    var tpl = '{{title}}'
    var ast = Handlebars.parse(tpl)
    BiSheng.AST.handle(ast)

    equal(ast.statements.length, 5, ast.statements)
})

test('object block', function() {
    var tpl = '{{#if condition}}{{title}}{{/if}}'
    var ast = BiSheng.AST.handle(Handlebars.parse(tpl))

    statements = ast.statements
    equal(statements.length, 5, statements)
    equal('$lastest', statements[1].id.string, statements[1].id.string)

    statements = ast.statements[3].program.statements
    equal(statements.length, 5, statements)
    equal('$lastest', statements[1].id.string, statements[1].id.string)
})