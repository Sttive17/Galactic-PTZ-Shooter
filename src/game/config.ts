export const GAME_CONFIG = {
  challengeDuration: 120, // 2 minutes in seconds
  camera: {
    panMin: -180,
    panMax: 180,
    tiltMin: -60,
    tiltMax: 60,
    zoomMin: 1,
    zoomMax: 10,
    panSpeed: 60, // degrees per second at full stick
    tiltSpeed: 45,
    zoomSpeed: 5,
  },
  gamepad: {
    deadzone: 0.15,
  },
  projectile: {
    speed: 185, // units per second
    damage: 1,
    lifetime: 3, // seconds
    radius: 0.35, // collision radius
  }
};
