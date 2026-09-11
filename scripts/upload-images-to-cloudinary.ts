import * as fs from 'fs'
import * as path from 'path'
import dotenv from 'dotenv'
dotenv.config({ path: path.join(process.cwd(), '.env') })

import { uploadImage } from '../lib/cloudinary'

async function main() {
  const imagesDir = path.join(process.cwd(), 'public', 'assets', 'images')
  const files = [
    { name: 'dhreammarket.png', path: path.join(imagesDir, 'dhreammarket.png') },
    { name: 'dhreamsellerbadge.PNG', path: path.join(imagesDir, 'dhreamsellerbadge.PNG') },
  ]

  for (const file of files) {
    if (!fs.existsSync(file.path)) {
      console.error(`File not found: ${file.path}`)
      continue
    }
    const buffer = fs.readFileSync(file.path)
    const ext = path.extname(file.name).toLowerCase()
    const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg'

    console.log(`Uploading ${file.name}...`)
    const result = await uploadImage(buffer, 'dhream-market/images', mimeType)
    console.log(`RESULT: ${file.name} -> ${result.url}`)
  }
}

main().catch((err) => {
  console.error('Upload failed:', err)
  process.exit(1)
})
