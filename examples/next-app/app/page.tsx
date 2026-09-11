import { Nurbling } from '@nurblings/react'

const seeds = [
  'ada@example.com',
  'grace.hopper',
  'Alan Turing',
  'katherine johnson',
  'linus',
  'margaret_hamilton',
  'barbara.liskov',
  'dennis',
  'hedy',
  'radia',
  'sophie wilson',
  'joan clarke',
]

const sizes = [24, 48, 96, 192] as const
const backgrounds = ['circle', 'squircle', 'square'] as const

export default function Home() {
  return (
    <main className="page">
      <div className="intro">
        <h1>Nurblings</h1>
        <p>Any string in, a small curious creature out.</p>
      </div>

      <section>
        <h2>Twelve avatars</h2>
        <div className="grid">
          {seeds.map((seed) => (
            <figure className="grid-item" key={seed}>
              <Nurbling seed={seed} size={64} title={seed} />
              <figcaption>{seed}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section>
        <h2>Sizes</h2>
        <div className="row">
          {sizes.map((size) => (
            <div className="row-item" key={size}>
              <Nurbling seed="ada@example.com" size={size} title="ada@example.com" />
              <span className="label">{size}px</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Backgrounds</h2>
        <div className="row">
          {backgrounds.map((background) => (
            <div className="row-item" key={background}>
              <Nurbling
                seed="ada@example.com"
                size={64}
                background={background}
                title="ada@example.com"
              />
              <span className="label">{background}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Animated</h2>
        <div className="hover-demo">
          <Nurbling seed="ada@example.com" size={96} animate title="ada@example.com" />
          <span className="label">Hover me</span>
        </div>
      </section>
    </main>
  )
}
