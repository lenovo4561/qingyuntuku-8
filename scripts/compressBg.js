const sharp = require('sharp')
const path = require('path')
const fs = require('fs')

// 需要压缩的图片列表（超过一定大小的图片）
const imagesToCompress = [
  'banner-1.png',
  'banner-2.png',
  'banner-3.png',
  'loading-bg.png',
  'loading-icon.png',
  'top-bg-2.png',
  'top-bg.png',
  'wode-bg.png',
  'remen.png',
  'remen-1.png',
  'new-1.png'
]

const imgDir = path.join(__dirname, '../src/pkg/assets/img')

async function compressImages() {
  for (const imageName of imagesToCompress) {
    const imagePath = path.join(imgDir, imageName)

    if (!fs.existsSync(imagePath)) {
      console.log(`跳过不存在的文件: ${imageName}`)
      continue
    }

    try {
      const originalStats = fs.statSync(imagePath)
      const originalSizeKB = (originalStats.size / 1024).toFixed(2)
      console.log(`\n处理: ${imageName}`)
      console.log(`原始文件大小: ${originalSizeKB} KB`)

      const image = sharp(imagePath)
      const metadata = await image.metadata()
      console.log(`图片尺寸: ${metadata.width}x${metadata.height}`)

      // 根据图片大小决定压缩策略
      let resizeWidth = metadata.width
      let resizeHeight = metadata.height

      // 如果图片很大，缩小尺寸
      if (originalStats.size > 50 * 1024) {
        // 超过50KB
        resizeWidth = Math.round(metadata.width * 0.7)
        resizeHeight = Math.round(metadata.height * 0.7)
      }

      await image
        .resize(resizeWidth, resizeHeight, {
          fit: 'cover'
        })
        .png({
          compressionLevel: 9,
          quality: 80,
          palette: true
        })
        .toFile(imagePath + '.tmp')

      fs.unlinkSync(imagePath)
      fs.renameSync(imagePath + '.tmp', imagePath)

      const compressedStats = fs.statSync(imagePath)
      const compressedSizeKB = (compressedStats.size / 1024).toFixed(2)
      const compressionRate = (
        (1 - compressedStats.size / originalStats.size) *
        100
      ).toFixed(2)

      console.log(`压缩后文件大小: ${compressedSizeKB} KB`)
      console.log(`新尺寸: ${resizeWidth}x${resizeHeight}`)
      console.log(`压缩率: ${compressionRate}%`)
    } catch (error) {
      console.error(`压缩 ${imageName} 失败:`, error.message)
    }
  }

  console.log('\n所有图片压缩完成!')
}

compressImages()
