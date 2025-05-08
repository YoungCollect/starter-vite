const picocolors = require('picocolors')

class Tips {
  constructor() {
    this.tipsMap = {
      success: {
        prefix: '[Pino tip]',
        icon: '✨️',
        color: picocolors.green
      },
      warn: {
        prefix: '[Pino warn]',
        icon: '🫠 ',
        color: picocolors.yellow
      },
      error: {
        prefix: '[Pino error]',
        icon: '🚧',
        color: picocolors.red
      },
      info: {
        prefix: '[Pino info]',
        icon: '💬',
        color: picocolors.blue
      },
      debug: {
        prefix: '[Pino debug]',
        icon: '🔍',
        color: picocolors.gray
      },
      step: {
        prefix: '[Pino step]',
        icon: '🦶',
        color: picocolors.cyan
      }
    }

    this.reg = /^\n+/

    Object.keys(this.tipsMap).forEach(type => {
      this[type] = (message, options) => {
        return this.logMessage(message, {
          type,
          ...options
        })
      }
    })
  }

  pure(message, options) {
    return this.logMessage(message, options)
  }

  processMessage(message) {
    if (message.match) {
      const newlines = message.match(this.reg)?.[0] || ''
      const msg = message.replace(this.reg, '')
      return { newlines, msg }
    }
    return { newlines: '', msg: message }
  }

  /**
   * @param {string} message
   * @param {object} options
   * @param {string} options.type - The type of the message
   * @param {boolean} options.log - Whether to log the message
   * @param {string} options.color - The color of the message
   * @returns {string}
   */
  logMessage(message, options = {}) {
    const { type, log = true, prefix = false } = options
    const { newlines, msg } = this.processMessage(message)
    let result
    if (type) {
      const tips = this.tipsMap[type]
      result =
        newlines +
        tips.color(`${tips.icon}${prefix ? tips.prefix + ' ' : ''}${msg}`)
    } else {
      const { color = 'cyan' } = options
      result = newlines + picocolors[color](msg)
    }
    if (log) {
      console.log(result)
    }
    return result
  }
}

const tips = new Tips()

module.exports = tips
