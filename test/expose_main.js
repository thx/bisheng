/* jshint unused: true */
/* exported main */
function main(BiSheng) {
	test('placeholder', function() {
		var tpl = '{{foo}}'
		var data = {
			foo: 123
		}
		var task = function() {
			data.foo = 456
		}
		var expected = function(container) {
			equal('456', container.text(), tpl)
		}

		stop()

		// 容器节点
		var container = $('div.container')

		// 执行双向绑定
		BiSheng.bind(data, tpl, function(content) {
			container.append(content)
		}, container)

		// 检测视图是否更新
		BiSheng.Loop.watch(data, function( /*changes*/ ) {
			container.each(function(index, item) {
				expected($(item))
			})
			container.empty()
			BiSheng.unbind(data)
			start()
		})

		// 更新数据
		BiSheng.apply(function() {
			task(container)
		})

	})
}