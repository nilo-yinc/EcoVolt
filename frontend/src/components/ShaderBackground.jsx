import { useEffect } from 'react';

const SHADER_ID = 'ww-global-shader';
const SHADER_SOURCE = `#version 300 es
/*********
* made by Matthias Hurrle (@atzedent)
*/
precision highp float;
out vec4 O;
uniform float time;
uniform vec2 resolution;
uniform vec2 move;
uniform float zoom;
uniform vec2 wheel;
#define FC gl_FragCoord.xy
#define R resolution
#define MN min(R.x,R.y)
#define T (PI*8.+time)
#define S smoothstep
#define SE(v,s) S(s+1./MN,s-1./MN,v)
#define hue(a) (.5+.5*cos(PI*(a)-vec3(1,.5,.5)*PI))
#define PI radians(180.)
float box(vec2 p, float s, float r) {
  p=abs(p)-s+r;
  return length(max(p,.0))+min(.0,max(p.x,p.y))-r;
}
vec3 pattern(vec2 uv, float tc, float ta) {
  vec2 o=vec2(2.5,1.5);
  vec2 p=uv*1.5, id=clamp(.5+round(p/.25-.5),-o,o);
  p-=clamp(.5+round(p/.25-.5),-o,o)*.25;
  float d=box(p,.1,.003);
  vec3 col=vec3(0);
  id=vec2(-id.x,-id.y);
  float k=3., t=mod(ta*k,20.);
  float e=SE(d,.0);
  col+=hue(PI/2.+floor(tc))*e;
  if (t > 5. && t <= 15.) {
    float tt=floor(mod((ta*k-5.)*3.5,35.));
    vec2 q=abs(id);
    col*=tt>=floor(q.x+q.y)?1.:.125;
  } else if (t > 15.) {
    float tt=floor(mod((ta*k-20.)*5.,25.));
    vec2 q=abs(id);
    col*=tt>=floor(q.x+q.y)?.125:1.;
  } else {
    float tt=floor(mod(ta*k*6.,30.));
    vec2 q=id+o+.5;
    col*=tt>=floor(q.x+q.y*(R.x>R.y?6.:4.))?1.:.125;
  }
  return col;
}
void divide(inout vec2 p) {
  p.x=mod(p.x*2.+.5,2.)-1.;
  p.y-=clamp(round(p.y),.0,6.);
}
void main() {
  vec2 uv=(FC-.5*R)/MN;
  if (R.y<R.x) {
    uv=uv.yx;
  }
  vec3 col=vec3(0);
  float
  g=R.y<R.x?abs(uv.y)*.25:.0, k=clamp(dot(g,g),.0,1.),
  f=.2, t=f*T, tt=T*.5, wy=-wheel.y/MN;
  uv*=.5;
  vec2
  p=vec2(uv.x-k,0.75)/abs(uv.y)-vec2(0.0+t*1.00-wy*1.00,-1.),
  q=vec2(uv.x-k,1.25)/abs(uv.y)-vec2(1.0+t*0.50-wy*0.50,+1.),
  r=vec2(uv.x-k,1.50)/abs(uv.y)-vec2(2.0+t*0.25-wy*0.25,+1.);
  divide(p); divide(q); divide(r);
  col+=pattern(p,t,tt);
  col+=pattern(q,t+(PI/2.)*f,tt+.2);
  col+=pattern(r,t+PI*f,tt+.4);
  col/=1.+exp(-col);
  col=pow(col,vec3(.4545));
  col=mix(vec3(0),col,min(time*.3,1.));
  uv=FC/R;
  float vig=uv.x*uv.y*(1.-uv.x)*(1.-uv.y);
  col=mix(col,col*col*.1,S(1.,.0,pow(vig*25.,.3)));
  O=vec4(col,1);
}`;

const store = {
    putShaderSource(id, source) {
        localStorage.setItem(id, source);
    },
    getShaderSource(id) {
        return localStorage.getItem(id);
    },
};

function lerp(a, b, t) {
    return a + (b - a) * t;
}

