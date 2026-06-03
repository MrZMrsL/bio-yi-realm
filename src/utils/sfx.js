// sfx.js - 音效封装层，委托给 audio.js 的真实实现
// 所有音效函数重新导出 audio.js 中的实现
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
  setSoundEnabled,
  isSoundEnabled
} from './audio.js'
