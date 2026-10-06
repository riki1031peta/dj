// デッキ1台分。<video>タグで再生して、その音をEQ・フェーダーにつなぐ方式
// 音の流れ: 再生タグ → EQ(low) → フェーダー → 出力
// スマホのバックグラウンド再生や、動画ファイルの音にも強い
export const useDeck = (ctx: AudioContext, out: AudioNode) => {
  const el = document.createElement('video') // 画面には出さない
  el.setAttribute('playsinline', '')
  el.preload = 'auto'

  const low = ctx.createBiquadFilter()
  low.type = 'lowshelf'
  low.frequency.value = 200
  const fader = ctx.createGain() // クロスフェーダー用

  ctx.createMediaElementSource(el).connect(low)
  low.connect(fader)
  fader.connect(out)

  let url = ''

  const state = reactive({
    title: '',
    error: '',
    playing: false,
    tempo: 1, // 0.8〜1.2
    lowDb: 0, // -30〜+10
  })

  const applyTempo = () => {
    el.defaultPlaybackRate = state.tempo
    el.playbackRate = state.tempo
  }

  // ロック画面や通知に曲名と再生ボタンを出す
  const setupMediaSession = () => {
    if (!('mediaSession' in navigator)) return
    navigator.mediaSession.metadata = new MediaMetadata({ title: state.title || 'ドットDJ' })
    navigator.mediaSession.setActionHandler('play', () => play())
    navigator.mediaSession.setActionHandler('pause', () => el.pause())
  }

  el.onplay = () => { state.playing = true }
  el.onpause = () => { state.playing = false }
  el.onended = () => { state.playing = false }
  el.onerror = () => {
    if (!el.src) return
    state.title = ''
    state.error = 'このファイルは よめないよ（MP3かWAVを ためしてね）'
  }
  el.onloadedmetadata = applyTempo

  const stop = () => {
    el.pause()
    if (el.src) el.currentTime = 0
    state.playing = false
  }

  const load = async (file: File) => {
    stop()
    state.error = ''
    if (url) URL.revokeObjectURL(url)
    url = URL.createObjectURL(file)
    el.src = url
    state.title = file.name.replace(/\.[^.]+$/, '')
    applyTempo()
  }

  const play = async () => {
    if (!el.src || state.error) return
    await ctx.resume()
    try {
      await el.play()
      setupMediaSession()
    } catch {
      state.error = 'ながせなかったよ。もういちど おしてみてね'
    }
  }

  const toggle = () => (el.paused ? play() : el.pause())

  watch(() => state.tempo, applyTempo)
  watch(() => state.lowDb, (db) => { low.gain.value = db })

  return reactive({ ...toRefs(state), fader, load, toggle, stop })
}