class Renderer {
    #vertexSrc = '#version 300 es\nprecision highp float;\nin vec4 position;\nvoid main(){gl_Position=position;}';
    #fragmtSrc = '#version 300 es\nprecision highp float;\nout vec4 O;\nuniform float time;\nuniform vec2 resolution;\nvoid main(){vec2 uv=gl_FragCoord.xy/resolution;O=vec4(uv,sin(time)*.5+.5,1.);}';
    #vertices = [-1, 1, -1, -1, 1, 1, 1, -1];

    constructor(canvas, scale) {
        this.canvas = canvas;
        this.scale = scale;
        this.gl = canvas.getContext('webgl2');

        if (!this.gl) {
            throw new Error('WebGL2 is not available in this browser.');
        }

        this.gl.viewport(0, 0, canvas.width, canvas.height);
        this.shaderSource = this.#fragmtSrc;
        this.mouseMove = [0, 0];
        this.mouseCoords = [0, 0];
        this.pointerCoords = [0, 0];
        this.nbrOfPointers = 0;
        this.zoom = 0;
        this.wheel = [0, 0];
        this.startRandom = Math.random();
    }

    get defaultSource() {
        return this.#fragmtSrc;
    }

    updateShader(source) {
        this.reset();
        this.shaderSource = source;
        this.setup();
        this.init();
    }

    updateMove(deltas) {
        this.mouseMove = deltas;
    }

    updateZoom(zoom) {
        this.zoom = zoom;
    }

    updateWheel(wheel) {
        this.wheel = wheel;
    }

    updateMouse(coords) {
        this.mouseCoords = coords;
    }

    updatePointerCoords(coords) {
        this.pointerCoords = coords;
    }

    updatePointerCount(count) {
        this.nbrOfPointers = count;
    }

    updateScale(scale) {
        this.scale = scale;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    compile(shader, source) {
        const { gl } = this;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const error = gl.getShaderInfoLog(shader) || 'Shader compilation failed.';
            this.canvas.dispatchEvent(new CustomEvent('shader-error', { detail: error }));
        }
    }

    test(source) {
        const { gl } = this;
        const shader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        let result = null;
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            result = gl.getShaderInfoLog(shader);
        }

        gl.deleteShader(shader);
        return result;
    }

    reset() {
        const { gl } = this;
        if (!this.program) {
            return;
        }

        if (this.vs) {
            gl.detachShader(this.program, this.vs);
            gl.deleteShader(this.vs);
        }
        if (this.fs) {
            gl.detachShader(this.program, this.fs);
            gl.deleteShader(this.fs);
        }
        gl.deleteProgram(this.program);

        this.program = null;
        this.vs = null;
        this.fs = null;
    }

    setup() {
        const { gl } = this;
        this.vs = gl.createShader(gl.VERTEX_SHADER);
        this.fs = gl.createShader(gl.FRAGMENT_SHADER);
        this.compile(this.vs, this.#vertexSrc);
        this.compile(this.fs, this.shaderSource);

        this.program = gl.createProgram();
        gl.attachShader(this.program, this.vs);
        gl.attachShader(this.program, this.fs);
        gl.linkProgram(this.program);

        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            console.error(gl.getProgramInfoLog(this.program));
        }
    }

    init() {
        const { gl, program } = this;
        this.buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.#vertices), gl.STATIC_DRAW);

        const position = gl.getAttribLocation(program, 'position');
        gl.enableVertexAttribArray(position);
        gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

        program.resolution = gl.getUniformLocation(program, 'resolution');
        program.time = gl.getUniformLocation(program, 'time');
        program.daytime = gl.getUniformLocation(program, 'daytime');
        program.move = gl.getUniformLocation(program, 'move');
        program.touch = gl.getUniformLocation(program, 'touch');
        program.pointerCount = gl.getUniformLocation(program, 'pointerCount');
        program.pointers = gl.getUniformLocation(program, 'pointers');
        program.zoom = gl.getUniformLocation(program, 'zoom');
        program.wheel = gl.getUniformLocation(program, 'wheel');
        program.startRandom = gl.getUniformLocation(program, 'startRandom');
    }

    render(now = 0) {
        const { gl, program, buffer, canvas, mouseMove, mouseCoords, pointerCoords, nbrOfPointers, zoom, wheel, startRandom } = this;
        const daytime = new Date();
        if (!program) {
            return;
        }

        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(program);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

        if (program.resolution) gl.uniform2f(program.resolution, canvas.width, canvas.height);
        if (program.time) gl.uniform1f(program.time, now * 1e-3);
        if (program.daytime) gl.uniform4f(program.daytime, daytime.getHours(), daytime.getMinutes(), daytime.getSeconds(), daytime.getMilliseconds());
        if (program.move) gl.uniform2f(program.move, ...mouseMove);
        if (program.touch) gl.uniform2f(program.touch, ...mouseCoords);
        if (program.pointerCount) gl.uniform1i(program.pointerCount, nbrOfPointers);
        if (program.pointers) gl.uniform2fv(program.pointers, pointerCoords);
        if (program.zoom) gl.uniform1f(program.zoom, zoom);
        if (program.wheel) gl.uniform2f(program.wheel, ...wheel);
        if (program.startRandom) gl.uniform1f(program.startRandom, startRandom);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    clear() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }
}

