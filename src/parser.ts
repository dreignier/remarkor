import { Feature, features } from './features'

export default class Parser {
	parse(markdown: string) {
		if (!markdown) {
			return ''
		}

		markdown = this.sanitize(markdown)

		const root = new Element()
		let current = root
		const initial = features.find((feature) => feature.initial)
		if (initial) {
			current = root.addChild(initial)
		}

		for (let i = 0; i < markdown.length; ) {
			if (markdown[i] === '\n' && current.feature && !current.feature.multiline && !current.feature.line && !current.feature.block) {
				current = current.parent
			}

			const segment = markdown.slice(i)

			if (current.feature?.end && segment.startsWith(current.feature.end)) {
				if (!current.feature.line && !current.feature.multiline) {
					i += current.feature.end.length
				}

				const next = current.parent

				if (current.feature?.target) {
					current.moveTo(current.feature.target)
				}

				current.end = true
				current = next
			} else {
				const feature = features.find((feature) => segment.startsWith(feature.start) && (!feature.parent || current.feature?.name === feature.parent))

				if (feature) {
					if (feature.line && current.feature?.multiline) {
						current.end = true
						current = current.parent
					}

					if (feature.block) {
						while (current.feature?.name !== feature.name) {
							current = current.parent
						}

						current = current.parent
					}

					i += feature.start.length
					current = current.addChild(feature)

					if (feature.line) {
						const consumes = feature.start.replace(/\n/g, '')
						while (markdown[i] && consumes.includes(markdown[i])) {
							i++
							current.consumed += markdown[i]
						}
					}

					if (feature.single) {
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

	constructor(
		public parent?: Element,
		public feature?: Feature
	) {
		if (!this.feature || this.feature.block) {
			this.end = true
		}
	}

	moveTo(name: string) {
		const parent = this.findParent(name)

		if (parent) {
			this.parent.content = this.parent.content.filter((child) => child !== this)
			parent.content.unshift(this)
		}
	}

	findParent(name: string) {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		let current: Element = this

		while (current && current.feature?.name !== name) {
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

		if (this.feature?.trim && !this.content.length) {
			return ''
		}

		let html = ''
		let tag = ''

		if (this.feature) {
			if (this.feature.end == '\n' || this.feature.multiline) {
				html += '\n'
			}

			tag = this.feature.tag
			if (this.feature.line) {
				tag = tag.replace('$', (this.consumed.length + 1).toString())
			}

			html += `<${tag}`

			if (this.feature.class) {
				html += ` class="${this.feature.class}"`
			}

			html += '>'
		}

		if (this.content.length) {
			const contentHtml = this.content.join('')

			if (this.feature?.trim && !contentHtml.trim()) {
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

			if (this.feature.end == '\n' || this.feature.start == '\n' || this.feature.multiline) {
				html += '\n'
			}
		}

		return html
	}

	toString() {
		return this.toHtml()
	}
}
