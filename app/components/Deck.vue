<script setup lang="ts">
const props = defineProps<{ label: string; deck: any }>()

const onFile = (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) props.deck.load(file)
  input.value = ''
}
</script>

<template>
  <section class="panel deck">
    <h2>デッキ {{ label }}</h2>

    <div class="disc" :class="{ spin: deck.playing }"></div>

    <p class="title">{{ deck.title || 'きょくを えらんでね' }}</p>
    <p v-if="deck.error" class="error">{{ deck.error }}</p>

    <label class="btn">
      きょくを えらぶ
      <input type="file" accept="audio/*,video/*" hidden @change="onFile" />
    </label>

    <button class="btn play" :class="{ on: deck.playing }" @click="deck.toggle()">
      {{ deck.playing ? '■ とめる' : '▶ ながす' }}
    </button>

    <label class="slider">
      はやさ {{ Math.round(deck.tempo * 100) }}%
      <input v-model.number="deck.tempo" type="range" min="0.8" max="1.2" step="0.01" />
    </label>

    <label class="slider">
      ていおん {{ deck.lowDb }}dB
      <input v-model.number="deck.lowDb" type="range" min="-30" max="10" step="1" />
    </label>
  </section>
</template>
