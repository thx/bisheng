var Binding = require('../../src/binding')
var Mock = require('../../bower_components/mockjs/dist/mock.js');
var Handlebars = require('handlebars')

require('./console.group')

console.log(Mock.heredoc(function() {
    /*
______ _           _ _               _     
| ___ (_)         | (_)             (_)    
| |_/ /_ _ __   __| |_ _ __   __ _   _ ___ 
| ___ \ | '_ \ / _` | | '_ \ / _` | | / __|
| |_/ / | | | | (_| | | | | | (_| |_| \__ \
\____/|_|_| |_|\__,_|_|_| |_|\__, (_) |___/
                              __/ |_/ |    
                             |___/|__/     
     */
}))

exports.ast_block = function(test) {
    var tpl = Mock.heredoc(function() {
        /*
        {{#each list}}
            {{title}}
        {{/each}}
         */
    })
    var ast = Handlebars.parse(tpl)
    var blocks = {}
    Binding.AST.handle(ast, blocks)

    // console.log(JSON.stringify(ast, null, 4))
    // console.log(JSON.stringify(blocks, null, 4))

    // 开始占位符，定位 Block 区域
    test.equal(ast.statements[0].type, 'content')
    test.equal(ast.statements[0].string.indexOf('<script'), 0)

    // 结束占位符
    test.equal(ast.statements[2].type, 'content')
    test.equal(ast.statements[2].string.indexOf('<script'), 0)

    // 路径占位符，定位 Block 对应的数据路径
    var block = ast.statements[1]
    test.equal(block.type, 'block')
    test.equal(block.program.statements[0].string, '<!--')
    test.equal(block.program.statements[2].string, '-->')
    var path = block.program.statements[1]
    test.equal(path.type, 'mustache')
    test.equal(path.id.string, '$path')

    test.done()
}