import { Element } from './parser'

export class Feature {
	class?: string
	void?: boolean
	multiline?: boolean
	parent?: string
	block?: boolean
	child?: string
	textContainer?: string
	target?: string[]
	append?: (element: Element) => string

	constructor(
		public name: string,
		public tag: string,
		public start: string,
		public end?: string
	) {}

	setup(options: Partial<Feature>) {
		Object.assign(this, options)
	}

	line() {
		return this.end === '\n'
	}

	scan(markdown: string, parent?: Feature): string {
		if (this.parent && parent?.name !== this.parent) {
			return ''
		}

		if (this.line()) {
			let start = '\n' + this.start
			if (markdown.startsWith(start)) {
				return start
			}

			start = '\n\n' + this.start
			if (markdown.startsWith(start)) {
				return start
			}

			return ''
		}

		if (markdown.startsWith(this.start)) {
			return this.start
		}

		return ''
	}

	stop(char: string) {
		return char === '\n' && !this.multiline && !this.line() && !this.block
	}

	consumeEnd() {
		return !this.line() && !this.multiline && !this.block
	}

	consumeStart() {
		return this.line() || this.block
	}
}

export class TextFeature {
	constructor(
		public name: string,
		public regexp: RegExp,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		public replace: string | ((substring: string, ...args: any[]) => string)
	) {}

	process(text: string) {
		return text.replace(this.regexp, this.replace as string)
	}
}