class PointerHandler {
    constructor(element, scale) {
        this.scale = scale;
        this.active = false;
        this.pointers = new Map();
        this.lastCoords = [0, 0];
        this.moves = [0, 0];
        this.zoom = 0;
        this.wheelDelta = 0;
        this.wheelOffset = 0;
        this.ex = 0;
        this.ey = 0;

        const map = (x, y) => [x * this.getScale(), element.height - y * this.getScale()];

        this.onPointerDown = (event) => {
            this.active = true;
            this.pointers.set(event.pointerId, map(event.clientX, event.clientY));
            this.ex = event.clientX;
            this.ey = event.clientY;
        };

        this.onPointerUp = (event) => {
            if (this.count === 1) {
                this.lastCoords = this.first;
            }
            this.pointers.delete(event.pointerId);
            this.active = this.pointers.size > 0;
        };

        this.onPointerMove = (event) => {
            if (!this.active) {
                return;
            }

            this.lastCoords = [event.clientX, event.clientY];
            this.pointers.set(event.pointerId, map(event.clientX, event.clientY));
            this.moves = [
                this.moves[0] + (event.clientX - this.ex),
                this.moves[1] + (this.ey - event.clientY),
            ];
            this.ex = event.clientX;
            this.ey = event.clientY;
        };

        this.onWheel = (event) => {
            this.zoom = lerp(this.zoom, Math.max(-1, Math.min(1, this.zoom + event.deltaY)), 0.05);
            if (this.wheelDelta * event.deltaY < 0) {
                this.wheelDelta = event.deltaY;
            } else {
                this.wheelDelta = lerp(this.wheelDelta, event.deltaY, 0.05);
            }
            this.wheelOffset += this.wheelDelta;
        };

        element.addEventListener('pointerdown', this.onPointerDown);
        element.addEventListener('pointerup', this.onPointerUp);
        element.addEventListener('pointerleave', this.onPointerUp);
        element.addEventListener('pointermove', this.onPointerMove);
        element.addEventListener('wheel', this.onWheel, { passive: true });
    }

    destroy(element) {
        element.removeEventListener('pointerdown', this.onPointerDown);
        element.removeEventListener('pointerup', this.onPointerUp);
        element.removeEventListener('pointerleave', this.onPointerUp);
        element.removeEventListener('pointermove', this.onPointerMove);
        element.removeEventListener('wheel', this.onWheel);
    }

    getScale() {
        return this.scale;
    }

    updateScale(scale) {
        this.scale = scale;
    }

    get count() {
        return this.pointers.size;
    }

    get move() {
        return this.moves;
    }

    get zoomed() {
        return this.zoom;
    }

    get wheel() {
        return [this.wheelDelta, this.wheelOffset];
    }

    get coords() {
        return this.pointers.size > 0
            ? Array.from(this.pointers.values()).map((point) => [...point]).flat()
            : [0, 0];
    }

    get first() {
        return this.pointers.values().next().value || this.lastCoords;
    }
}

class Editor {
    constructor(textarea, errorField, errorIndicator) {
        this.textarea = textarea;
        this.errorField = errorField;
        this.errorIndicator = errorIndicator;
        this.onKeydown = this.handleKeydown.bind(this);
        this.onScroll = this.handleScroll.bind(this);
        textarea.addEventListener('keydown', this.onKeydown);
        textarea.addEventListener('scroll', this.onScroll);
    }

