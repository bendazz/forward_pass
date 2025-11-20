## Forward Pass Playground (Prototype)

This prototype provides a very minimal scaffold for a teaching web app where students will practice performing a single forward pass through different neural networks.

### Current State
Four panels (fixed 2x2 grid) are rendered in `index.html`.

Panel 1 (Simple Linear Regression): Bias node (constant 1) + single feature x₁ -> ŷ. Output node hides ŷ (`ŷ=?`) until revealed. Buttons: randomize x₁ & weights; reveal ŷ.

Panel 2 (Multiple Regression): Bias node + two features x₁ and x₂ -> ŷ. Independent randomization of x₁, x₂, intercept weight, and two slope weights. ŷ hidden until reveal. Structure mirrors Panel 1 for consistent student workflow.

Panel 3 (Logistic Regression): Bias node + single feature x₁ -> ŷ with sigmoid activation. Output node shaded yellow and initially shows `ŷ=?`; randomize button changes x₁ and both weights (intercept & slope) and resets hidden state; reveal button applies sigmoid to the linear combination and displays ŷ.

Panel 4: Placeholder for future networks.

Styling favors a clean, light theme. JavaScript (`app.js`) exposes API plus forward pass computation, activation handling (sigmoid), randomization, and reveal logic for panels 1–3.

### Usage
Open `index.html` in a modern browser:

```
# From repo root
xdg-open index.html  # Linux
open index.html       # macOS (if needed)
start index.html      # Windows (PowerShell / cmd)
```

No build step is required; everything is static.

### Next Steps (Ideas)
- Implement network definition JSON schema per panel.
- Add contribution breakdown display: ŷ = w_b*1 + w_1*x₁ (+ w_2*x₂ for multiple regression).
- Inline editing of feature values & weights (pre-reveal) with validation.
- Activation functions / hidden layers (extend to Panels 3 & 4).
- Animated edge highlighting during reveal.

Feel free to request any of these and they can be scaffolded next.
# forward_pass