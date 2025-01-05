const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn, execSync } = require('child_process');

let vpnProcess = null; // Track the VPN process globally
const credentialsPath = path.join(os.homedir(), 'Documents', 'credentials.txt'); // Credentials path

document.addEventListener('DOMContentLoaded', () => {
  const connectButton = document.getElementById('connectButton');

  initializeVPNState(); // Sync state with existing processes on page load

  if (connectButton) {
    connectButton.addEventListener('click', () => {
      if (vpnProcess || localStorage.getItem('vpnStatus') === 'connected') {
        disconnectFromVPN();
      } else {
        connectToVPN();
      }
    });
  }
});

function initializeVPNState() {
  console.log('Initializing VPN state...');
  const isStoredConnected = localStorage.getItem('vpnStatus') === 'connected';
  const isProcessRunning = checkOpenVPNProcess();

  if (isStoredConnected && isProcessRunning) {
    console.log('VPN is connected, syncing button state...');
    updateButtonState(true);
  } else if (isStoredConnected && !isProcessRunning) {
    console.log('No OpenVPN process running, resetting state...');
    localStorage.removeItem('vpnStatus');
    updateButtonState(false);
  } else if (!isStoredConnected && isProcessRunning) {
    console.log('Stray OpenVPN process found. Terminating...');
    forceTerminateOpenVPN();
    updateButtonState(false);
  } else {
    updateButtonState(false);
  }
}

function checkOpenVPNProcess() {
  try {
    const result = execSync('tasklist /FI "IMAGENAME eq openvpn.exe"', { encoding: 'utf-8' });
    return result.toLowerCase().includes('openvpn.exe');
  } catch (error) {
    console.error('Error checking OpenVPN process:', error);
    return false;
  }
}

function forceTerminateOpenVPN() {
  try {
    execSync('taskkill /IM openvpn.exe /F', { stdio: 'inherit' });
    console.log('Stray OpenVPN process terminated.');
  } catch (error) {
    console.error('Failed to terminate OpenVPN process:', error);
  }
}

function connectToVPN() {
  // Create credentials file
  const credentialsContent = 'test\ntest';
  fs.writeFileSync(credentialsPath, credentialsContent);

  // Generate OpenVPN configuration
  const vpnConfigPath = generateVPNConfig();

  // Determine OpenVPN executable path
  const openVPNCommand = path.join("C:", "Program Files", "OpenVPN", "bin", "openvpn.exe");

  const openVPNArgs = ['--config', vpnConfigPath];

  vpnProcess = spawn(openVPNCommand, openVPNArgs);

  vpnProcess.stdout.on('data', (data) => {
    console.log(`OpenVPN Output: ${data.toString()}`);
    if (data.toString().includes('Peer Connection Initiated')) {
      localStorage.setItem('vpnStatus', 'connected');
      updateButtonState(true);
    }
  });

  vpnProcess.stderr.on('data', (data) => {
    console.error(`OpenVPN Error: ${data.toString()}`);
  });

  vpnProcess.on('close', (code) => {
    console.log(`OpenVPN process exited with code ${code}`);
    vpnProcess = null;
    localStorage.removeItem('vpnStatus');
    updateButtonState(false);
  });

  vpnProcess.on('error', (error) => {
    console.error('Failed to start OpenVPN process:', error);
    alert('Failed to connect to VPN. Please check your configuration or permissions.');
  });

  alert('Connecting to VPN...');
}

function disconnectFromVPN() {
  if (vpnProcess) {
    vpnProcess.kill('SIGTERM');
    vpnProcess = null;
    alert('Disconnecting from VPN...');
    localStorage.removeItem('vpnStatus');
    updateButtonState(false); // Update button to "disconnected"
  } else if (checkOpenVPNProcess()) {
    console.log('Force disconnecting stray OpenVPN process...');
    forceTerminateOpenVPN();
    alert('Disconnecting from VPN...');
    localStorage.removeItem('vpnStatus');
    updateButtonState(false); // Ensure button switches to "disconnected"
  } else {
    alert('No active VPN process found.');
    localStorage.removeItem('vpnStatus');
    updateButtonState(false); // Ensure button switches to "disconnected"
  }
}

