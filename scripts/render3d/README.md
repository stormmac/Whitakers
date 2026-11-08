# Ring renders

3D renders of the before/after pieces on the homepage (`assets/designs/*.webp`).

    cd scripts/render3d
    npm i --prefix /tmp/three three@0.170.0 && ln -sfn /tmp/three/node_modules/three three
    python3 -m http.server 8765 &      # serve this folder
    mkdir -p out && node shoot.cjs     # renders out/<name>.png with headless Chromium (WebGL)
    python3 finish.py                  # crops and writes assets/designs/<name>.webp

Each piece is modelled in `rings.js` (PIECES). These are illustrations, not photos of real jobs.
