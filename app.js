const {Canvas} = require('canvas')
const GIFEncoder = require('gifencoder')
const {createWriteStream} = require('fs')
const w = 500, h = 500
const backColor = "#BDBDBD"
const delay = 20 
const text = "I code dreams into Reality"
const textParts = text.split(" ")
class Stage {

    initCanvas() {
        this.canvas = new Canvas()
        this.canvas.width  = w 
        this.canvas.height = h 
        this.context = this.canvas.getContext('2d')
        this.textList = new TextList()
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
        this.stage.initCanvas()
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
        this.scale += 0.01
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
        if (this.i < textParts.length - 1) {
            this.next = new TextNode(this.i + 1)
            this.next.prev = this 
        }
    }

    draw(context) {
      if (this.prev) {
          this.prev.draw(context)
      }
        const scale = this.state.scale 
        const text = textParts[this.i]
        const gap =  (2 * h) / (6 * textParts.length) 
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
        console.log("Rendering", text)
    }

    update(cb) {
        this.state.update(cb)
    }
}

class TextList {

    constructor() {
        this.curr = new TextNode(0)
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

const textGif = new TextGif()
textGif.create('aa.gif')