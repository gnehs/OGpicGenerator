const fs = require('fs');
const Trianglify = require('trianglify'); // trianglify
const sharp = require('sharp'); // https://github.com/lovell/sharp

if (process.argv.length < 3) {
    console.log('🔢 請輸入一個數字');
    console.log('範例: node index.js 5');
    return;
}


function generateOGImage() {
    var bg = getBackground()
    var mask = getMask()
    sharp(bg)
        .overlayWith(mask)
        .png()
        .toFile('./ogimage/ogimg_' + Math.random().toString(36).substr(2) + '.png')
        .catch(err => generateOGImage(err))
}

function getBackground(width = 1400, height = 756) {
    var background = Trianglify({
        width: width,
        height: height,
        stroke_width: Math.floor(Math.random() * 60) + 40,
        cell_size: Math.floor(Math.random() * 40) + 30,
    }).png();
    var data = background.substr(background.indexOf('base64') + 7);
    var bg = new Buffer(data, 'base64');
    return bg
}


function getMask(ddr = './mask/') {
    var files = fs.readdirSync(ddr);
    var imgnum = Math.floor(Math.random() * files.length)
    var img = ddr + files[imgnum]
    return img
}
console.log('🍆 正在產生 %s 張圖片', process.argv[2])
for (var i = 0; i < process.argv[2]; i++) {
    generateOGImage()
    console.log('✔️ 已產生 %s 張圖片', i + 1)
}
console.log('😄 全部圖片產生完畢')