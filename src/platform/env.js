/**
 * 平台环境检测
 */

export const PLATFORM = {
  H5: 'h5',
  MP_WEIXIN: 'mp-weixin',
  MP_ALIPAY: 'mp-alipay',
  MP_BAIDU: 'mp-baidu',
  MP_TOUTIAO: 'mp-toutiao',
  MP_QQ: 'mp-qq',
  APP: 'app',
  APP_PLUS: 'app-plus',
}

let _platform = null

export function getPlatform() {
  if (_platform) return _platform

  // #ifdef H5
  _platform = PLATFORM.H5
  // #endif

  // #ifdef MP-WEIXIN
  _platform = PLATFORM.MP_WEIXIN
  // #endif

  // #ifdef MP-ALIPAY
  _platform = PLATFORM.MP_ALIPAY
  // #endif

  // #ifdef MP-BAIDU
  _platform = PLATFORM.MP_BAIDU
  // #endif

  // #ifdef MP-TOUTIAO
  _platform = PLATFORM.MP_TOUTIAO
  // #endif

  // #ifdef MP-QQ
  _platform = PLATFORM.MP_QQ
  // #endif

  // #ifdef APP
  _platform = PLATFORM.APP
  // #endif

  // #ifdef APP-PLUS
  _platform = PLATFORM.APP_PLUS
  // #endif

  if (!_platform) {
    _platform = PLATFORM.H5
  }

  return _platform
}

export function isH5() {
  return getPlatform() === PLATFORM.H5
}

export function isMpWeixin() {
  return getPlatform() === PLATFORM.MP_WEIXIN
}

export function isApp() {
  const p = getPlatform()
  return p === PLATFORM.APP || p === PLATFORM.APP_PLUS
}

export function isMiniProgram() {
  const p = getPlatform()
  return (
    p === PLATFORM.MP_WEIXIN ||
    p === PLATFORM.MP_ALIPAY ||
    p === PLATFORM.MP_BAIDU ||
    p === PLATFORM.MP_TOUTIAO ||
    p === PLATFORM.MP_QQ
  )
}
