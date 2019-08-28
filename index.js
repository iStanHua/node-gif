'use strict'

const fs = require('fs')
const path = require('path')
const pify = require('pify')
const pump = require('pump-promise')
const getPixels = pify(require('get-pixels'))
const savePixels = require('save-pixels')

const GIFEncoder = require('gifencoder')
const pngFileStream = require('png-file-stream')


class Gif {
  constructor(options) {
    this.options = options
  }

  /**
   * Gif decoding (extracting the frame image of gif)
   * @param {String} input     Path to a GIF file
   * @param {String} output    Optional frame pattern if you want to write each frame to disk. Should contain a %d that will be replaced with the frame number (starting at 0).
   * @param {Boolean} coalesce Whether or not to perform inter-frame coalescing.
   */
  async decode() {
    const { input, output, coalesce = true } = this.options

    const format = output ? path.extname(output).substr(1) : undefined

    const supportedFormats = new Set(['jpg', 'png', 'gif'])

    if (format && !supportedFormats.has(format)) {
      throw new Error(`invalid output format "${format}"`)
    }

    const results = await getPixels(input)
    const { shape } = results

    if (shape.length === 4) {
      // animated gif with multiple frames
      const [frames, width, height, channels] = shape

      const numPixelsInFrame = width * height

      for (let i = 0; i < frames; ++i) {
        if (i > 0 && coalesce) {
          const currIndex = results.index(i, 0, 0, 0)
          const prevIndex = results.index(i - 1, 0, 0, 0)

          for (let j = 0; j < numPixelsInFrame; ++j) {
            const curr = currIndex + j * channels

            if (results.data[curr + channels - 1] === 0) {
              const prev = prevIndex + j * channels

              for (let k = 0; k < channels; ++k) {
                results.data[curr + k] = results.data[prev + k]
              }
            }
          }
        }

        if (output) {
          await this.saveFrame(results.pick(i), format, output.replace('%d', i))
        }
      }
    } else if (output) {
      // non-animated gif with a single frame
      await this.saveFrame(results, format, output.replace('%d', 0))
    }

    return results
  }

  /**
   * Save frame
   * @param {Buffer} data
   * @param {String} format
   * @param {String} filename
   */
  saveFrame(data, format, filename) {
    const stream = savePixels(data, format)
    return pump(stream, fs.createWriteStream(filename))
  }

  /**
   * Gif encoding
   * @param {String} input    image path(frame?.png)
   * @param {String} output   save GIF path
   * @param {Number} width
   * @param {Number} height
   * @param {Number} repeat
   * @param {Number} delay
   * @param {Number} quality
   */
  async encode() {
    const { input, output, width = 300, height = 200, repeat = 0, delay = 250, quality = 80 } = this.options

    const format = input ? path.extname(input).substr(1) : undefined

    const encoder = new GIFEncoder(width, height)

    if (format === 'png') {
      const stream = pngFileStream(input)
        .pipe(encoder.createWriteStream({ repeat, delay, quality }))
        .pipe(fs.createWriteStream(output))

      return await new Promise((resolve, reject) => {
        stream.on('finish', resolve)
        stream.on('error', reject)
      })
    }
  }
}

module.exports = Gif