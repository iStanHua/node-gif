'use strict'

const fs = require('fs')
const path = require('path')
const { execFile } = require('child_process')
const gifsicle = require('gifsicle')

module.exports = class Gifsicle {
  constructor(options) {
    this.options = options
  }


  /**
   * Merge gif pictures from multiple pictures
   * @param {Array} images    image list
   * @param {String} output   output gif
   * @param {Number} delay    delay
   * @param {Number} loop     loop
   */
  static async merge(images, output, delay = 0, loop = 0) {
    if (!Array.isArray(images)) return
    if (!output) return
    if (output.lastIndexOf('.gif') === -1) return

    const args = []
    if (delay) args.push(`-d ${delay}`)
    if (loop) args.push(`--loop=${loop}`)
    args.push(images.join(' '))
    args.push(`${output}`)

    return new Promise(async (resolve, reject) => {
      console.log('cmd:' + args.join(' '))
      execFile(gifsicle, args, (error, stdout, stderr) => {
        console.log(`error: ${error}`);
        if (error) {
          reject(error)
          throw error
        }

        resolve(stdout)

        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
      })

    })
  }
}