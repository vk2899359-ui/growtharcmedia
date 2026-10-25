"""Guide-voice generator (espeak-ng, Hindi). Placeholder only: replace voice/segN.wav with a real narrator take."""
import ctypes, wave, sys, numpy as np, espeakng_loader as e
SEGS = [
 "Meta Ads में Sales Campaign चला रहे हो? सिर्फ campaign launch करना काफी नहीं है. सबसे पहले सही Sales objective और सही conversion event select करो.",
 "फिर आता है audience. Broad audience से शुरुआत करो, लेकिन creative और data के हिसाब से winning audience identify करो.",
 "इसके बाद creative testing सबसे जरूरी है. अलग-अलग hooks, videos और offers test करो, क्योंकि winning creative ही campaign को scale करता है.",
 "हर दिन सिर्फ likes मत देखो. CTR, CPC, CPM, CPL और सबसे important ROAS देखो.",
 "जो ad और audience profit दे रहे हैं, उन्हें धीरे-धीरे scale करो. यही है Meta Ads को सिर्फ चलाने और profitable तरीके से चलाने का फर्क.",
]
lib = ctypes.CDLL(e.get_library_path())
buf = []
CB = ctypes.CFUNCTYPE(ctypes.c_int, ctypes.POINTER(ctypes.c_short), ctypes.c_int, ctypes.c_void_p)
def cb(w, n, ev):
    if w and n > 0: buf.extend(w[i] for i in range(n))
    return 0
cbf = CB(cb)
sr = lib.espeak_Initialize(2, 0, e.get_data_path().encode(), 0)
lib.espeak_SetSynthCallback(cbf)
lib.espeak_SetVoiceByName(b"hi+m3")
lib.espeak_SetParameter(1, 150, 0)  # rate
lib.espeak_SetParameter(3, 38, 0)   # pitch
for i, t in enumerate(SEGS, 1):
    buf.clear(); b = t.encode()
    lib.espeak_Synth(b, len(b)+1, 0, 0, 0, 1 << 12, None, None); lib.espeak_Synchronize()
    with wave.open(f"voice/seg{i}.wav", "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(np.array(buf, dtype=np.int16).tobytes())
    print(i, len(buf)/sr)
