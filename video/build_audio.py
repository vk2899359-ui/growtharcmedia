"""Builds timeline.json (cues + visual events) and audio/mix.wav (voice + music + SFX), 44.1 kHz stereo, exactly 40 s.
Voice: voice/seg1..5.wav (one take per 8 s section). Replace them with a real narrator and re-run."""
import json, subprocess, wave, os, numpy as np
SR = 44100; DUR = 40.0; N = int(SR * DUR)
rng = np.random.default_rng(7)
SEGS = json.load(open("script.json"))
KEYS = {  # substring used to locate each cue inside its segment
 1: dict(sales="Sales", launch="launch", objective="objective", event="conversion event", select="select"),
 2: dict(audience="audience", broad="Broad", creative="creative", data="data", winning="winning", identify="identify"),
 3: dict(testing="testing", hooks="hooks", offers="offers", winning="winning creative", scale="scale"),
 4: dict(likes="likes", ctr="CTR", cpc="CPC", cpm="CPM", cpl="CPL", roas="ROAS"),
 5: dict(profit="profit", scale="scale", profitable="profitable", farak="फर्क"),
}
def rd(p):
    with wave.open(p) as w:
        x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
        return x, w.getframerate()
def fit(i):
    src = f"voice/seg{i}.wav"; dst = f"voice/fit{i}.wav"
    x, sr = rd(src); d = len(x) / sr
    f = max(1.0, d / 7.5)
    flt = [] ; ff = f
    while ff > 2.0: flt.append("atempo=2.0"); ff /= 2.0
    flt.append(f"atempo={ff:.4f}")
    subprocess.run(["ffmpeg","-y","-loglevel","error","-i",src,"-af",",".join(flt)+",aresample=44100","-ac","1",dst], check=True)
    y, _ = rd(dst)
    nz = np.where(np.abs(y) > 0.01)[0]; y = y[nz[0]:nz[-1]]  # trim silence
    return y
voice = np.zeros(N, np.float32); cues = {}
for i in range(1, 6):
    y = fit(i); t0 = 8 * (i - 1) + 0.25
    voice[int(t0*SR):int(t0*SR)+len(y)] += y[:N-int(t0*SR)]
    D = len(y) / SR; text = SEGS[i-1]
    for k, sub in KEYS[i].items():
        p = text.index(sub); cues[f"{i}.{k}"] = t0 + D * p / len(text)
    cues[f"{i}.start"] = t0; cues[f"{i}.end"] = t0 + D
voice *= 0.9 / max(0.05, np.abs(voice).max())
c = lambda k: cues[k]; cl = lambda v, a, b: min(b, max(a, v))
ev = {}
# ---- scene 1
ev["click"] = cl(c("1.sales") + .15, 1.5, 3.0); ev["step1"] = ev["click"] + .45
ev["step2"] = max(c("1.launch"), ev["step1"] + 1.1); ev["card"] = ev["step2"] - .3
ev["xform"] = cl(max(c("1.event"), ev["card"] + 1.3), 4.5, 6.6); ev["step3"] = ev["xform"] + .3
ev["k1"], ev["k2"] = ev["click"], ev["xform"]; ev["k3"] = cl(c("1.select"), ev["xform"] + .8, 7.3)
# ---- scene 2
ev["broad"] = max(c("2.broad"), 8.6); ev["interest"] = ev["broad"] + .75; ev["look"] = ev["broad"] + 1.5; ev["retarget"] = ev["broad"] + 2.25
ev["scan"] = ev["retarget"] + .5; ev["kt"] = 8.5; ev["ka"] = max(c("2.creative"), ev["look"] + .3)
ev["win"] = cl(c("2.winning"), ev["retarget"] + 1.6, 14.9); ev["kw"] = ev["win"]
# ---- scene 3
ev["cards"] = 16.3; ev["hookA"] = max(c("3.hooks"), 17.3); ev["hookB"] = ev["hookA"] + .3; ev["hookC"] = ev["hookA"] + .6
ev["bars"] = ev["hookC"] + .3; ev["winner"] = cl(c("3.winning"), ev["bars"] + 1.8, 22.3)
ev["sales3"] = cl(c("3.scale") - .2, ev["winner"] + 1.0, 22.9)
# ---- scene 4
ev["likes"] = 24.3
m = 26.2
for k in ("ctr", "cpc", "cpm", "cpl"):
    ev[k] = max(c("4." + k), m); m = ev[k] + .5
ev["roas"] = cl(max(c("4.roas"), m), 29.0, 30.3)
ev["d1"] = min(ev["roas"] + 1.0, 30.5); ev["d2"] = ev["d1"] + .45; ev["d3"] = ev["d2"] + .45
# ---- scene 5
ev["b1"] = 32.4; ev["b2"] = cl(c("5.scale"), ev["b1"] + 1.4, 34.4); ev["b3"] = ev["b2"] + 1.0
ev["endcard"] = 36.35; ev["l1"] = 36.55; ev["l2"] = cl(c("5.profitable"), 37.3, 38.1); ev["sub"] = ev["l2"] + .9
json.dump(dict(cues=cues, ev=ev), open("timeline.json", "w"), indent=1)

