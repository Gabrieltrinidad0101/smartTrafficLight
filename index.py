from onvif import ONVIFCamera

camera = ONVIFCamera('10.0.0.134', 8000, 'gabriel', 'camara2026')
media = camera.create_media_service()
profiles = media.GetProfiles()

for profile in profiles:
    print(f"Perfil: {profile.Name}")
    stream_uri = media.GetStreamUri({'StreamSetup': {'Stream': 'RTP-Unicast', 'Transport': {'Protocol': 'RTSP'}}, 'ProfileToken': profile.token})
    print(f"  RTSP URL: {stream_uri.Uri}")