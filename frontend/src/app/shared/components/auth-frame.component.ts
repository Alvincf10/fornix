import { Component, input } from '@angular/core';

@Component({
  selector: 'app-auth-frame',
  template: `
    <div class="auth">
      <aside class="brand-pane" aria-label="Product">
        <div class="brand-inner">
          <p class="brand">FORNIX</p>
          <p class="tagline">Engineer Your Knowledge.</p>
          <p class="pitch">
            Personal R&amp;D workspace for research notes, checkpoints, and
            technical docs — kept structured so you can find them again.
          </p>
          <ul class="points" [attr.aria-label]="pointsLabel()">
            @for (point of points(); track point) {
              <li>{{ point }}</li>
            }
          </ul>
        </div>
      </aside>

      <main class="form-pane">
        <div class="form-wrap">
          <ng-content />
        </div>
      </main>
    </div>
  `,
  styles: [
    `
      .auth {
        min-height: 100vh;
        min-height: 100dvh;
        display: grid;
        grid-template-rows: auto 1fr;
        background: var(--fx-paper);
      }

      .brand-pane {
        position: relative;
        padding: 1.35rem 1.25rem 1.15rem;
        color: #e8eaf6;
        background:
          radial-gradient(ellipse 80% 60% at 10% 0%, rgb(99 102 241 / 0.35), transparent 55%),
          linear-gradient(155deg, #1e1b4b 0%, #312e81 48%, #1e293b 100%);
        overflow: hidden;
      }


      .brand-pane::after {
        content: '';
        position: absolute;
        inset: 0;
        background-image: linear-gradient(
            rgb(255 255 255 / 0.04) 1px,
            transparent 1px
          ),
          linear-gradient(90deg, rgb(255 255 255 / 0.04) 1px, transparent 1px);
        background-size: 2.5rem 2.5rem;
        mask-image: linear-gradient(180deg, rgb(0 0 0 / 0.55), transparent 85%);
        pointer-events: none;
      }

      .brand-inner {
        position: relative;
        z-index: 1;
        max-width: 28rem;
      }

      .brand {
        margin: 0;
        font-size: clamp(1.55rem, 5.5vw, 2.35rem);
        font-weight: 700;
        letter-spacing: 0.14em;
        line-height: 1.1;
      }

      .tagline {
        margin: 0.45rem 0 0;
        font-size: 1rem;
        font-weight: 500;
        color: #c7d2fe;
      }

      .pitch {
        display: none;
        margin: 1rem 0 0;
        font-size: 0.95rem;
        line-height: 1.55;
        color: rgb(226 232 240 / 0.92);
      }


      .points {
        display: none;
        margin: 1.5rem 0 0;
        padding: 0;
        list-style: none;
      }

      .points li {
        position: relative;
        padding-left: 1rem;
        margin-top: 0.55rem;
        font-size: 0.9rem;
        color: #c7d2fe;
      }

      .points li::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0.55em;
        width: 0.35rem;
        height: 0.35rem;
        border-radius: 1px;
        background: #818cf8;
      }

      .form-pane {
        display: grid;
        align-content: start;
        padding: 1.5rem 1.25rem 2.5rem;
        background: var(--fx-paper);
      }

      .form-wrap {
        width: min(100%, 24rem);
        margin-inline: auto;
      }

      @media (min-width: 880px) {
        .auth {
          grid-template-rows: none;
          grid-template-columns: minmax(18rem, 1.05fr) minmax(22rem, 0.95fr);
        }

        .brand-pane {
          display: grid;
          align-items: center;
          padding: 3rem 3.25rem;
          min-height: 100vh;
          min-height: 100dvh;
        }

        .brand-inner {
          max-width: 26rem;
        }

        .pitch {
          display: block;
          margin-top: 1.25rem;
          font-size: 1.02rem;
        }

        .points {
          display: block;
        }


        .form-pane {
          align-content: center;
          padding: 2.5rem 2.5rem 3rem;
        }

        .form-wrap {
          width: min(100%, 23.5rem);
          margin-inline: 0;
          margin-left: clamp(0rem, 8%, 3rem);
        }
      }
    `,
  ],
})
export class AuthFrameComponent {
  readonly pointsLabel = input('What you can do');
  readonly points = input<string[]>([
    'Track research and projects in one place',
    'Log checkpoints and progress without losing failed attempts',
    'Write technical docs with code blocks and attachments',
  ]);
}
