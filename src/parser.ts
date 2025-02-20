import { Feature } from './feature'
import { features, findFeature, textFeatures } from './features'

export default class Parser {
	parse(markdown: string) {
		if (!markdown) {
			return ''
		}

		markdown = this.sanitize(markdown)

		const root = new Element(findFeature('root'))
		let current = root.last()

		for (let i = 0; i < markdown.length; ) {
			if (current.feature.stop(markdown[i])) {
				current = current.parent
			}

			const segment = markdown.slice(i)
			const end = current.feature.end && segment.startsWith(current.feature.end)

			if (current.feature.void && !end) {
				current = current.parent
			} else if (current.feature.end && end) {
				if (current.feature.consumeEnd()) {
					i += current.feature.end.length
				}

				const next = current.parent
				current.close()
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
					if (feature.line() && current.feature.multiline) {
						current.close()
						current = current.parent
					}

					if (feature.block) {
						current = current.findParent([feature.name]).parent
					}

					i += start.length
					if (feature.text) {
						const container = current.exploreParent((element) => !!element.feature.textContainer)
						if (container && current.feature.name !== container.feature.textContainer) {
							current = container.addChild(findFeature(container.feature.textContainer))
						}
					}

					if (feature.break) {
						const parent = current.findParent(feature.break)
						if (parent) {
							parent.close()
							current = parent.parent
						}
					}

					current = current.addChild(feature)

					if (current.feature.consumeStart()) {
						const consumes = start.replace(/\n/g, '')
						while (markdown[i] && consumes.includes(markdown[i])) {
							current.consumed += markdown[i++]
						}
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
		public feature: Feature,
		public parent?: Element
	) {
		if (this.feature.autoclose()) {
			this.end = true
		}

		if (this.feature.child) {
			this.addChild(findFeature(this.feature.child))
		}
	}

	close() {
		this.end = true

		if (this.feature.attribute) {
			const parent = this.findParent(this.feature.target)
			if (parent) {
				parent.addAttribute(this.feature.attribute, this.feature.value)
			}

			return ''
		}

		if (this.feature.target) {
			this.move()
		}
	}

	last() {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		let current: Element = this

		while (current.content.length) {
			const content = current.content.filter((child) => child instanceof Element)

			if (!content.length) {
				break
			}

			current = content[content.length - 1] as Element
		}

		return current
	}

	addAttribute(key: string, value: string) {
		if (key === 'class') {
			this.class.push(value)
		} else {
			this.attributes[key] = value
		}
	}

	move() {
		const parent = this.findParent(this.feature.target)

		if (parent) {
			this.parent.content = this.parent.content.filter((child) => child !== this)
			parent.content.unshift(this)
		}
	}

	exploreParent(predicate: (element: Element) => boolean) {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		let current: Element = this

		while (current && !predicate(current)) {
			current = current.parent
		}

		return current
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

	addChild(feature: Feature): Element {
		const child = new Element(feature, this)
		this.content.push(child)

		if (feature.child) {
			return child.addChild(findFeature(feature.child))
		}

		return child
	}

	addText(text: string): Element {
		if (this.feature.textContainer) {
			return this.addChild(findFeature(this.feature.textContainer)).addText(text)
		}

		if (this.content.length && typeof this.content[this.content.length - 1] === 'string') {
			this.content[this.content.length - 1] += text
		} else {
			this.content.push(text)
		}

		return this
	}

	toHtml(): string {
		if (!this.feature.void && !this.content.length) {
			return ''
		}

		if (this.feature.attribute) {
			const parent = this.findParent(this.feature.target)
			if (parent) {
				parent.addAttribute(this.feature.attribute, this.feature.value)
			}

			return ''
		}

		let html = ''
		let tag = ''

		if (this.end) {
			if (this.feature.line() || this.feature.multiline) {
				html += '\n'
			}

			if (this.feature.tag) {
				tag = this.feature.tag
				if (this.feature.consumeStart()) {
					tag = tag.replace('$', (this.consumed.length + 1).toString())
				}

				html += `<${tag}`

				const classes = this.class.concat(this.feature.class || [])
				if (classes.length) {
					let classesAttribute = classes.join(' ')
					if (this.feature.consumeStart()) {
						classesAttribute = classesAttribute.replace('$', (this.consumed.length + 1).toString())
					}

					html += ` class="${classesAttribute}"`
				}

				for (const [key, value] of Object.entries(this.attributes)) {
					html += ` ${key}="${value}"`
				}

				html += '>'
			}
		} else {
			html += this.feature.start + this.consumed
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

			if (this.end && !this.feature.void && !contentHtml.trim()) {
				return ''
			}

			html += contentHtml
		}

		if (this.end) {
			if (this.feature.append) {
				html += this.feature.append(this)
			}

			if (this.feature.tag && !this.feature.void) {
				html += `</${tag}>`
			}

			if (this.feature.line() || this.feature.multiline) {
				html += '\n'
			}
		}

		return html
	}

	toString() {}
}