# ---------- synth helpers
def env(n, a, d): t = np.arange(n) / SR; return np.minimum(t / max(a, 1e-4), 1) * np.exp(-t / d)
def put(buf, x, t, g=1.0, pan=0.0):
    i = int(t * SR); x = x[:max(0, N - i)]
    buf[0, i:i+len(x)] += x * g * (1 - max(0, pan)); buf[1, i:i+len(x)] += x * g * (1 + min(0, pan))
def lp(x, fc):  # one-pole low-pass
    a = np.exp(-2 * np.pi * fc / SR); y = np.zeros_like(x); s = 0.0
    for i, v in enumerate(x): s = (1 - a) * v + a * s; y[i] = s
    return y
def sine(f, n): return np.sin(2 * np.pi * np.cumsum(np.broadcast_to(f, (n,))) / SR)
def click(): n = int(.05*SR); return (rng.standard_normal(n) * env(n, .0005, .008) * .5 + sine(1800, n) * env(n, .0005, .012) * .5)
def tick(): n = int(.04*SR); return sine(2600, n) * env(n, .0003, .01) * .5
def pop(f=700): n = int(.12*SR); return sine(np.linspace(f*1.8, f, n), n) * env(n, .001, .04)
def whoosh(d=.5, up=True):
    n = int(d*SR); z = rng.standard_normal(n); t = np.linspace(0, 1, n); fc = (400 + 5000 * t**2) if up else (5400 - 5000 * t)
    out = np.zeros(n); s = 0.0
    for i in range(n): a = np.exp(-2*np.pi*fc[i]/SR); s = (1-a)*z[i] + a*s; out[i] = s
    return out * np.sin(np.pi * t) ** 1.5 * 2.2
