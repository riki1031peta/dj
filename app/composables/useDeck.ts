// デッキ1台分。音の流れ: 曲 → EQ(low) → フェーダー → 出力
// 機能を増やすときは、ここにノードを足して connect の鎖に挟むだけ
export const useDeck = (ctx: AudioContext, out: AudioNode) => {
  const low = ctx.createBiquadFilter()
  low.type = 'lowshelf'
  low.frequency.value = 200
  const fader = ctx.createGain() // クロスフェーダー用
  low.connect(fader)
  fader.connect(out)

  let buffer: AudioBuffer | null = null
  let source: AudioBufferSourceNode | null = null
  let startedAt = 0 // 再生開始した時刻
  let offset = 0 // 曲の中の再生位置（秒）

  const state = reactive({
    title: '',
    error: '',
    playing: false,
    tempo: 1, // 0.8〜1.2
    lowDb: 0, // -30〜+10
  })

  const stop = () => {
    if (source) { source.onended = null; source.stop(); source = null }
    state.playing = false
    offset = 0
  }

const load = async (file: File) => {
  stop()
  state.error = ''
  try {
    buffer = await ctx.decodeAudioData(await file.arrayBuffer())
    state.title = file.name.replace(/\.[^.]+$/, '')
  } catch {
    buffer = null
    state.title = ''
    state.error = 'このファイルは よめないよ（MP3かWAVを ためしてね）'
  }
}

  const play = async () => {
    if (!buffer || state.playing) return
    await ctx.resume()
    source = ctx.createBufferSource()
    source.buffer = buffer
    source.playbackRate.value = state.tempo
    source.connect(low)
    source.onended = () => { state.playing = false; offset = 0 }
    startedAt = ctx.currentTime
    source.start(0, offset)
    state.playing = true
  }

  const pause = () => {
    if (!source) return
    offset += (ctx.currentTime - startedAt) * state.tempo
    source.onended = null
    source.stop()
    source = null
    state.playing = false
  }

  const toggle = () => (state.playing ? pause() : play())

  watch(() => state.tempo, (now, before) => {
    if (!source) return
    offset += (ctx.currentTime - startedAt) * before // 変更前の速さで進んだ分を確定
    startedAt = ctx.currentTime
    source.playbackRate.value = now
  })
  watch(() => state.lowDb, (db) => { low.gain.value = db })

  return reactive({ ...toRefs(state), fader, load, toggle, stop })
}
