// 获取 canvas 元素
const canvas = document.getElementById("myCanvas");

// 初始化 WebGL 上下文
const gl = canvas.getContext("webgl");
if (!gl) {
  console.error(
    "Unable to initialize WebGL. Your browser or machine may not support it."
  );
  // return;
}

// 配置 WebGL 渲染上下文
gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.2, 0.3, 0.3, 1.0);

// 加载着色器
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  console.error(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

// 创建着色器程序
function createProgram(gl, vertexShaderSource, fragmentShaderSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = loadShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  );

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(
      "Unable to initialize the shader program: " +
        gl.getProgramInfoLog(program)
    );
    return null;
  }

  return program;
}

// 定义顶点着色器和片段着色器的源码
const vertexShaderSource = `
attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texCoord = a_texCoord;
}
`;

const fragmentShaderSource = `
precision mediump float;
uniform sampler2D u_image;
varying vec2 v_texCoord;
void main() {
    gl_FragColor = texture2D(u_image, v_texCoord);
}
`;

// 创建 WebGL 程序
const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
gl.useProgram(program);

// 设置顶点数据
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(
  gl.ARRAY_BUFFER,
  new Float32Array([-1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, -1.0]),
  gl.STATIC_DRAW
);

const texCoordBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
gl.bufferData(
  gl.ARRAY_BUFFER,
  new Float32Array([0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0]),
  gl.STATIC_DRAW
);

// 设置顶点属性
const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
gl.enableVertexAttribArray(positionAttributeLocation);
gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

const texCoordAttributeLocation = gl.getAttribLocation(program, "a_texCoord");
gl.enableVertexAttribArray(texCoordAttributeLocation);
gl.vertexAttribPointer(texCoordAttributeLocation, 2, gl.FLOAT, false, 0, 0);

// 加载纹理
function loadTexture(gl, url) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // 设置纹理参数
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  const level = 0;
  const internalFormat = gl.RGBA;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const border = 0;

  const image = new Image();
  image.onload = function () {
    // gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      level,
      internalFormat,
      srcFormat,
      srcType,
      image
    );
    // gl.generateMipmap(gl.TEXTURE_2D);
  };
  image.src = url;

  return texture;
}

const texture = loadTexture(gl, "./texture.jpeg");

// 获取纹理单元位置
const textureUniformLocation = gl.getUniformLocation(program, "u_image");

// 清除颜色缓冲区
gl.clear(gl.COLOR_BUFFER_BIT);

// 绘制纹理
function draw() {
  gl.useProgram(program);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.uniform1i(textureUniformLocation, 0);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  requestAnimationFrame(draw);
}

draw();