def ping(f=1318): n = int(.7*SR); return (sine(f, n) + .4*sine(f*2.01, n) + .2*sine(f*3, n)) * env(n, .002, .16) * .5
def cash(): return np.concatenate([ping(2093)[:int(.12*SR)], ping(2637)[:int(.5*SR)]]) * .6
def impact(): n = int(1.2*SR); return (sine(np.linspace(110, 38, n), n) * env(n, .002, .35) + rng.standard_normal(n) * env(n, .001, .05) * .25) * .9
def riser(d): n = int(d*SR); t = np.linspace(0, 1, n); z = rng.standard_normal(n); return lp(z, 3000) * t**2 * .6 + sine(200 + 1200*t**2, n) * t**3 * .15
def data_blip(): n = int(.09*SR); return sine(np.where(np.arange(n) < n//2, 1500, 2000), n) * env(n, .001, .03) * .4
sfx = np.zeros((2, N), np.float32)
def S(name, t, g=1.0, pan=0.0, **kw): put(sfx, globals()[name](**kw), t, g, pan)
S("click", 0.25, .6); S("whoosh", 0.0, .25, d=.5)
S("click", ev["click"], 1); S("pop", ev["step1"], .6, f=900)
S("whoosh", ev["card"] - .1, .35, d=.5); S("click", ev["step2"], .7); S("pop", ev["step2"] + .05, .5, f=1000)
S("whoosh", ev["xform"] - .1, .5, d=.45); S("ping", ev["xform"] + .1, .6); S("pop", ev["step3"], .6, f=1100)
for k in ("k1", "k2", "k3"): S("tick", ev[k], .8)
S("riser", 6.3, .35, d=1.7); S("impact", 8.0, .55); S("whoosh", 7.9, .3, d=.4, up=False)
for k, pn in (("broad", 0), ("interest", -.3), ("look", .3), ("retarget", 0)): S("pop", ev[k], .7, pan=pn, f=600 + 120 * list(("broad","interest","look","retarget")).index(k))
for k in ("kt", "ka", "kw"): S("tick", ev[k], .8)
S("whoosh", ev["win"] - .2, .4, d=.5); S("ping", ev["win"], .8, f=1568); S("cash", ev["win"] + .25, .4)
for t in np.arange(ev["scan"], ev["win"] - .2, .22): S("data_blip", t, .22, pan=rng.uniform(-.5, .5))
S("impact", 16.0, .45); S("whoosh", 16.15, .3, d=.5)
for j, t in enumerate((ev["cards"], ev["cards"] + .2, ev["cards"] + .4, ev["cards"] + .6)): S("pop", t + .1, .55, pan=-.4 + .27 * j, f=500 + 80 * j)
for k in ("hookA", "hookB", "hookC"): S("click", ev[k], .8)
for t in np.arange(ev["bars"], ev["winner"] - .1, .25): S("data_blip", t, .18, pan=rng.uniform(-.6, .6))
S("whoosh", ev["winner"] - .15, .45, d=.5); S("ping", ev["winner"], .9, f=1568)
S("riser", ev["sales3"] - .3, .4, d=1.2)
for j, t in enumerate(np.arange(ev["sales3"], 23.9, .38)): S("cash" if j % 2 == 0 else "ping", t, .55 if j % 2 == 0 else .35, pan=rng.uniform(-.5, .5), **({} if j % 2 == 0 else dict(f=1760)))
S("whoosh", 23.7, .5, d=.45); S("impact", 24.0, .5)
S("click", ev["likes"], .8); S("pop", ev["likes"] + .5, .4, f=300)
for k in ("ctr", "cpc", "cpm", "cpl"): S("whoosh", ev[k] - .15, .22, d=.3); S("pop", ev[k], .65, f=800); S("data_blip", ev[k] + .12, .4)
S("riser", ev["roas"] - 1.0, .5, d=1.0); S("impact", ev["roas"], .85); S("ping", ev["roas"] + .05, .8, f=1568)
for k in ("d1", "d2", "d3"): S("tick", ev[k], .9); S("whoosh", ev[k] - .1, .2, d=.25)
S("impact", 32.0, .35)
for k in ("b1", "b2", "b3"): S("click", ev[k], .8); S("ping", ev[k] + .05, .5, f=1175 * (1 + .12 * ("b1","b2","b3").index(k)))
for t in np.arange(33.0, 36.3, .45): S("data_blip", t, .16, pan=rng.uniform(-.5, .5))
S("riser", ev["endcard"] - 1.1, .55, d=1.1); S("impact", ev["endcard"], .9)
S("whoosh", ev["l1"], .35, d=.4); S("whoosh", ev["l2"] - .1, .35, d=.4); S("ping", ev["l2"] + .1, .6, f=1568); S("tick", ev["sub"], .8)

# ---------- music: A minor, 116 bpm, quiet bed
BPM = 116; beat = 60 / BPM; music = np.zeros((2, N), np.float32)
def kick(): n = int(.3*SR); return sine(np.linspace(130, 45, n)**1.0, n) * env(n, .001, .09) * 1.0
def hat(o=False): n = int((.2 if o else .05)*SR); return lp(rng.standard_normal(n), 9000) * env(n, .0005, .06 if o else .012) * .5 - lp(rng.standard_normal(n), 5000) * env(n,.0005,.03)*.0
def clap(): n = int(.18*SR); return lp(rng.standard_normal(n), 3500) * env(n, .001, .05) * .7
def bassn(f): n = int(beat*SR*.95); x = (sine(f, n) + .5 * np.sign(sine(f, n)) * .3); return lp(x, 400) * env(n, .005, .35) * .9
def pluck(f): n = int(.4*SR); return (sine(f, n) + .3 * sine(f * 2, n)) * env(n, .002, .12)
def pad(f, d): n = int(d*SR); x = sum(sine(f * m, n) * g for m, g in ((1, 1), (1.003, .7), (2, .3))); return x * np.minimum(np.arange(n)/SR/.6, 1) * np.minimum((n-np.arange(n))/SR/.6, 1) * .12
chords = [(110.0, [220.0, 261.63, 329.63]), (87.31, [174.61, 220.0, 261.63]), (130.81, [261.63, 329.63, 392.0]), (98.0, [196.0, 246.94, 293.66])]
bars = int(DUR / (beat * 4)) + 1
for b in range(bars):
    ch = chords[b % 4]; t0 = b * beat * 4
    if t0 >= DUR: break
    sec = t0  # arrangement: intro lighter, full from 8 s, drop at end card
    lvl = .55 if t0 < 8 else 1.0
    for f in ch[1]: put(music, pad(f, beat * 4), t0, .7 * lvl)
    for s in range(16):
        t = t0 + s * beat / 4; arp = ch[1][s % 3] * (2 if (s // 3) % 2 else 1)
        if s % 2 == 0 and t0 >= 4: put(music, pluck(arp), t, .22 * lvl, pan=(-.3 if s % 4 == 0 else .3))
        if s % 2 == 1 or s % 4 == 0: put(music, hat(s % 8 == 6), t, .10 * lvl)
    for k in range(4):
        t = t0 + k * beat
        put(music, kick(), t, .55 * lvl)
        if k in (1, 3) and t0 >= 8: put(music, clap(), t, .12)
        put(music, bassn(ch[0]), t + beat * .5, .45 * lvl)
music_gain = .5
# voice-driven ducking (sidechain): envelope of voice, smoothed
vabs = np.abs(voice); w = int(.12 * SR); venv = np.convolve(vabs, np.ones(w) / w, "same"); venv = np.clip(venv / (venv.max() + 1e-6) * 3, 0, 1)
duck = 1 - .45 * lp(venv, 8)
music *= duck; music *= music_gain / max(1e-6, np.abs(music).max()) * .55
# gentle fade out of everything at the very end
fade = np.ones(N, np.float32); fade[-int(.6*SR):] = np.linspace(1, 0, int(.6*SR))
vmix = np.stack([voice, voice]) * 1.0
sfx_g = .55
mix = (vmix * 1.0 + music + sfx * sfx_g) * fade
mix = np.tanh(mix * 1.1) * .93
os.makedirs("audio", exist_ok=True)
with wave.open("audio/mix.wav", "wb") as wv:
    wv.setnchannels(2); wv.setsampwidth(2); wv.setframerate(SR)
    wv.writeframes((mix.T * 32767).astype(np.int16).tobytes())
print("ok", {k: round(v, 2) for k, v in ev.items()})