    destroy() {
        this.textarea.removeEventListener('keydown', this.onKeydown);
        this.textarea.removeEventListener('scroll', this.onScroll);
    }

    get hidden() {
        return this.textarea.classList.contains('hidden');
    }

    set hidden(value) {
        if (value) {
            this.hide();
            return;
        }
        this.show();
    }

    get text() {
        return this.textarea.value;
    }

    set text(value) {
        this.textarea.value = value;
    }

    setError(message) {
        this.errorField.textContent = message;
        this.errorField.classList.add('opaque');

        const match = message.match(/ERROR: \d+:(\d+):/);
        const lineNumber = match ? Number.parseInt(match[1], 10) : 0;
        const overlay = document.createElement('pre');
        overlay.classList.add('overlay');
        overlay.textContent = '\n'.repeat(lineNumber);
        document.body.appendChild(overlay);

        const offsetTop = Number.parseInt(getComputedStyle(overlay).height, 10) || 0;
        this.errorIndicator.style.setProperty('--top', `${offsetTop}px`);
        this.errorIndicator.style.visibility = 'visible';
        document.body.removeChild(overlay);
    }

    clearError() {
        this.errorField.textContent = '';
        this.errorField.classList.remove('opaque');
        this.errorField.blur();
        this.errorIndicator.style.visibility = 'hidden';
    }

    hide() {
        [this.errorIndicator, this.errorField, this.textarea].forEach((el) => el.classList.add('hidden'));
    }

    show() {
        [this.errorIndicator, this.errorField, this.textarea].forEach((el) => el.classList.remove('hidden'));
        this.textarea.focus();
    }

    handleScroll() {
        this.errorIndicator.style.setProperty('--scroll-top', `${this.textarea.scrollTop}px`);
    }

    handleKeydown(event) {
        if (event.key === 'Tab') {
            event.preventDefault();
            this.handleTab(event.shiftKey);
            return;
        }

        if (event.key === 'Enter') {
            event.preventDefault();
            this.handleEnter();
        }
    }

    handleTab(shiftPressed) {
        const editor = this.textarea;
        const selectedText = editor.value.substring(editor.selectionStart, editor.selectionEnd);

        if (selectedText.length === 0) {
            document.execCommand('insertText', false, '\t');
            return;
        }

        const updated = shiftPressed
            ? selectedText.split('\n').map((line) => line.replace(/^\t/, '').replace(/^ /, '')).join('\n')
            : selectedText.split('\n').map((line) => `\t${line}`).join('\n');

        document.execCommand('insertText', false, updated);
    }

    handleEnter() {
        const editor = this.textarea;
        const cursorPosition = editor.selectionStart;
        const visibleTop = editor.scrollTop;

        let start = cursorPosition - 1;
        while (start >= 0 && editor.value[start] !== '\n') {
            start -= 1;
        }

        let indentation = '';
        while (start < cursorPosition - 1 && (editor.value[start + 1] === ' ' || editor.value[start + 1] === '\t')) {
            indentation += editor.value[start + 1];
            start += 1;
        }

        document.execCommand('insertText', false, `\n${indentation}`);
        editor.selectionStart = editor.selectionEnd = cursorPosition + indentation.length + 1;
        editor.scrollTop = visibleTop;
    }
}

