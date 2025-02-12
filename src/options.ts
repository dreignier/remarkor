import { defaultsDeep } from 'lodash'
import { ShowdownOptions } from 'showdown'

export type RemarkorOptions = ShowdownOptions & {}

export default class Options {
	constructor(private options: RemarkorOptions) {
		this.options = defaultsDeep(options, {
			parseImgDimensions: true,
			literalMidWordUnderscores: true,
			literalMidWordAsterisks: true,
			strikethrough: true,
			tables: true,
			tasklists: true,
			simpleLineBreaks: true,
			requireSpaceBeforeHeadingText: true,
			backslashEscapesHTMLTags: true,
			emoji: true,
			underline: true,
			noHeaderId: true,
			metadata: true
		})
	}

	showdownOptions(): ShowdownOptions {
		return this.options
	}
}
