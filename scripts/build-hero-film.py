#!/usr/bin/env python3
"""Edit the home-page hero film from its source clips.

    python3 scripts/build-hero-film.py

Source clips live in production/hero-film/clips/ (kept out of git; six 4-second 1280x720 clips) and the
misty-forest shot comes from assets/forest-film.mp4. The shots are crossfaded into a 20.5-second loop:
the film starts 12 frames into the pen shot and ends by fading into that shot's first 12 frames, so the
last frame flows into the first. Outputs go to assets/: hero-film-720.mp4 (desktop), hero-film-480.mp4
(phones) and hero-poster.webp (the first frame). Requires ffmpeg and cwebp.
"""
import pathlib
import subprocess
import tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
CLIPS = ROOT / "production" / "hero-film" / "clips"
ASSETS = ROOT / "assets"
FPS, FADE = 24, 12  # frames per second, crossfade length in frames

# (file, first frame, last frame exclusive, mirror), in playing order. On desktop the copy sits over the left
# of the film, so shots whose subject was framed on the left are mirrored to bring it to the right.
SHOTS = [
    (CLIPS / "pen.mp4", 12, 88, False),
    (ASSETS / "forest-film.mp4", 24, 102, False),
    (CLIPS / "aerial.mp4", 8, 90, False),
    (CLIPS / "burl.mp4", 9, 87, True),
    (CLIPS / "lathe.mp4", 8, 90, False),
    (CLIPS / "hands.mp4", 5, 91, True),
    (CLIPS / "macro.mp4", 12, 94, True),
    (CLIPS / "pen.mp4", 0, 12, False),
]
# (output name, width, height, average bitrate)
ENCODES = [("hero-film-720.mp4", 1280, 720, "1800k"), ("hero-film-480.mp4", 854, 480, "820k")]


def run(*args):
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", *map(str, args)], check=True)


def main():
    missing = [str(shot[0]) for shot in SHOTS if not shot[0].exists()]
    if missing:
        raise SystemExit("Missing source clips:\n  " + "\n  ".join(missing))

    inputs, chains = [], []
    for i, (path, start, end, mirror) in enumerate(SHOTS):
        inputs += ["-i", path]
        chains.append(
            f"[{i}:v]fps={FPS},trim=start_frame={start}:end_frame={end},setpts=PTS-STARTPTS,"
            f"scale=1280:720:flags=lanczos,{'hflip,' if mirror else ''}setsar=1,format=yuv420p[s{i}]"
        )
    length = SHOTS[0][2] - SHOTS[0][1]
    previous = "s0"
    for i in range(1, len(SHOTS)):
        offset = (length - FADE) / FPS
        chains.append(f"[{previous}][s{i}]xfade=transition=fade:duration={FADE / FPS}:offset={offset:.5f}[x{i}]")
        length += (SHOTS[i][2] - SHOTS[i][1]) - FADE
        previous = f"x{i}"

    with tempfile.TemporaryDirectory() as work:
        work = pathlib.Path(work)
        master = work / "master.mp4"
        run(*inputs, "-filter_complex", ";".join(chains), "-map", f"[{previous}]",
            "-an", "-c:v", "libx264", "-preset", "fast", "-crf", "12", "-pix_fmt", "yuv420p", master)
        # Two passes let the busy shots (flying shavings, the aerial) take bits from the still ones.
        for name, width, height, bitrate in ENCODES:
            common = ["-i", master, "-an", "-vf", f"scale={width}:{height}:flags=lanczos", "-c:v", "libx264",
                      "-preset", "slow", "-profile:v", "high", "-pix_fmt", "yuv420p", "-g", "48", "-b:v", bitrate,
                      "-passlogfile", work / name]
            run(*common, "-pass", "1", "-f", "null", "/dev/null")
            run(*common, "-maxrate", "4500k", "-bufsize", "9000k", "-pass", "2", "-movflags", "+faststart", ASSETS / name)
        frame = work / "first.png"
        run("-i", master, "-frames:v", "1", frame)
        subprocess.run(["cwebp", "-quiet", "-q", "80", str(frame), "-o", str(ASSETS / "hero-poster.webp")], check=True)

    print(f"Hero film: {length} frames, {length / FPS:.2f} seconds")


if __name__ == "__main__":
    main()
