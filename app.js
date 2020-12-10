const {Canvas} = require('canvas')
const GIFEncoder = require('gifencoder')
const {createWriteStream} = require('fs')
const w = 500, h = 500
const backColor = "#BDBDBD"
const delay = 20 
class Stage {

    initCanvas(text) {
        this.canvas = new Canvas()
        this.canvas.width  = w 
        this.canvas.height = h 
        this.context = this.canvas.getContext('2d')
        this.textList = new TextList(text)
    }

    render(cb) {
        this.context.fillStyle = backColor
        this.context.fillRect(0, 0, w, h)
        this.textList.draw(this.context)
        cb(this.context)
    }

    update(cb) {
        this.textList.update(cb)        
    }
}

class TextGif {

    constructor() {
        this.encoder = new GIFEncoder(w, h)
        this.encoder.setQuality(200)
        this.encoder.setDelay(delay)
        this.encoder.setRepeat(0)
        this.started = false
        this.stage = new Stage()
        
    }

    create(fileName, text) {
        if (this.started) {
          return 
        }
        this.started = true 
        this.encoder.createReadStream().pipe(createWriteStream(fileName))
        this.stage.initCanvas(text)
        this.encoder.start()
        while (this.started) {
            this.stage.render((context) => {
                this.encoder.addFrame(context)
            })
            this.stage.update(() => {
                this.encoder.end()
                this.started = false
            })
        }
    }
}

class State {

    constructor() {
        this.scale = 0
    }

    update(cb) {
        this.scale += 0.01
        if (Math.abs(this.scale) > 1) {
            this.scale = 1
            cb()
        }
    }
}

class TextNode {

    constructor(i, text) {
        this.state = new State()
        this.i = i 
        this.textParts = text.split(" ")
        this.text = this.textParts[this.i]
        if (this.i < this.textParts.length - 1) {
            this.next = new TextNode(this.i + 1, text)
            this.next.prev = this 
        }
    }

    draw(context) {
      if (this.prev) {
          this.prev.draw(context)
      }
        const scale = this.state.scale 
        const text = this.text
        const gap =  (2 * h) / (6 * this.textParts.length) 
        context.font = `${gap}px monospace`
        context.fillStyle = '#212121'
        const textSize = context.measureText(text).width 
        const x = (w / 2 + textSize / 2) * (1 - scale)
        context.save()
        context.translate(
          w / 2 + (1 - 2 * (this.i % 2)) *  x,
          h / 3 + this.i * (2 * gap) 
        )
        context.fillText(text, -textSize / 2, -gap / 4)
        context.restore()    
    }

    update(cb) {
        this.state.update(cb)
    }
}

class TextList {

    constructor(text) {
        this.curr = new TextNode(0, text)
    }

    draw(context) {
        this.curr.draw(context)
    }

    update(cb) {
        this.curr.update(() => {
            this.curr = this.curr.next 
            if (!this.curr) {
                cb()
            }
        })
    }
}

class InputProcessor {
    start(cb) {
        console.log("enter words")
        process.stdin.resume()
        let msg = ""
        process.stdin.on('data', (data) => {
            const str = data.toString().replace('\n', '').trim()
            if (str === 'QUIT') {
                process.stdin.pause()
                console.log("creating gif", msg)
                cb(msg)
            }
            if (msg === '') {
                msg = str 
            } else {
                msg = `${msg} ${str}`
            }
        })
    }
}

const inputProcessor = new InputProcessor()
inputProcessor.start((text) => {
    const textGif = new TextGif()
    textGif.create('aa.gif', text)
})

