const GifEncoder = require('gifencoder')
const Canvas = require('canvas')
const GIFEncoder = require('gifencoder')
const {createWriteStream} = require('fs')
const w = 500, h = 500
const backColor = "#BDBDBD"
const delay = 50 

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
            })
        }
    }
}