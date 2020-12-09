const GifEncoder = require('gifencoder')
const Canvas = require('canvas')
const GIFEncoder = require('gifencoder')
const {createWriteStream} = require('fs')
const w = 500, h = 500
const backColor = "#BDBDBD"
const delay = 50 
const text = "I code dreams into Reality"
const textParts = text.split(" ")
class Stage {

    initCanvas() {
        this.canvas = new Canvas()
        this.canvas.width  = w 
        this.canvas.height = h 
        this.context = this.canvas.getContext('2d')
    }

    render(cb) {
        this.context.fillStyle = backColor
        this.context.fillRect(0, 0, w, h)
        cb(this.context)
    }

    update(cb) {
        
    }
}

class TextGif {

    constructor() {
        this.encoder = new GIFEncoder(w, h)
        this.encoder.setQuality(100)
        this.encoder.setDelay(delay)
        this.encoder.setRepeat(0)
        this.started = false
        this.stage = new Stage()
    }

    create(fileName) {
        if (this.started) {
          return 
        }
        this.started = true 
        this.encoder.createReadStream().pipe(createWriteStream(fileName))
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
        this.scale += 0.02 
        if (Math.abs(this.scale) > 1) {
            this.scale = 1
            cb()
        }
    }
}

class TextNode {

    constructor(i) {
        this.state = new State()
        this.i = i 
    }

    draw(context) {
        const scale = this.state.scale 
        const text = textParts[this.i]
        const gap =  (2 * h) / (6 * textParts) 
        context.font = this.context.font.replace(/d+/, `${gap}`)
        context.fillStyle = 'teal'
        const textSize = context.measureText(text).w 
        const x = (w / 2 + textSize / 2) * (1 - scale)
        context.save()
        context.translate(
          w / 2 + (1 - 2 * (this.i % 2)) *  x,
          h / 3 + i * (2 * gap) 
        )
        context.fillText(text, -textSize / 2, -gap / 4)
        context.restore()
    }

    update(cb) {
        this.state.update(cb)
    }
}