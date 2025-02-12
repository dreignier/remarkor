import { Command } from 'commander'
import { watchFile } from 'fs'
import { readFile, writeFile } from 'fs/promises'
import Remarkor from './remarkor'

let file = ''

const program = new Command()

program
	.argument('<file>', 'File to compile')
	.option('-o, --output <file>', 'Output file')
	.option('-s, --stdout', 'Output to stdout')
	.option('-w, --watch', 'Watch mode')
	.action((f) => (file = f))
program.parse()

const { output, stdout, watch } = program.opts()

async function readAndWrite(remarkor: Remarkor) {
	const markdown = await readFile(file, 'utf-8')
	const html = remarkor.makeHtml(markdown)

	if (stdout) {
		console.log(html)
	}

	await writeFile(output || file.replace(/\.md$/, '.html'), html)
}

async function main() {
	const remarkor = new Remarkor()
	await readAndWrite(remarkor)

	if (watch) {
		watchFile(file, () => readAndWrite(remarkor))
	}
}

main()
