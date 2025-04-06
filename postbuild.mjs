import fs from 'fs'
import path from 'path'
import glob from 'fast-glob'

const distDir = path.resolve('./dist')

const files = await glob('**/*.js', { cwd: distDir, absolute: true })

for (const file of files) {
  let content = await fs.promises.readFile(file, 'utf8')

  // Add `.js` to relative imports that don't already have an extension
  content = content.replace(
    /from\s+['"](\..*?)(?<!\.js)['"]/g,
    (match, p1) => `from '${p1}.js'`
  )

  await fs.promises.writeFile(file, content, 'utf8')
}
