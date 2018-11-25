const fs = require('fs');
const Trianglify = require('trianglify'); // trianglify
const sharp = require('sharp'); // https://github.com/lovell/sharp http://sharp.pixelplumbing.com/en/stable/api-input
const config = require('./config.json')
// toUnixTime
Date.prototype.toUnixTime = function () {
    return this.getTime() / 1000 | 0
};
// generateImage
async function generateImage(imgConfig) {

    let inputFolder = imgConfig.input.endsWith("/") ? imgConfig.input : imgConfig.input + '/'
    let outputFolder = imgConfig.output.endsWith("/") ? imgConfig.output : imgConfig.output + '/'

    let mask = getMask(inputFolder)
    let maskInfo = await sharp(mask.fileUrl).metadata()

    let bg = await getBackground({
        width: maskInfo.width,
        height: maskInfo.height
    })(imgConfig.bgMethod)

    let genfilename = filename =>
        filename
        .replace(/{{mask}}/g, mask.filename)
        .replace(/{{randomstr}}/g, Math.random().toString(36).substr(2))
        .replace(/{{unixtime}}/g, new Date().toUnixTime())

    let imgfilename = outputFolder + genfilename(imgConfig.filename)

    sharp(bg)
        .overlayWith(mask.fileUrl)
        .png()
        .toFile(imgfilename)
        .catch(err => generateImage(imgConfig, err))

}

function getBackground({
    width = 1400,
    height = 756
}) {
    let randomcolor = () => `rgb(${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)})`
    return async function (method = "trianglify") {
        switch (method) {
            case "trianglify":
                let background = Trianglify({
                    width: width,
                    height: height,
                    stroke_width: Math.floor(Math.random() * 30) + 30,
                    cell_size: Math.floor(Math.random() * 10) + 45,
                }).png();
                let data = background.substr(background.indexOf('base64') + 7);
                return Buffer.from(data, 'base64');
            case "randomcolor":
                return (await Buffer.from(`<svg><rect x="0" y="0" width="${width}" height="${height}" fill="${randomcolor()}"></rect></svg>`))
        }
    };
}


function getMask(ddr) {
    let files = fs.readdirSync(ddr).filter(x => !x.match(/^\._/))
    let imgnum = Math.floor(Math.random() * files.length)
    return {
        fileUrl: (ddr + files[imgnum]),
        filename: files[imgnum]
    }
}

for (const imgConfig of config) {
    console.log('🍆 正在使用「%s」設定檔產生 %s 張圖片', imgConfig.name, imgConfig.qty)
    for (var i = 0; i < imgConfig.qty; i++) {
        generateImage(imgConfig)
    }
}
console.log('😄 全部圖片產生完畢')