export interface DeviceProfile {
  inputMode: 'touch' | 'pointer';
  screenLayout: 'compact' | 'wide';
  orientation: 'landscape' | 'portrait';
}

export const getDeviceProfile = (): DeviceProfile => {
  if (typeof window === 'undefined') {
    return { inputMode: 'pointer', screenLayout: 'wide', orientation: 'landscape' };
  }

  const isTouchDevice =
    navigator.maxTouchPoints > 0 ||
    'ontouchstart' in window ||
    window.matchMedia('(pointer: coarse)').matches;

  return {
    inputMode: isTouchDevice ? 'touch' : 'pointer',
    screenLayout: window.innerWidth < 1024 ? 'compact' : 'wide',
    orientation: window.matchMedia('(orientation: landscape)').matches ? 'landscape' : 'portrait',
  };
};
