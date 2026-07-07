import test, { almost, ok, is } from 'tst'
import { isolate, remove } from './index.js'

const fs = 44100

function sine (freq, n, sr = fs) {
	let d = new Float32Array(n)
	for (let i = 0; i < n; i++) d[i] = Math.sin(2 * Math.PI * freq * i / sr)
	return d
}
function rms (d) { let s = 0; for (let x of d) s += x * x; return Math.sqrt(s / d.length) }

// stereo fixture: center-panned 440 (vocal) + side-panned 3 kHz (backing)
function fixture (n = 8192) {
	let vocal = sine(440, n), side = sine(3000, n)
	let L = new Float32Array(n), R = new Float32Array(n)
	for (let i = 0; i < n; i++) {
		L[i] = vocal[i] + side[i]
		R[i] = vocal[i] - side[i]
	}
	return [L, R]
}

test('isolate — keeps center, removes side', () => {
	let [L, R] = isolate(fixture())
	let vocal = sine(440, L.length)
	let err = 0
	for (let i = 0; i < L.length; i++) err = Math.max(err, Math.abs(L[i] - vocal[i]))
	ok(err < 1e-5, 'L equals center content')
	for (let i = 0; i < L.length; i++) if (L[i] !== R[i]) throw new Error('channels differ')
})

test('remove — keeps side, removes center', () => {
	let [L, R] = remove(fixture())
	let side = sine(3000, L.length)
	let err = 0
	for (let i = 0; i < L.length; i++) err = Math.max(err, Math.abs(L[i] - side[i]))
	ok(err < 1e-5, 'L equals side content')
	for (let i = 0; i < L.length; i++) if (L[i] !== -R[i]) throw new Error('R is not anti-phase')
})

test('remove → isolate: pure center cancels fully', () => {
	let vocal = sine(440, 4096)
	let [L] = remove([Float32Array.from(vocal), Float32Array.from(vocal)])
	almost(rms(L), 0, 1e-9, 'center-only material removed to silence')
})

test('mono passthrough', () => {
	let d = sine(440, 1024)
	let [m] = isolate([d])
	ok(m === d, 'same buffer, untouched')
	is(rms(m) > 0.5, true)
})
