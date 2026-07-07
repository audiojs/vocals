// Vocal removal — keep side, discard mid (center-panned content).
// Karaoke / SoX `oops`: side = (L − R) / 2, anti-phase in the output pair.
// Mono passes through unchanged. Extracted from audio core.

export default function remove (channels) {
	if (channels.length < 2) return channels
	let [L, R] = channels
	for (let i = 0; i < L.length; i++) {
		let side = (L[i] - R[i]) * 0.5
		L[i] = side
		R[i] = -side
	}
	return channels
}
