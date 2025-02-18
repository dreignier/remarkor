import { Command } from 'commander'
import { watchFile } from 'fs'
import Remarkor from './remarkor'

let file = ''

const program = new Command()

program
	.argument('<file>', 'File to compile')
	.option('-o, --output <dir>', 'Output file')
	.option('-s, --stdout', 'Output to stdout')
	.option('-w, --watch', 'Watch mode')
	.option('-t, --theme <theme>', 'Theme to use')
	.action((f) => (file = f))
program.parse()

const { output, stdout, watch, theme } = program.opts()

async function readAndWrite(remarkor: Remarkor) {
	const html = await remarkor.remark(file, output || file.replace(/\.md$/, ''), theme)

	if (stdout) {
		console.log(html)
	}
}

async function main() {
	const remarkor = new Remarkor()
	await readAndWrite(remarkor)

	if (watch) {
		watchFile(file, () => readAndWrite(remarkor))
	}
}

main()
