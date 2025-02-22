import { cp, mkdir, readFile, writeFile } from 'fs/promises'
import Parser from './parser'

export default class Remarkor {
	private parser = new Parser()

	async remark(input: string, output: string, theme?: string) {
		if (!theme) {
			theme = 'default'
		}

		const markdown = await readFile(input, 'utf-8')
		let html = this.parser.parse(markdown)

		const template = await readFile(__dirname + '/assets/template.html', 'utf-8')
		html = template.replace('$html', html).replace(/\$theme/g, theme || 'none')

		// Make sure the output directory is empty
		await mkdir(output, { recursive: true })

		await writeFile(output + '/index.html', html)
		await cp(__dirname + '/assets/static', output, { recursive: true })
		await cp(__dirname + `/assets/themes/${theme}`, output, { recursive: true })

		return html
	}
}
