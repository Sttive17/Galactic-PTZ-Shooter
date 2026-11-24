import { useEffect, useState } from 'react';
import { getDeviceProfile } from '../game/deviceProfile';
import type { DeviceProfile } from '../game/deviceProfile';

const profilesMatch = (left: DeviceProfile, right: DeviceProfile) =>
  left.inputMode === right.inputMode &&
  left.screenLayout === right.screenLayout &&
  left.orientation === right.orientation;

export const useDeviceProfile = () => {
  const [profile, setProfile] = useState(getDeviceProfile);

  useEffect(() => {
    const updateProfile = () => {
      const nextProfile = getDeviceProfile();
      setProfile((currentProfile) =>
        profilesMatch(currentProfile, nextProfile) ? currentProfile : nextProfile
      );
    };

    window.addEventListener('resize', updateProfile, { passive: true });
    window.addEventListener('orientationchange', updateProfile);

    return () => {
      window.removeEventListener('resize', updateProfile);
      window.removeEventListener('orientationchange', updateProfile);
    };
  }, []);

  return profile;
};
