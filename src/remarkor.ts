import { cp, mkdir, readFile, rm, writeFile } from 'fs/promises'
import Parser from './parser'

export default class Remarkor {
	private parser = new Parser()

	async remark(input: string, output: string, theme?: string) {
		const markdown = await readFile(input, 'utf-8')
		let html = this.parser.parse(markdown)

		const template = await readFile(__dirname + '/assets/template.html', 'utf-8')
		html = template.replace('$html', html).replace(/\$theme/g, theme || 'none')

		// Make sure the output directory is empty
		await rm(output, { recursive: true, force: true })
		await mkdir(output, { recursive: true })

		await writeFile(output + '/index.html', html)
		await cp(__dirname + '/assets/static', output, { recursive: true })

		if (theme) {
			await cp(__dirname + `/assets/themes/${theme}.css`, output + `/${theme}.css`)
			await cp(__dirname + `/assets/themes/${theme}.css.map`, output + `/${theme}.css.map`)
		}

		return html
	}
}
