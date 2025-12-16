const sharp = require('sharp')
const path = require('path')
const fs = require('fs')

// 需要压缩的logo文件路径
const logoPath = path.join(__dirname, '../src/pkg/assets/img/logo.png')
const outputPath = path.join(__dirname, '../src/pkg/assets/img/logo.png')
const backupPath = path.join(__dirname, '../src/pkg/assets/img/logo_backup.png')

async function compressLogo() {
  try {
    // 获取原始文件大小
    const originalStats = fs.statSync(logoPath)
    console.log(`原始文件大小: ${(originalStats.size / 1024).toFixed(2)} KB`)

    // 备份原始文件（如果备份不存在）
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(logoPath, backupPath)
      console.log('已备份原始文件到 logo_backup.png')
    }

    // 读取原始备份文件
    const image = sharp(backupPath)
    const metadata = await image.metadata()

    console.log(`图片尺寸: ${metadata.width}x${metadata.height}`)
    console.log(`图片格式: ${metadata.format}`)

    // 快应用图标推荐尺寸为 192x192
    const targetSize = 192

    await sharp(backupPath)
      .resize(targetSize, targetSize, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png({
        compressionLevel: 9,
        quality: 80,
        palette: true,
        colors: 128
      })
      .toFile(outputPath + '.tmp')

    // 替换原文件
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath)
    }
    fs.renameSync(outputPath + '.tmp', outputPath)

    // 获取压缩后文件大小
    const compressedStats = fs.statSync(outputPath)
    console.log(
      `压缩后文件大小: ${(compressedStats.size / 1024).toFixed(2)} KB`
    )
    console.log(`新尺寸: ${targetSize}x${targetSize}`)
    console.log(
      `压缩率: ${(
        (1 - compressedStats.size / originalStats.size) *
        100
      ).toFixed(2)}%`
    )

    console.log('Logo压缩完成!')
  } catch (error) {
    console.error('压缩失败:', error)
  }
}

compressLogo()
