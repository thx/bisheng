"use strict";

/* global window */
/* global expose */
/* global Handlebars */

(function(factory) {

	expose(factory, function() {
		window.AST = factory()
	})

}(function() {

	var guid = 1;

	Handlebars.registerHelper('$lastest', function(items, options) {
		return items && items.$path || this.$path
	})

	return {
		createPathHTML: function createPathHTML(attrs) {
			// attrs.guid = attrs.guid || guid++
			var escape = Handlebars.Utils.escapeExpression

			var pathHTML = escape('<script')
			for (var key in attrs) {
				if (attrs[key] === undefined) continue
				pathHTML += ' ' + key + escape('="') + attrs[key] + escape('"')
			}
			pathHTML += escape('></script>')

			return pathHTML
		},

		/*
            * AST.handle(node, blocks)
            * AST.handle(node, blocks, helpers)
                公开方法
            * AST.handle(node, context, index, blocks, helpers)
                用于内部递归修改 AST
        */
		handle: function handle(node, context, index, blocks, helpers) {
			if (arguments.length === 2) {
				blocks = context
				context = undefined
				helpers = {}
			}
			if (arguments.length === 3) {
				blocks = context
				helpers = index
				context = index = undefined
			}

			if (this[node.type]) this[node.type](node, context, index, blocks, helpers)

			return node
		},

		program: function program(node, context, index, blocks, helpers) {
			for (var i = 0; i < node.statements.length; i++) {
				this.handle(node.statements[i], node.statements, i, blocks, helpers)
			}
		},

		// 为 Expression 插入占位符
		mustache: function(node, context, index, blocks, helpers) {
			if (node.binded) return

			var prop = []
			if (node.isHelper) {
				node.params.forEach(function(param) {
					if (param.type === 'ID') {
						prop.push(param.string)
					}
				})
			} else {
				prop.push(node.id.string)
			}
			prop = prop.join(' ')

			var attrs = {
				guid: guid,
				slot: '',
				type: '',
				path: '{{$lastest ' + prop + '}}',
				isHelper: !! node.isHelper
			}
			var placeholder
			var statements

			attrs.slot = 'start'
			placeholder = this.createPathHTML(attrs)
			statements = Handlebars.parse(placeholder).statements
			statements[1].binded = true
			context.splice.apply(context, [index, 0].concat(statements))

			attrs.slot = 'end'
			placeholder = this.createPathHTML(attrs)
			statements = Handlebars.parse(placeholder).statements
			statements[1].binded = true
			context.splice.apply(context, [index + 4, 0].concat(statements))

			helpers[guid++] = {
				constructor: Handlebars.AST.ProgramNode,
				type: 'program',
				statements: [node]
			}

			node.binded = true
		},

		// 为 Block 插入占位符
		block: function block(node, context, index, blocks, helpers) {
			if (node.binded) return

			var helper, prop
			if (node.mustache.params.length === 0) {
				helper = ''
				prop = node.mustache.id.string
			} else {
				helper = node.mustache.id.string
				prop = node.mustache.params[0].string
			}

			var attrs = {
				guid: guid,
				slot: '',
				type: 'block',
				path: '{{$lastest ' + prop + '}}',
				helper: helper
			}
			var placeholder
			var statements



			// mustache 定义 DOM 位置
			attrs.slot = 'start'
			placeholder = this.createPathHTML(attrs)
			statements = Handlebars.parse(placeholder).statements
			statements[1].binded = true
			context.splice.apply(context, [index, 0].concat(statements))

			attrs.slot = 'end'
			placeholder = this.createPathHTML(attrs)
			statements = Handlebars.parse(placeholder).statements
			statements[1].binded = true
			context.splice.apply(context, [index + 4, 0].concat(statements))

			blocks[guid++] = {
				constructor: Handlebars.AST.ProgramNode,
				type: 'program',
				statements: [node]
			}

			// program 定义数据路径（废弃？转而通过 helper 插入？）

			/*node.program && node.program.statements.unshift.apply(
                node.program.statements,
                Handlebars.parse('<!--{{$path}}-->').statements
            )
            node.inverse && node.inverse.statements.unshift.apply(
                node.inverse.statements,
                Handlebars.parse('<!--{{$path}}-->').statements
            )*/


			node.binded = true

			this.handle(node.program || node.inverse, context, index, blocks, helpers)
		}
	}

}));