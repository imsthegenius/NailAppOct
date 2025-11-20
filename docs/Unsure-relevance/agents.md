# Agent Notes

- **CameraScreen mount sequencing**: Do not remove the `onLayout` + `hasLaidOut` gate or the `shouldRenderCamera` focus check. The camera must only mount after layout and focus to prevent native crashes on device.
