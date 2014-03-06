var RE_EVENT = /bs\-(.+)/
var EXPANDO = ('' + Math.random()).replace(/\D/g, '')
var EVENT_NAMESPACE = '.bisheng_event_' + EXPANDO
var EVENT_PREFIX = 'bs-';

function parseEvents(container) {
	return container.find('*').map(function(index, node) {
		return $.map(node.attributes, function(attr, index) {
			var ma = RE_EVENT.exec(attr.name)
			if (ma) {
				return {
					orig: attr.name,
					type: ma[1],
					value: attr.value,
					target: node
				}
			}
		})

	})
}

function parsetTypes(events) {
	return $.unique(events.map(function() {
		return this.type
	})).sort()
}

function bind(container, types) {
	$.each(types, function(index, type) {
		var name = EVENT_PREFIX + type,
			value,
			selector = '[' + name + ']',
			triggered = false;
		container
			.on(type, selector, function(event, extraParameters) {
				if (type === 'click') event.preventDefault()
				if (!triggered) {
					triggered = true
					setTimeout(function() {
						$(event.target).trigger(type + EVENT_NAMESPACE, true)
					}, 0)
				}
			})
			.on(type + EVENT_NAMESPACE, selector, function(event, extraParameters) {
				if (extraParameters) {
					value = $(event.currentTarget).attr(name)
					console.log(event.type, value)
					eval(value)
					triggered = false
					return false
				}
			})
	})
}

// 
var container = $('.container')
var events = parseEvents(container)
var types = parsetTypes(events)
bind(container, types)