const VERTEX = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

/** Fullscreen color path, the shape shader-playground's ShaderManager uses:
 *  a quad, a time uniform, and a resolution uniform. Not an audio buffer. */
export class ColorStage {
  private gl: WebGL2RenderingContext | null;
  private program: WebGLProgram | null = null;
  private quad: WebGLBuffer | null = null;
  private errorMessage: string | null = null;
  private elapsed = 0;
  private lastNow = 0;
  private mouseX = 0.5;
  private mouseY = 0.5;
  private readonly uniforms = new Map<string, number>();

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.gl = canvas.getContext('webgl2', { antialias: false, alpha: false, preserveDrawingBuffer: true });
    if (!this.gl) {
      this.errorMessage = 'WebGL2 is not available for the color stage.';
      return;
    }
    const quad = this.gl.createBuffer();
    if (!quad) {
      this.errorMessage = 'Could not create the color-stage quad.';
      return;
    }
    this.quad = quad;
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, quad);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1, -1, 1, 1, 1,
    ]), this.gl.STATIC_DRAW);
  }

  get error(): string | null {
    return this.errorMessage;
  }

  get time(): number {
    return this.elapsed;
  }

  setPointer(x: number, y: number): void {
    this.mouseX = x;
    this.mouseY = y;
  }

  setUniform(name: string, value: number): void {
    this.uniforms.set(name, value);
  }

  clearUniforms(): void {
    this.uniforms.clear();
  }

  rewind(): void {
    this.elapsed = 0;
  }

  resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(2, Math.floor(rect.width * dpr));
    const height = Math.max(2, Math.floor(rect.height * dpr));
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
  }

  compile(source: string): void {
    const gl = this.gl;
    if (!gl || !this.quad) return;
    try {
      const program = this.link(gl, source);
      if (this.program) gl.deleteProgram(this.program);
      this.program = program;
      this.errorMessage = null;
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : String(error);
    }
  }

  frame(running: boolean, now: number): void {
    const gl = this.gl;
    const program = this.program;
    if (!gl || !program || !this.quad) return;
    if (this.lastNow === 0) this.lastNow = now;
    const dt = Math.min(0.05, (now - this.lastNow) / 1000);
    this.lastNow = now;
    if (running) this.elapsed += dt;

    this.resize();
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.useProgram(program);
    gl.uniform1f(gl.getUniformLocation(program, 'time'), this.elapsed);
    gl.uniform2f(gl.getUniformLocation(program, 'resolution'), this.canvas.width, this.canvas.height);
    gl.uniform2f(gl.getUniformLocation(program, 'mouse'), this.mouseX, this.mouseY);
    for (const [name, value] of this.uniforms) {
      gl.uniform1f(gl.getUniformLocation(program, name), value);
    }

    const position = gl.getAttribLocation(program, 'position');
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
    if (position >= 0) {
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    }
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  private link(gl: WebGL2RenderingContext, fragmentSource: string): WebGLProgram {
    const vertex = this.shader(gl, gl.VERTEX_SHADER, VERTEX);
    const fragment = this.shader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    const program = gl.createProgram();
    if (!program) throw new Error('Could not create a program.');
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program) ?? 'Link failed';
      gl.deleteProgram(program);
      throw new Error(info);
    }
    return program;
  }

  private shader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
    const shader = gl.createShader(type);
    if (!shader) throw new Error('Could not create a shader.');
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader) ?? 'Compile failed';
      gl.deleteShader(shader);
      throw new Error(info);
    }
    return shader;
  }
}
