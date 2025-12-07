const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const iconSvgPath = path.join(__dirname, '../public/icon.svg');
const publicDir = path.join(__dirname, '../public');
const appDir = path.join(__dirname, '../app');

async function generateIcons() {
  try {
    // Read the SVG
    const svgBuffer = fs.readFileSync(iconSvgPath);
    
    // Generate favicon.ico (16x16 and 32x32)
    console.log('Generating favicon.ico...');
    const favicon16 = await sharp(svgBuffer)
      .resize(16, 16, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toBuffer();
    
    const favicon32 = await sharp(svgBuffer)
      .resize(32, 32, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toBuffer();
    
    // For ICO format, we'll create a multi-size PNG and save as favicon.ico
    // Note: sharp doesn't support ICO directly, so we'll save as PNG and rename
    // Most modern browsers accept PNG for favicon
    fs.writeFileSync(path.join(publicDir, 'favicon.ico'), favicon32);
    fs.writeFileSync(path.join(appDir, 'favicon.ico'), favicon32);
    
    // Generate icon.png (512x512 for Next.js app directory)
    console.log('Generating icon.png (512x512)...');
    const icon512 = await sharp(svgBuffer)
      .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toBuffer();
    fs.writeFileSync(path.join(appDir, 'icon.png'), icon512);
    
    // Generate apple-icon.png (180x180)
    console.log('Generating apple-icon.png (180x180)...');
    const appleIcon = await sharp(svgBuffer)
      .resize(180, 180, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toBuffer();
    fs.writeFileSync(path.join(appDir, 'apple-icon.png'), appleIcon);
    
    // Generate additional sizes for public folder
    console.log('Generating additional icon sizes...');
    const sizes = [16, 32, 96, 192, 512];
    for (const size of sizes) {
      const icon = await sharp(svgBuffer)
        .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
        .png()
        .toBuffer();
      fs.writeFileSync(path.join(publicDir, `icon-${size}x${size}.png`), icon);
    }
    
    console.log('✅ All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
