
const Gif = require('./index')

// const gif = new Gif({
//   input: './images/test.gif',
//   output: './images/frame-%d.png'
// })

// gif.decode()

const gif = new Gif({
  input: './images/frame-?.png',
  output: './images/frame.gif',
  width: 440,
  height: 231
})

gif.encode().then(() => {
  console.log('合成Gif成功')
}).catch(err => {
  console.log(err)
})