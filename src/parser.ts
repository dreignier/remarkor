import { Feature } from './feature'
import { features, textFeatures } from './features'

export default class Parser {
	parse(markdown: string) {
		if (!markdown) {
			return ''
		}

		markdown = this.sanitize(markdown)

		const root = new Element()
		let current = root
		const initial = features.find((feature) => feature.name === 'page')
		if (initial) {
			current = root.addChild(initial)
		}

		for (let i = 0; i < markdown.length; ) {
			if (current.feature?.stop(markdown[i])) {
				current = current.parent
			}

			const segment = markdown.slice(i)

			if (current.feature?.end && segment.startsWith(current.feature.end)) {
				if (current.feature.consumeEnd()) {
					i += current.feature.end.length
				}

				const next = current.parent

				if (current.feature?.target) {
					current.move()
				}

				current.end = true
				current = next
			} else {
				let feature: Feature
				let start: string
				for (feature of features) {
					start = feature.scan(segment, current.feature)

					if (start) {
						break
					}
				}

				if (start) {
					if (feature.line() && current.feature?.multiline) {
						current.end = true
						current = current.parent
					}

					if (feature.block) {
						current = current.findParent([feature.name]).parent
					}

					i += start.length
					current = current.addChild(feature)

					if (current.feature.consumeStart()) {
						const consumes = start.replace(/\n/g, '')
						while (markdown[i] && consumes.includes(markdown[i])) {
							current.consumed += markdown[i++]
						}
					}

					if (feature.void) {
						current.end = true
						current = current.parent
					}
				} else {
					current = current.addText(markdown[i++])
				}
			}
		}

		return root.toHtml()
	}

	sanitize(markdown: string) {
		return ('\n\n' + markdown + '\n\n')
			.replace(/\r/g, '')
			.replace('  +', ' ')
			.replace('\t', '    ')
			.replace(/ +\n +/g, '\n')
			.replace(/\n\n+/g, '\n\n')
	}
}

export class Element {
	content: (Element | string)[] = []
	end = false
	consumed = ''
	class: string[] = []
	attributes: Record<string, string> = {}

	constructor(
		public parent?: Element,
		public feature?: Feature
	) {
		if (!this.feature || this.feature.block) {
			this.end = true
		}
	}

	addAttribute(key: string, value: string) {
		if (key === 'class') {
			this.class.push(value)
		} else {
			this.attributes[key] = value
		}
	}

	move() {
		const parent = this.findParent(this.feature?.target)

		if (parent) {
			this.parent.content = this.parent.content.filter((child) => child !== this)
			parent.content.unshift(this)
		}
	}

	findParent(names: string[]) {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		let current: Element = this

		while (current && (!current.feature || !names.includes(current.feature.name))) {
			current = current.parent
		}

		return current
	}

	index() {
		if (!this.parent) {
			return 0
		}

		return this.parent.content.indexOf(this)
	}

	addChild(feature?: Feature): Element {
		const child = new Element(this, feature)
		this.content.push(child)

		if (feature?.child) {
			return child.addChild(features.find((f) => f.name === feature.child))
		}

		return child
	}

	addText(text: string): Element {
		if (this.feature?.textContainer) {
			return this.addChild(features.find((feature) => feature.name === this.feature.textContainer)).addText(text)
		}

		if (this.content.length && typeof this.content[this.content.length - 1] === 'string') {
			this.content[this.content.length - 1] += text
		} else {
			this.content.push(text)
		}

		return this
	}

	toHtml() {
		if (!this.end || (this.feature?.void && this.content.length)) {
			return this.feature.start + this.consumed + this.content.join('')
		}

		if (!this.feature?.void && !this.content.length) {
			return ''
		}

		let html = ''
		let tag = ''

		if (this.feature) {
			if (this.feature.line() || this.feature.multiline) {
				html += '\n'
			}

			tag = this.feature.tag
			if (this.feature.consumeStart()) {
				tag = tag.replace('$', (this.consumed.length + 1).toString())
			}

			html += `<${tag}`

			const classes = this.class.concat(this.feature.class || [])
			if (classes.length) {
				html += ` class="${classes.join(' ')}"`
			}

			for (const [key, value] of Object.entries(this.attributes)) {
				html += ` ${key}="${value}"`
			}

			html += '>'
		}

		if (this.content.length) {
			const contentHtml = this.content
				.map((child) => {
					if (child instanceof Element) {
						return child.toHtml()
					}

					for (const feature of textFeatures) {
						child = feature.process(child)
					}

					return child
				})
				.join('')

			if (!this.feature?.void && !contentHtml.trim()) {
				return ''
			}

			html += contentHtml
		}

		if (this.feature) {
			if (this.feature.append) {
				html += this.feature.append(this)
			}

			if (!this.feature.void) {
				html += `</${tag}>`
			}

			if (this.feature.line() || this.feature.multiline) {
				html += '\n'
			}
		}

		return html
	}

	toString() {
		return this.toHtml()
	}
}
