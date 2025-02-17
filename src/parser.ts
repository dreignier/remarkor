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
			const segment = markdown.slice(i)

			if (current.feature?.end && segment.startsWith(current.feature.end)) {
				i += current.feature.end.length
				current = current.parent
			} else {
				const feature = features.find((feature) => segment.startsWith(feature.start))

				if (feature) {
					i += feature.start.length
					current = current.addChild(feature)
				} else {
					current.addText(markdown[i++])
				}
			}
		}

		return root.toString().trim()
	}

	sanitize(markdown: string) {
		if (markdown[0] !== '\n') {
			markdown = '\n' + markdown
		}

		if (markdown[markdown.length - 1] !== '\n') {
			markdown += '\n'
		}

		return markdown
			.replace(/\r/g, '')
			.replace('\t', '    ')
			.replace(/ +\n +/g, '\n')
			.replace(/\n\n+/g, '\n\n')
			.replace('  +', ' ')
	}
}

class Element {
	content: (Element | string)[] = []

	constructor(
		public parent?: Element,
		public feature?: Feature
	) {}

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
		let html = ''

		if (this.feature) {
			if (this.feature.before) {
				html += this.feature.before
			}

			html += `<${this.feature.tag}>`
		}

		const content = this.content.join('')
		html += this.feature?.trim ? content.trim() : content

		if (this.feature) {
			html += `</${this.feature.tag}>`

			if (this.feature.after) {
				html += this.feature.after
			}
		}

		return html
	}

	toString() {
		return this.toHtml()
	}
}
