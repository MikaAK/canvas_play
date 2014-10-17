var Graphics = {
  gl: null,
  canvas: null,
  projectionMatrix: null,
  modelViewMatrix: null,
  shaderProgram: null,
  shaderModelViewMatrixUniform: null,
  shaderProjectionMatrixUniform: null,
  shaderVertexPositionAttribute: null,
  vertexShaderSource: "    attribute vec3 vertexPos;\n" +
		"    uniform mat4 modelViewMatrix;\n" +
		"    uniform mat4 projectionMatrix;\n" +
		"    void main(void) {\n" +
		"		// Return the transformed and projected vertex value\n" +
		"        gl_Position = projectionMatrix * modelViewMatrix * \n" +
		"            vec4(vertexPos, 1.0);\n" +
		"    }\n",
  fragmentShaderSource: "    void main(void) {\n" +
		"    // Return the pixel color: always output white\n" +
        "    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);\n" +
    	"}\n",

  initWebGL: function() {
    var msg = "Your browser does not support WebGL, " +
      "or it is not enabled by default."

    try {
      this.gl = this.canvas.getContext("experimental-webgl")
    } catch (e) {
      msg = "Error creating WebGL Context!: " + e.toString()
    }

    if (!this.gl) {
      alert(msg)
      throw new Error(msg)
    }
    debugger
  },

  initViewport: function() {
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height)
  },

  initMatrices: function() {
    this.modelViewMatrix = mat4.create()
    mat4.translate(this.modelViewMatrix, this.modelViewMatrix, [0, 0, -3.333])

    this.projectionMatrix = mat4.create()
    mat4.perspective(this.projectionMatrix, Math.PI / 4, this.canvas.width / this.canvas.height, 1, 10000)
  },

  createSquare: function() {
    var vertexBuffer = this.gl.createBuffer(),
        verts = [
           .5,  .5,  0.0,
          -.5,  .5,  0.0,
           .5, -.5,  0.0,
          -.5, -.5,  0.0
        ]

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer)
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(verts), this.gl.STATIC_DRAW)
    return {
      buffer: vertexBuffer,
      vertSize: 3,
      nVerts: 4,
      primtype: this.gl.TRIANGLE_STRIP
    }
  },

  createShader: function(str, type) {
    var shader
    if (type == "fragment") {
        shader = this.gl.createShader(this.gl.FRAGMENT_SHADER)
    } else if (type == "vertex") {
        shader = this.gl.createShader(this.gl.VERTEX_SHADER)
    } else {
        return null
    }

    this.gl.shaderSource(shader, str)
    this.gl.compileShader(shader)

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
        alert(this.gl.getShaderInfoLog(shader))
        return null
    }

    return shader
  },

  initShader: function() {
    debugger
    var fragmentShader = this.createShader(this.fragmentShaderSource, "fragment")
    var vertexShader = this.createShader(this.vertexShaderSource, "vertex")

    // link them together into a new program
    this.shaderProgram = this.gl.createProgram()
    this.gl.attachShader(this.shaderProgram, vertexShader)
    this.gl.attachShader(this.shaderProgram, fragmentShader)
    this.gl.linkProgram(this.shaderProgram)

    // get pointers to the shader params
    this.shaderVertexPositionAttribute = this.gl.getAttribLocation(this.shaderProgram, "vertexPos")
    this.gl.enableVertexAttribArray(this.shaderVertexPositionAttribute)

    this.shaderProjectionMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, "projectionMatrix")
    this.shaderModelViewMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, "modelViewMatrix")


    if (!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS)) {
        alert("Could not initialise shaders")
    }
  },


  draw: function(obj) {
   // clear the background (with black)
   this.gl.clearColor(0.0, 0.0, 0.0, 1.0)
   this.gl.clear(this.gl.COLOR_BUFFER_BIT)

   // set the shader to use
   this.gl.useProgram(this.shaderProgram)

 // connect up the shader parameters: vertex position and projection/model matrices
   // set the vertex buffer to be drawn
   this.gl.bindBuffer(this.gl.ARRAY_BUFFER, obj.buffer)
   this.gl.vertexAttribPointer(this.shaderVertexPositionAttribute, obj.vertSize, this.gl.FLOAT, false, 0, 0)
   this.gl.uniformMatrix4fv(this.shaderProjectionMatrixUniform, false, this.projectionMatrix)
   this.gl.uniformMatrix4fv(this.shaderModelViewMatrixUniform, false, this.modelViewMatrix)

   // draw the object
   this.gl.drawArrays(obj.primtype, 0, obj.nVerts)
  },

  start: function(canvas) {
    this.canvas = canvas
    this.initWebGL()
    this.initViewport()
    this.initMatrices()

    var square = this.createSquare()

    this.initShader()
    this.draw(square)
  }
}

var main = function() {
  var canvas = document.getElementById("glcanvas")
  Graphics.start(canvas)
}
window.addEventListener("load", main)
