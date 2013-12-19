## Loop

属性监听工具。

### Loop.watch(data, fn(changes))

为所有属性添加监听函数。
<!--Attach default handler function to all properties.-->

* Loop.watch(data, fn(changes))

**参数的含义和默认值**如下所示：

* 参数 data：必选。待监听的对象或数组。
* 参数 fn：必选。监听函数，当属性发生变化时被执行，参数 changes 的格式为：
    
        [
            {
                type: 'add',
                path: [guid,,],
                value: newValue
            },{
                type: 'delete',
                path: [guid,,],
                value: newValue
            }, {
                type: 'update',
                path: [guid,,],
                value: value,
                oldValue: oldValue
            }
        ]

**使用示例**如下所示：

    var data = { foo: 'foo' }
    Loop.watch(data, function(changes){
        console.log(JSON.stringify(changes, null, 4))
    })
    data.foo = 'bar'

    // =>
    [
        {
            "type": "update",
            "path": [
                6,
                "foo"
            ],
            "value": "bar",
            "oldValue": "foo",
            "root": {
                "foo": "bar"
            },
            "context": {
                "foo": "bar"
            }
        }
    ]

### Loop.unwatch(data, fn)

移除监听函数。

* Loop.unwatch(data, fn)
    移除对象（或数组） data 上绑定的监听函数 fn。
* Loop.unwatch(data)
    移除对象（或数组） data 上绑定的所有监听函数。
* Loop.unwatch(fn)
    全局移除监听函数 fn。

**参数的含义和默认值**如下所示：

* 参数 data：可选。待移除监听函数的对象或数组。
* 参数 fn：可选。待移除的监听函数。

**使用示例**如下所示：

    var data = { foo: 'foo' }
    Loop.watch(data, function(changes){
        console.log(JSON.stringify(changes, null, 4))
    })
    data.foo = 'bar'
    // =>
    [
        {
            "type": "update",
            "path": [
                3,
                "foo"
            ],
            "value": "bar",
            "oldValue": "foo",
            "root": {
                "foo": "bar"
            },
            "context": {
                "foo": "bar"
            }
        }
    ]
    
    setTimeout(function(){
        Loop.unwatch(data)
        data.foo = 'foo'
        // => 
    }, 1000)
### Loop.clone(obj, autoboxing)

深度复制对象或数组。

* Loop.clone(obj, autoboxing)

**参数的含义和默认值**如下所示：

* 参数 obj：必选。待复制的对象或数组。
* 参数 autoboxing：可选。布尔值，指示是否把基本类型（Primitive Values）自动装箱，使得可以在其上扩展属性。装箱过程通过 `new Object(value)` 实现。该参数的默认值为 false，即默认不会自动装箱。

**使用示例**如下所示：

    var data = {
        foo: 'foo'
    }
    var unboxing = Loop.clone(data)
    var autoboxing = Loop.clone(data, true)

    console.log(JSON.stringify(unboxing, null, 4))
    // =>
    {
        "foo": "foo"
    }

    console.dir(autoboxing)
    // =>
    {
        "$path": "",
        "foo": String {
            0: "f",
            1: "o",
            2: "o",
            $path: "foo",
            length: 3
        }
    }

### Loop.diff(newObject, oldObject)

比较两个对象或数组的差异。

* Loop.diff(newObject, oldObject)

**参数的含义和默认值**如下所示：

* 参数 newObject：必选。待比较的对象或数组。
* 参数 oldObject：必选。待比较的对象或数组。

所谓的**差异包括**：

1. newObject 比 oldObject 多出的属性。
2. newObject 比 oldObject 少了的属性。
3. newObject 比 oldObject 变化了的属性。

**返回值的格式**为：

    [
        {
            type: 'add',
            path: [guid,,],
            value: newValue
        },{
            type: 'delete',
            path: [guid,,],
            value: newValue
        }, {
            type: 'update',
            path: [guid,,],
            value: value,
            oldValue: oldValue
        }
    ]

**使用示例**如下所示：

    var newObject = {
        add: 'added property',
        update: 'bar'
    }
    var oldObject = {
        update: 'foo',
        deleted: 'deleted property'
    }
    var changes = Loop.diff(newObject, oldObject)
    console.log(JSON.stringify(changes, null, 4))
    // =>
    [
        {
            "type": "add",
            "path": [
                "add"
            ],
            "value": "added property"
        },
        {
            "type": "delete",
            "path": [
                "deleted"
            ],
            "value": "deleted property"
        },
        {
            "type": "update",
            "path": [
                "update"
            ],
            "value": "bar",
            "oldValue": "foo"
        }
    ]
