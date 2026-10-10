/* ==========================================================================
   All page content that you are likely to change lives in this one file.
   Add a clip = add an object to the right `items` array. Nothing else to edit.

   src    path to the mp4, relative to index.html
   poster fallback image, shown while loading AND if the mp4 is missing
   badge  short chip drawn on top of the video (force magnitude, speed, …)
   ========================================================================== */

window.PAGE_DATA = {

  /* One entry per `data-grid="…"` container in index.html. */
  grids: {

    steady: {
      cols: 2,
      items: [
        {
          title: 'Steady-state walking',
          badge: '0.1 m/s',
          src: 'videos/steady-walk.mp4',
          poster: 'img/steady-walk.png'
        },
        {
          title: 'Gait, top-down',
          badge: 'TOP-DOWN',
          src: 'videos/steady-topdown.mp4',
          poster: 'img/steady-topdown.png'
        }
      ]
    },

    sagittal: {
      cols: 2,
      items: [
        {
          title: 'Forward push recovery',
          badge: '+x  245 N',
          src: 'videos/push-x-pos.mp4',
          poster: 'img/push-x-pos.png'
        },
        {
          title: 'Backward push recovery',
          badge: '−x  205 N',
          src: 'videos/push-x-neg.mp4',
          poster: 'img/push-x-neg.png'
        }
      ]
    },

    lateral: {
      cols: 2,
      items: [
        {
          title: 'Right-to-left push recovery',
          badge: '+y  80 N',
          src: 'videos/push-y-pos.mp4',
          poster: 'img/push-y-pos.png'
        },
        {
          title: 'Left-to-right push recovery',
          badge: '−y  175 N',
          src: 'videos/push-y-neg.mp4',
          poster: 'img/push-y-neg.png'
        }
      ]
    },

    oblique: {
      cols: 2,
      items: [
        {
          title: 'Oblique push recovery — +x +y',
          badge: '+x+y  130+50 N',
          src: 'videos/push-xy-pos.mp4',
          poster: 'img/push-xy-pos.png'
        },
        {
          title: 'Oblique push recovery — −x −y',
          badge: '−x−y  130+50 N',
          src: 'videos/push-xy-neg.mp4',
          poster: 'img/push-xy-neg.png'
        }
      ]
    },

    torque: {
      cols: 1,
      items: [
        {
          title: 'Force + torque perturbation',
          badge: '+x 100 N  τz 30 N·m',
          src: 'videos/push-x-torque.mp4',
          poster: 'img/push-x-torque.png'
        }
      ]
    }
  },

  /* Bar charts. `max` sets the axis; `ticks` must be evenly spaced. */
  charts: {
    solve: {
      max: 9,
      ticks: [0, 3, 6, 9],
      rows: [
        { label: 'iLQR solve (all AL rounds)',
          value: 8.26, display: '8.26 ms', share: 92.4,
          tip: '8.26 ms — 92.4% of an 8.94 ms solve. Summed over all augmented-Lagrangian outer iterations and their inner iLQR iterations.' },
        { label: 'Reference, initialization, conversion',
          value: 0.67, display: '0.67 ms', share: 7.6,
          tip: '0.67 ms — 7.6% of the solve. Reference-trajectory preparation, initial-guess construction, result conversion.' }
      ]
    },
    ilqr: {
      max: 2.5,
      ticks: [0, 0.5, 1, 1.5, 2, 2.5],
      rows: [
        { label: 'Cost quadratization',
          value: 1.204, display: '1.204 ms', share: 53.8,
          tip: '1.204 ms — 53.8% of one iteration. Still evaluated through CasADi; analytic derivatives should cut this 2–3×.' },
        { label: 'Forward rollout',
          value: 0.680, display: '0.680 ms', share: 30.3,
          tip: '0.680 ms — 30.3%. The line search runs serially and is amenable to thread-level parallelization.' },
        { label: 'Backward pass & gain computation',
          value: 0.274, display: '0.274 ms', share: 12.2,
          tip: '0.274 ms — 12.2%. Riccati recursion; gains stored in lightweight numerical buffers.' },
        { label: 'Dynamics linearization',
          value: 0.083, display: '0.083 ms', share: 3.7,
          tip: '0.083 ms — 3.7%. Centroidal dynamics Jacobians via CasADi symbolic differentiation.' }
      ]
    }
  }
};
