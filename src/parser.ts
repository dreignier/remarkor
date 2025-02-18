import { Feature, features } from './features'

export default class Parser {
	parse(markdown: string) {
		if (!markdown) {
			return ''
		}

		markdown = this.sanitize(markdown)

		const root = new Element()
		let current = root

		for (let i = 0; i < markdown.length; ) {
			if (markdown[i] === '\n' && current.feature && !current.feature.multiline && !current.feature.line) {
				current = current.parent
			}

			const segment = markdown.slice(i)

			if (current.feature?.end && segment.startsWith(current.feature.end)) {
				if (!current.feature.line && !current.feature.multiline) {
					i += current.feature.end.length
				}

				current.end = true
				current = current.parent
			} else {
				const feature = features.find((feature) => segment.startsWith(feature.start) && (!feature.parent || current.feature?.tag === feature.parent))

				if (feature) {
					i += feature.start.length
					current = current.addChild(feature)

					if (feature.consumes) {
						while (markdown[i] && feature.consumes.includes(markdown[i])) {
							i++
							current.consumed += markdown[i]
						}
					}

					if (feature.single) {
						current.end = true
						current = current.parent
					}
				} else {
					current.addText(markdown[i++])
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

class Element {
	content: (Element | string)[] = []
	end = false
	consumed = ''

	constructor(
		public parent?: Element,
		public feature?: Feature
	) {
		if (!this.feature) {
			this.end = true
		}
	}

	addChild(feature?: Feature) {
		const child = new Element(this, feature)
		this.content.push(child)

		return child
	}

	addText(text: string) {
		if (this.content.length && typeof this.content[this.content.length - 1] === 'string') {
			this.content[this.content.length - 1] += text
		} else {
			this.content.push(text)
		}
	}

	toHtml() {
		if (this.feature?.html) {
			return this.feature.html
		}

		if (!this.end || (this.feature?.void && this.content.length)) {
			return this.feature.start + this.consumed + this.content.join('')
		}

		let html = ''
		let tag = ''

		if (this.feature) {
			if (this.feature.end == '\n' || this.feature.multiline) {
				html += '\n'
			}

			tag = this.feature.tag
			if (this.feature.consumes) {
				tag = tag.replace('$', (this.consumed.length + 1).toString())
			}

			html += `<${tag}>`
		}

		if (this.content.length) {
			html += this.content.join('')
		}

		if (this.feature) {
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
