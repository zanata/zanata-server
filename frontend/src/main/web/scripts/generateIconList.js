var fs = require('fs')
var iconsSrc = './src/components/Icons/svgs'
var iconsFileName = './src/components/Icon/list.js'
var svgFileRegex = /Icon-(.*).svg/g

fs.readdir(iconsSrc, function (err, files) {
  if (err) {
    console.error(err)
    return
  }
  const fileNames = files.map(file => {
    const fileName = svgFileRegex.exec(file)
    if (!fileName) {
      return false
    }
    return fileName[1]
  }).filter(file => file)
  const iconsFile =
    `module.exports = [${fileNames.map(file => `'${file}'`)}]`
  fs.writeFile(iconsFileName, iconsFile, (err) => {
    if (err) throw err
    console.log('Icon file list saved')
  })
})
