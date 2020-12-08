const path = require('path')

const Gif = require('./index')
const Gifsicle = require('./gifsicle')

// `node --prof require.js`
// `node --prof-process isolate-xxx-v8.log`

// const gif = new Gif({
//   input: './images/test.gif',
//   output: './images/frame-%d.png'
// })

// gif.decode()

// const gif = new Gif({
//   input: './images/frame-?.png',
//   output: './images/frame.gif',
//   width: 440,
//   height: 231
// })

// gif.encode().then(() => {
//   console.log('合成Gif成功')
// }).catch(err => {
//   console.log(err)
// })

Gifsicle.merge(['images/frame.gif', 'images/test.gif'], 'merge.gif')