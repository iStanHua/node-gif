'use strict'

const fs = require('fs')
const path = require('path')
const pify = require('pify')
const pump = require('pump-promise')
const getPixels = pify(require('get-pixels'))
const savePixels = require('save-pixels')

const supportedFormats = new Set(['jpg', 'png', 'gif'])

class Gif {
  constructor(options) {
    const { input, output, coalesce = true } = options

    this.input = input
    this.output = output
    this.coalesce = coalesce
    this.format = output ? path.extname(output).substr(1) : undefined

    if (format && !supportedFormats.has(format)) {
      throw new Error(`invalid output format "${format}"`)
    }

  }

  /**
   * Gif decoding (extracting gif frames)
   */
  async decode() {
    const results = await getPixels(this.input)
    const { shape } = results
    const format = output
      ? path.extname(output).substr(1)
      : undefined

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
          await this.saveFrame(results.pick(i), output.replace('%d', i))
        }
      }
    } else if (output) {
      // non-animated gif with a single frame
      await this.saveFrame(results, output.replace('%d', 0))
    }

    return results
  }

  /**
   * Save frame
   * @param {Buffer} data
   * @param {String} filename
   */
  saveFrame(data, filename) {
    const stream = savePixels(data, this.format)
    return pump(stream, fs.createWriteStream(filename))
  }
}

module.exports = Gif