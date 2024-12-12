Section "Install OpenVPN"
  DetailPrint "Installing OpenVPN..."
  ExecWait '"msiexec" /i "$INSTDIR/resources/resources/openvpn-installer.msi" /quiet /norestart'
  DetailPrint "Installing OpenVPN from: $INSTDIR\resources\openvpn-installer.msi"
SectionEnd