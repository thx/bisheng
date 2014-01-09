# 支持 CROX

## 前置

BiSheng.js 对模板引擎要求：

1. 支持注册 helper，或者支持 {{$lastest property}}。

    为了获取数据属性 property 的路径。

2. 暴漏语法树，且语法树结构稳定、格式良好。

    为了插入定位符。

3. 暴露逻辑块 {{#if}} 生成的函数。

    为了覆盖 {{#if}} 的判断逻辑：`if(property)` ==> `if(property.valueOf())`

## 方案

1. 整理 CROX 语法

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

2. 扩展语法 {{$lastest property}}

    "{{$lastest" expr "}}" { $$ = ['$lastest', $2]; }

3. 覆盖 {{#if}} 的判断逻辑

    if(property)
    ==>
    if(property.valueOf())

## 问题 & 难点

1. CORX 的语法树以位置来约定含义，有些晦涩。
2. 其他待讨论如何解决。




