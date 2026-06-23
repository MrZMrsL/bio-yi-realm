/**
 * 跨平台音效适配器
 * H5 继续使用 Web Audio API 合成音效
 * 小程序/App 暂用静音占位，后续可替换为预置音频文件
 */

function noop() {}

const noops = {
  setSoundEnabled: noop,
  isSoundEnabled: () => false,
  sfxClick: noop,
  sfxCorrect: noop,
  sfxWrong: noop,
  sfxCritical: noop,
  sfxLevelUp: noop,
  sfxItemGet: noop,
  sfxSplash: noop,
  sfxHit: noop,
  sfxCaptureSuccess: noop,
  sfxCaptureFail: noop,
  sfxStart: noop,
  unlockAudio: noop,
  attachAudioUnlockListeners: noop,
}

// #ifdef H5
import * as h5Audio from '../utils/audio.ts'
// #endif

function getApi() {
  // #ifdef H5
  return h5Audio
  // #endif
  // #ifndef H5
  return noops
  // #endif
}

export const setSoundEnabled = enabled => getApi().setSoundEnabled(enabled)
export const isSoundEnabled = () => getApi().isSoundEnabled()
export const sfxClick = () => getApi().sfxClick()
export const sfxCorrect = () => getApi().sfxCorrect()
export const sfxWrong = () => getApi().sfxWrong()
export const sfxCritical = () => getApi().sfxCritical()
export const sfxLevelUp = () => getApi().sfxLevelUp()
export const sfxItemGet = () => getApi().sfxItemGet()
export const sfxSplash = () => getApi().sfxSplash()
export const sfxHit = () => getApi().sfxHit()
export const sfxCaptureSuccess = () => getApi().sfxCaptureSuccess()
export const sfxCaptureFail = () => getApi().sfxCaptureFail()
export const sfxStart = () => getApi().sfxStart()
export const unlockAudio = () => getApi().unlockAudio()
export const attachAudioUnlockListeners = () => getApi().attachAudioUnlockListeners()
