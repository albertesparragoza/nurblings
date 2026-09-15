<script setup lang="ts">
import { Nurbling } from '@nurblings/vue'

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
</script>

<template>
  <main class="page">
    <h1>Nurblings</h1>
    <p class="tagline">Any string in, a small curious creature out.</p>

    <section class="grid">
      <figure v-for="seed in seeds" :key="seed" class="cell">
        <Nurbling :seed="seed" :size="64" :title="seed" />
        <figcaption>{{ seed }}</figcaption>
      </figure>
    </section>

    <section class="row">
      <figure v-for="size in sizes" :key="size" class="cell">
        <Nurbling seed="ada@example.com" :size="size" title="ada@example.com" />
        <figcaption>{{ size }}px</figcaption>
      </figure>
    </section>

    <section class="row">
      <figure v-for="background in backgrounds" :key="background" class="cell">
        <Nurbling seed="ada@example.com" :size="64" :background="background" title="ada@example.com" />
        <figcaption>{{ background }}</figcaption>
      </figure>
    </section>

    <section class="row">
      <figure class="cell">
        <Nurbling seed="ada@example.com" :size="64" animate title="ada@example.com" />
        <figcaption>Hover me</figcaption>
      </figure>
    </section>
  </main>
</template>

<style>
:root {
  color-scheme: light dark;
}

body {
  margin: 0;
  background: #f7f5f2;
  color: #16161a;
  font-family:
    system-ui,
    -apple-system,
    'Segoe UI',
    Roboto,
    sans-serif;
}

@media (prefers-color-scheme: dark) {
  body {
    background: #16161a;
    color: #f7f5f2;
  }
}

.page {
  max-width: 720px;
  margin: 0 auto;
  padding: 2rem 1rem 4rem;
  text-align: center;
}

h1 {
  margin-bottom: 0.25rem;
}

.tagline {
  margin-top: 0;
  opacity: 0.8;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
  gap: 1.5rem 1rem;
  margin-top: 2rem;
}

.row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-end;
  gap: 1.5rem;
  margin-top: 2.5rem;
}

.cell {
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
}

.cell figcaption {
  font-size: 0.75rem;
  opacity: 0.75;
  word-break: break-word;
}
</style>
