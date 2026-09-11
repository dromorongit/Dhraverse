import * as fs from 'fs'
import * as path from 'path'
import dotenv from 'dotenv'
dotenv.config({ path: path.join(process.cwd(), '.env') })

import { uploadVideo } from '../lib/cloudinary'

async function main() {
  const videosDir = path.join(process.cwd(), 'public', 'assets', 'videos')
  const files = [
    { name: 'marketplace.MOV', path: path.join(videosDir, 'marketplace.MOV') },
    { name: 'Homepage.MP4', path: path.join(videosDir, 'Homepage.MP4') },
  ]

  for (const file of files) {
    if (!fs.existsSync(file.path)) {
      console.error(`File not found: ${file.path}`)
      continue
    }
    const buffer = fs.readFileSync(file.path)
    const ext = path.extname(file.name).toLowerCase()
    const mimeType = ext === '.mp4' ? 'video/mp4' : ext === '.mov' ? 'video/quicktime' : 'video/webm'

    console.log(`Uploading ${file.name}...`)
    const result = await uploadVideo(buffer, 'dhream-market/videos', mimeType)
    console.log(`RESULT: ${file.name} -> ${result.url}`)
  }
}

main().catch((err) => {
  console.error('Upload failed:', err)
  process.exit(1)
})
