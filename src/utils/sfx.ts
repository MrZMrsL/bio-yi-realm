// sfx.js - 音效封装层，委托给跨平台音频适配器
export {
  sfxClick,
  sfxCorrect,
  sfxWrong,
  sfxCritical,
  sfxLevelUp,
  sfxItemGet,
  sfxSplash,
  sfxHit,
  sfxCaptureSuccess,
  sfxCaptureFail,
  sfxStart,
  setSoundEnabled,
  isSoundEnabled,
} from '../platform/audio.js'
