# Meta Ads Sales Reel (40 s, 9:16)

`meta-ads-sales-reel.mp4` — 1080x1920, 30 fps, AAC stereo.

Pipeline (all deterministic, re-runnable):
1. `voice/seg1..5.wav` — one narration take per 8 s section (script in `script.json`).
   **Current files are an espeak guide voice (placeholder). Drop in a real narrator take per section, same file names.**
2. `python3 build_audio.py` — fits each take into its 8 s window, derives word cues, writes `timeline.json`
   (every visual event time) and `audio/mix.wav` (voice + music bed with voice ducking + SFX).
3. `node render.cjs <frames_dir> 30 <start> <end>` — renders `scene.html` frame-by-frame (Playwright).
4. `ffmpeg -framerate 30 -i <frames_dir>/f%05d.jpg -i audio/mix.wav -c:v libx264 -crf 17 -pix_fmt yuv420p -c:a aac -t 40 meta-ads-sales-reel.mp4`

All on-screen visuals read their timing from `timeline.json`, so replacing the voice and re-running steps 2-4 re-syncs everything.
