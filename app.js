const gifencoder = require('gifencoder')
const Canvas = require('canvas')
const w = 500, h = 500
const backColor = "#BDBDBD"

class Stage {

    initCanvas() {
        this.canvas = new Canvas()
        this.canvas.width  = w 
        this.canvas.height = h 
        this.context = this.canvas.getContext('2d')
    }

    render() {
        this.context.fillStyle = backColor
        this.context.fillRect(0, 0, w, h)
    }
}