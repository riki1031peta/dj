<script setup lang="ts">
const ctx = new AudioContext()
const master = ctx.createGain()
master.connect(ctx.destination)

const deckA = useDeck(ctx, master)
const deckB = useDeck(ctx, master)

// 0 = Aだけ / 100 = Bだけ。真ん中でも音が小さくならない配分
const cross = ref(50)
watchEffect(() => {
  const x = (cross.value / 100) * (Math.PI / 2)
  deckA.fader.gain.value = Math.cos(x)
  deckB.fader.gain.value = Math.sin(x)
})
</script>

<template>
  <main class="wrap">
    <h1>DJなんてなにもワからない</h1>

    <ol class="guide">
      <li>それぞれの デッキで きょくを えらぶ</li>
      <li>「ながす」を おす</li>
      <li>したの つまみで Aから Bへ きりかえよう</li>
    </ol>

    <div class="decks">
      <Deck label="A" :deck="deckA" />
      <Deck label="B" :deck="deckB" />
    </div>

    <section class="panel cross">
      <span>A</span>
      <input v-model.number="cross" type="range" min="0" max="100" />
      <span>B</span>
    </section>
  </main>
</template>
