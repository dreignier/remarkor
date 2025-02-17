import Parser from './parser'

export default class Remarkor {
	private parser = new Parser()

	makeHtml(markdown: string): string {
		return this.parser.parse(markdown)
	}
}
