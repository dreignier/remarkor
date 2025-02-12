import { Converter } from 'showdown'
import Options, { RemarkorOptions } from './options'

export default class Remarkor {
	private options: Options
	private converter: Converter

	constructor(options: RemarkorOptions = {}) {
		this.options = new Options(options)
		this.converter = new Converter(this.options.showdownOptions())
	}

	makeHtml(markdown: string): string {
		return this.converter.makeHtml(markdown)
	}
}