function generateVPNConfig() {
  const vpnConfigContent = `
# Automatically generated OpenVPN client config file
# Generated on Sun Jan  5 13:11:01 2025 by 4b5756a4e626
# Note: this config file contains inline private keys
#       and therefore should be kept confidential!
#       Certificate serial: 7196962871979085263, certificate common name: NachoVPN_AUTOLOGIN
#       Expires 2035-01-03 13:11:01
# Note: this configuration is user-locked to the username below
# OVPN_ACCESS_SERVER_USERNAME=NachoVPN
# Define the profile name of this particular configuration file
# OVPN_ACCESS_SERVER_PROFILE=NachoVPN@79.132.173.139/AUTOLOGIN
# OVPN_ACCESS_SERVER_AUTOLOGIN=1

# Default Cipher
cipher AES-256-CBC
# OVPN_ACCESS_SERVER_CLI_PREF_ALLOW_WEB_IMPORT=True
# OVPN_ACCESS_SERVER_CLI_PREF_BASIC_CLIENT=False
# OVPN_ACCESS_SERVER_CLI_PREF_ENABLE_CONNECT=False
# OVPN_ACCESS_SERVER_CLI_PREF_ENABLE_XD_PROXY=True
# OVPN_ACCESS_SERVER_WSHOST=79.132.173.139:443
# OVPN_ACCESS_SERVER_WEB_CA_BUNDLE_START
# -----BEGIN CERTIFICATE-----
# MIIBzDCCAVGgAwIBAgIEZyul8DAKBggqhkjOPQQDAjA+MTwwOgYDVQQDDDNPcGVu
# VlBOIFdlYiBDQSAyMDI0LjExLjA2IDE3OjIyOjU2IFVUQyA0YjU3NTZhNGU2MjYw
# HhcNMjQxMTA1MTcyMjU2WhcNMzQxMTA0MTcyMjU2WjA+MTwwOgYDVQQDDDNPcGVu
# VlBOIFdlYiBDQSAyMDI0LjExLjA2IDE3OjIyOjU2IFVUQyA0YjU3NTZhNGU2MjYw
# djAQBgcqhkjOPQIBBgUrgQQAIgNiAASZZfIAPnv/kwB8BZ4A0l0FN4UrxhtqTNbI
# SrgaWsntMi6BSMr3j6t5IWaTl/3Dw5WE1m3dlBbfgVYGxSESs0KQCLy8jnipm51O
# 7QAWt1w26weeNegvzQcrXgA5XLEdi2yjIDAeMA8GA1UdEwEB/wQFMAMBAf8wCwYD
# VR0PBAQDAgEGMAoGCCqGSM49BAMCA2kAMGYCMQDnRXC/UumfIRt6H6eq4dyuuJuy
# +S99GI9o0u77aavn9NzTqMhXlcBghR6slD1o7EcCMQDk+3Lv3etD04XRwXV55TLt
# SRyt+nNjmKOYSLpcflmYpztXitQkZv7N/1DqtDn+agI=
# -----END CERTIFICATE-----
# OVPN_ACCESS_SERVER_WEB_CA_BUNDLE_STOP
# OVPN_ACCESS_SERVER_IS_OPENVPN_WEB_CA=1
client
proto tcp
remote 79.132.173.139
port 443
dev tun
dev-type tun
remote-cert-tls server
tls-version-min 1.2
reneg-sec 604800
tun-mtu 1500
verb 3
push-peer-info

<ca>
-----BEGIN CERTIFICATE-----
MIIBeDCB/6ADAgECAgRnK6XoMAoGCCqGSM49BAMCMBUxEzARBgNVBAMMCk9wZW5W
UE4gQ0EwHhcNMjQxMTA1MTcyMjQ4WhcNMzQxMTA0MTcyMjQ4WjAVMRMwEQYDVQQD
DApPcGVuVlBOIENBMHYwEAYHKoZIzj0CAQYFK4EEACIDYgAEl8c+xq1Dxc+U7EHq
s8ERGOApIxIceexTAtqYl3cRa2bYr5auZQwTAn6qrk9501f/8zsOWAMrHgRRNxMF
E31cFmY6spsFG3fNdG7+Vh9DghQBM3G6wSfAyKom+/jA6sPdoyAwHjAPBgNVHRMB
Af8EBTADAQH/MAsGA1UdDwQEAwIBBjAKBggqhkjOPQQDAgNoADBlAjEA9/hYskEN
qc9zKnYDCaVWwXVxpIYDiSB0Ib8j8SdVPYkszlTdlbWiEzUbiNSQ4Xc5AjB582Z5
CTMoTttiv+Ys+Vy1A/Gw4MVuu3UIYOxPls3SubDscJLIggPHuo0Sp/8RuhA=
-----END CERTIFICATE-----
</ca>
<cert>
-----BEGIN CERTIFICATE-----
MIIBqzCCATCgAwIBAgIIY+C/mdX9Dc8wCgYIKoZIzj0EAwIwFTETMBEGA1UEAwwK
T3BlblZQTiBDQTAeFw0yNTAxMDQxMzExMDFaFw0zNTAxMDMxMzExMDFaMB0xGzAZ
BgNVBAMMEk5hY2hvVlBOX0FVVE9MT0dJTjB2MBAGByqGSM49AgEGBSuBBAAiA2IA
BEwFhQdkZYNmtzB2CggwecfQyK+G8p0CBnSctYMD2byb2Vx9XRQ8IsR8dPK61gVp
xZREUPaGRf1lTn6Jya9bM/Vlj4dQASh77+qCpqp8kufR324DcX0mTAgCNxv6pUIW
daNFMEMwDAYDVR0TAQH/BAIwADALBgNVHQ8EBAMCB4AwEwYDVR0lBAwwCgYIKwYB
BQUHAwIwEQYJYIZIAYb4QgEBBAQDAgeAMAoGCCqGSM49BAMCA2kAMGYCMQDYH4nW
v+Rq6tZ1p+Bi3xWJQnVdSzUn54SMuK+8eUYAIaua0KoN0r9/3LVaMjuJrw4CMQCj
yuNGboj8JF+FTdIUbDA+1h9xIXGpHXQ+wy5NnyoP4tJ2grC1JEV+uFaCuGyuVZs=
-----END CERTIFICATE-----
</cert>
<key>
-----BEGIN PRIVATE KEY-----
MIG2AgEAMBAGByqGSM49AgEGBSuBBAAiBIGeMIGbAgEBBDAai+Q41YCFjCr6vDUK
jOTNmaTPEsKfGMLpca5PCiMbnY19xyd8yDnlOj/ahP8OZuehZANiAARMBYUHZGWD
ZrcwdgoIMHnH0MivhvKdAgZ0nLWDA9m8m9lcfV0UPCLEfHTyutYFacWURFD2hkX9
ZU5+icmvWzP1ZY+HUAEoe+/qgqaqfJLn0d9uA3F9JkwIAjcb+qVCFnU=
-----END PRIVATE KEY-----
</key>
<tls-crypt-v2>
-----BEGIN OpenVPN tls-crypt-v2 client key-----
Hnn9SoLF6/soPch0+dgu1lwox0bgVx8XkV7eJTLD6kYF5PtwQm3q9suaOEcyXlqx
E6wAgmFcJN48oeIfML+UZGJ6Manli6XwOBigRczjCKETzNHvZtlR3xa6+Bmmk9Td
I/1yJGDuLlOLnuEbmpuKmg/Ttgg4U+foSqIHgCV0KjpalXGASX5z7+D8ckrV0zNy
NdPYSHC6GWwJtnehEVCdaXdH7M1GzjCNxW8YU1EupStYMluUcFBR4qyZe8Pn/1KJ
OjfO409ConYpc+tj3dveJUVsovw3x6bWI3ED+erH/hzIx+qUH7x46i/q/cEHWREA
6KlSBqCV9ZNJAPi675nE55FZeBYfNwjzZRP6ruq6NZsafq1aPFtDnI+U/jieNzFn
7D7TGUaosR6GdX6MBth9YvdChoeFp+y7c5cuCoLGAmiDo7TtldX4J4PwOYFm4gyp
2Za8YwNy2je91ZiPt35bo5VqUPvFse+R9mSa8KfQb341sEVbl4TPy+Dm7fbpM1bn
HUjFB9j3+nJ28O/mfshs6A2IdPJNHXhTLB+aTYp5r5AP2JKB3WNwU8o5gEG1cyou
tzoBx74iIoDKZWyGMp/KwlnxLXLLsrQt3bOiBcoCPycYBKLk5xBOJb1SsKXpn2vP
CLKR2/tdjfPoYOxAnesnHi6gANUkbZxjVDajSU1M4LV4RJ7xbkmorWJoVtliR9+I
ArCXG0pbSYIpKRi6XHiYsAJnbOt4aL0knueWieWL4WqVm4iXNHH/9v56AIyc5aAt
OBaU75MoEjUgD1AWE1wPm0ZFQ6YIlEMBWQ==
-----END OpenVPN tls-crypt-v2 client key-----
</tls-crypt-v2>
## -----BEGIN RSA SIGNATURE-----
## DIGEST:sha256
## MGUCMApLaID+KaB2TZoGU7QHmha+gvDt6ZTcQJ0PT6DCj7GqpL
## qluBAyBlibAA93ho08DwIxANCVRtAwdzDS6PgTNyfe29JweZX7
## 6OrPQb325YRo/aru/3LrvbNZJ5e1Rohvr5hpXQ==
## -----END RSA SIGNATURE-----
## -----BEGIN CERTIFICATE-----
## MIIB1DCCAVqgAwIBAgIFAM5bp3swCgYIKoZIzj0EAwIwPjE8MDoGA1UEAwwzT3Bl
## blZQTiBXZWIgQ0EgMjAyNC4xMS4wNiAxNzoyMjo1NiBVVEMgNGI1NzU2YTRlNjI2
## MB4XDTI0MTEwNTE4MTk1N1oXDTI1MTEwNjE4MTk1N1owGTEXMBUGA1UEAwwONzku
## MTMyLjE3My4xMzkwdjAQBgcqhkjOPQIBBgUrgQQAIgNiAARusSFrpCBQaVmyTZb4
## 7uUdvOPO8JElFXVTh3lbtFD5pz0Zcz9kkoKCey1yKL6VPwyE73o13CDn8L2/gOGL
## bLL8JwBH9EBZpAgRPIx7cgjcFuVNA41LNaABpcBrczpirKejTTBLMAwGA1UdEwEB
## /wQCMAAwCwYDVR0PBAQDAgWgMBMGA1UdJQQMMAoGCCsGAQUFBwMBMBkGA1UdEQQS
## MBCCDjc5LjEzMi4xNzMuMTM5MAoGCCqGSM49BAMCA2gAMGUCMAdU1ARBh/TTI7Rc
## BuLq88E5ynarH7Y0NWqy1u/nRiUA51FpPHtxAlXwDiOt1MdiKgIxAP6n72Ai7FrR
## CU5tDTK62KBDCdX6+HvJQRar9o28MD/Ni0x0lSJJRxgK58ZQzLOdfg==
## -----END CERTIFICATE-----
## -----BEGIN CERTIFICATE-----
## MIIBzDCCAVGgAwIBAgIEZyul8DAKBggqhkjOPQQDAjA+MTwwOgYDVQQDDDNPcGVu
## VlBOIFdlYiBDQSAyMDI0LjExLjA2IDE3OjIyOjU2IFVUQyA0YjU3NTZhNGU2MjYw
## HhcNMjQxMTA1MTcyMjU2WhcNMzQxMTA0MTcyMjU2WjA+MTwwOgYDVQQDDDNPcGVu
## VlBOIFdlYiBDQSAyMDI0LjExLjA2IDE3OjIyOjU2IFVUQyA0YjU3NTZhNGU2MjYw
## djAQBgcqhkjOPQIBBgUrgQQAIgNiAASZZfIAPnv/kwB8BZ4A0l0FN4UrxhtqTNbI
## SrgaWsntMi6BSMr3j6t5IWaTl/3Dw5WE1m3dlBbfgVYGxSESs0KQCLy8jnipm51O
## 7QAWt1w26weeNegvzQcrXgA5XLEdi2yjIDAeMA8GA1UdEwEB/wQFMAMBAf8wCwYD
## VR0PBAQDAgEGMAoGCCqGSM49BAMCA2kAMGYCMQDnRXC/UumfIRt6H6eq4dyuuJuy
## +S99GI9o0u77aavn9NzTqMhXlcBghR6slD1o7EcCMQDk+3Lv3etD04XRwXV55TLt
## SRyt+nNjmKOYSLpcflmYpztXitQkZv7N/1DqtDn+agI=
## -----END CERTIFICATE-----
`;

  const vpnConfigPath = path.join(os.homedir(), 'Documents', 'user-config.ovpn');
  fs.writeFileSync(vpnConfigPath, vpnConfigContent);
  return vpnConfigPath;
}

function updateButtonState(isConnected) {
  const connectButton = document.getElementById('connectButton');
  if (isConnected) {
    connectButton.src = "Images/connection_clicked.png";
  } else {
    connectButton.src = "Images/connection.png";
    setTimeout(() => {
      connectButton.src = "Images/connection.png";
    }, 50);
  }
}