export default function ShaderBackground() {
    useEffect(() => {
        const shell = document.querySelector('.shader-shell');
        const canvas = document.getElementById('canvas');
        const codeEditor = document.getElementById('codeEditor');
        const error = document.getElementById('error');
        const indicator = document.getElementById('indicator');
        const btnToggleView = document.getElementById('btnToggleView');
        const btnToggleResolution = document.getElementById('btnToggleResolution');
        const btnReset = document.getElementById('btnReset');
        const source = document.querySelector("script[type='x-shader/x-fragment']");

        if (!shell || !canvas || !codeEditor || !error || !indicator || !btnToggleView || !btnToggleResolution || !btnReset || !source) {
            return undefined;
        }

        let frame = 0;
        let editor;
        let renderer;
        let pointers;
        let debounceTimer;
        let resolution = 0.5;
        let dpr = Math.max(1, resolution * window.devicePixelRatio);
        const editMode = false;
        const renderDelay = 700;

        const resize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            if (renderer) {
                renderer.updateScale(dpr);
            }
        };

        const loop = (now) => {
            renderer.updateMouse(pointers.first);
            renderer.updatePointerCount(pointers.count);
            renderer.updatePointerCoords(pointers.coords);
            renderer.updateMove(pointers.move);
            renderer.updateZoom(pointers.zoomed);
            renderer.updateWheel(pointers.wheel);
            renderer.render(now);
            frame = requestAnimationFrame(loop);
        };

        const renderThis = () => {
            editor.clearError();
            store.putShaderSource(SHADER_ID, editor.text);
            const result = renderer.test(editor.text);
            if (result) {
                editor.setError(result);
            } else {
                renderer.updateShader(editor.text);
            }
            cancelAnimationFrame(frame);
            loop(0);
        };

        const render = () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(renderThis, renderDelay);
        };

        const toggleView = () => {
            editor.hidden = btnToggleView.checked;
            shell.classList.toggle('editor-hidden', btnToggleView.checked);
            canvas.style.setProperty('--canvas-z-index', btnToggleView.checked ? '0' : '-1');
        };

        const toggleResolution = () => {
            resolution = btnToggleResolution.checked ? 0.5 : 1;
            dpr = Math.max(1, resolution * window.devicePixelRatio);
            pointers.updateScale(dpr);
            resize();
        };

        const reset = () => {
            editor.text = source.textContent || renderer.defaultSource;
            store.putShaderSource(SHADER_ID, editor.text);
            renderThis();
        };

        const onKeyDown = (event) => {
            if (event.key === 'L' && event.ctrlKey) {
                event.preventDefault();
                btnToggleView.checked = !btnToggleView.checked;
                toggleView();
            }
        };

        const onShaderError = (event) => editor.setError(event.detail);

        try {
            renderer = new Renderer(canvas, dpr);
        } catch (err) {
            console.error(err);
            return undefined;
        }

        pointers = new PointerHandler(canvas, dpr);
        editor = new Editor(codeEditor, error, indicator);
        editor.text = store.getShaderSource(SHADER_ID) || source.textContent;

        renderer.setup();
        renderer.init();

        if (!editMode) {
            btnToggleView.checked = true;
            toggleView();
        }
        if (resolution === 0.5) {
            btnToggleResolution.checked = true;
            toggleResolution();
        }

        canvas.addEventListener('shader-error', onShaderError);
        codeEditor.addEventListener('input', render);
        btnToggleView.addEventListener('click', toggleView);
        btnToggleResolution.addEventListener('change', toggleResolution);
        btnReset.addEventListener('click', reset);
        window.addEventListener('resize', resize);
        window.addEventListener('keydown', onKeyDown);

        resize();
        if (renderer.test(editor.text) === null) {
            renderer.updateShader(editor.text);
        }
        loop(0);

        return () => {
            clearTimeout(debounceTimer);
            cancelAnimationFrame(frame);
            canvas.removeEventListener('shader-error', onShaderError);
            codeEditor.removeEventListener('input', render);
            btnToggleView.removeEventListener('click', toggleView);
            btnToggleResolution.removeEventListener('change', toggleResolution);
            btnReset.removeEventListener('click', reset);
            window.removeEventListener('resize', resize);
            window.removeEventListener('keydown', onKeyDown);
            pointers.destroy(canvas);
            renderer.clear();
            renderer.reset();
            editor.destroy();
        };
    }, []);

    return (
        <div className="shader-shell fixed inset-0 z-0">
            <canvas id="canvas" />
            <textarea
                id="codeEditor"
                className="editor"
                spellCheck="false"
                autoCorrect="off"
                autoCapitalize="off"
                translate="no"
            />
            <pre id="error" />
            <div id="indicator" />
            <div id="controls">
                <div className="controls">
                    <input id="btnToggleView" className="icon" type="checkbox" name="toggleView" />
                    <input id="btnToggleResolution" className="icon" type="checkbox" name="toggleResolution" />
                    <input id="btnReset" className="icon" type="checkbox" name="reset" />
                </div>
            </div>
            <script type="x-shader/x-fragment">{SHADER_SOURCE}</script>
        </div>
    );
}
