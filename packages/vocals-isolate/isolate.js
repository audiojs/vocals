// Vocal isolation — keep mid (center-panned content), discard side.
// Works on stereo where vocals are panned center; mono passes through unchanged.
// Extracted from audio core (SoX `oops` complement).

export default function isolate (channels) {
	if (channels.length < 2) return channels
	let [L, R] = channels
	for (let i = 0; i < L.length; i++) {
		let mid = (L[i] + R[i]) * 0.5
		L[i] = mid
		R[i] = mid
	}
	return channels
}
