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
# Generated on Fri Dec 20 09:03:31 2024 by 4b5756a4e626
# Note: this config file contains inline private keys
#       and therefore should be kept confidential!
#       Certificate serial: 2513254810476774558, certificate common name: test
#       Expires 2034-12-18 09:03:31
# Note: this configuration is user-locked to the username below
# OVPN_ACCESS_SERVER_USERNAME=test
# Define the profile name of this particular configuration file
# OVPN_ACCESS_SERVER_PROFILE=test@79.132.173.139

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
auth-user-pass ${credentialsPath.replace(/\\/g, '\\\\')}

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
MIIBnTCCASKgAwIBAgIIIuDf7zCChJ4wCgYIKoZIzj0EAwIwFTETMBEGA1UEAwwK
T3BlblZQTiBDQTAeFw0yNDEyMTkwOTAzMzFaFw0zNDEyMTgwOTAzMzFaMA8xDTAL
BgNVBAMMBHRlc3QwdjAQBgcqhkjOPQIBBgUrgQQAIgNiAAQpPzs2+JZFzA4td9at
1VdvkaY+fIyZEH1sga2tFQQso2iPjftI7vJKacqH/nDWrj9EhKe2HFyQSC4/vuSt
JfmDCpbNodWSmJbHgBsXCk2nxReNirJ0F1hIfRs450qZQ9ujRTBDMAwGA1UdEwEB
/wQCMAAwCwYDVR0PBAQDAgeAMBMGA1UdJQQMMAoGCCsGAQUFBwMCMBEGCWCGSAGG
+EIBAQQEAwIHgDAKBggqhkjOPQQDAgNpADBmAjEA/Yec8vQ2F7k1MGBDYQ7xDu0t
r59BT9YMQyM6g2gkQHNmQhXYomeK5SRyjM0C5yaiAjEAjJrHPOwIEexALR9fRHwg
/DImGw7ECzmW6jvYFd0I/NhJT+81y9TurYFYEap/X2bi
-----END CERTIFICATE-----
</cert>
<key>
-----BEGIN PRIVATE KEY-----
MIG2AgEAMBAGByqGSM49AgEGBSuBBAAiBIGeMIGbAgEBBDCYFmG0gGckPRayGFyC
xWEoJc53yKFLxZ5Jfs8YknyfikZneVPz/v8WDBkJeparN7yhZANiAAQpPzs2+JZF
zA4td9at1VdvkaY+fIyZEH1sga2tFQQso2iPjftI7vJKacqH/nDWrj9EhKe2HFyQ
SC4/vuStJfmDCpbNodWSmJbHgBsXCk2nxReNirJ0F1hIfRs450qZQ9s=
-----END PRIVATE KEY-----
</key>
<tls-crypt-v2>
-----BEGIN OpenVPN tls-crypt-v2 client key-----
HntVQM+3RbC38UNbfjj/HHiQlPM4+lMVPhuj+qVnCojqiO2MA+dC1a8B8FAsMZLK
Rb4xcPh4d2P3AwKBQezyuyetCflS2GlQnu+18VNnRZmmXzCxfbyxhMVfmPEel/k+
Suq34/O1xAQ8tif5FkS1L3jE7q+t8E2P4vcavIMgRE/o4kZdN4Bta3Omr81SpIyb
EbiGmq7RTyQbkX/wK62JhyA26cQh5AEFMr+1/JGF7IZRN05tA/Ruam2l6DMyhTik
3Qa5yBdMUljqLcOOv1xEJtqkSidf47uqbEbdI7K1z9C24ID3VQwc4eozv/JDhp2j
ccROJlYbTDILMN70F2tD3HlKrmb37JnEoo4kLfnao7kE9y/X5ekKsnUK6mkhyAXq
e8zdLiiTH56GzK8waTGK8bnewoJIaLmRwTTituvvNekk7n85anKKZ4xKMPI/KIwq
cd/Scso3jqChg46DqYhUq/MZx5Tx4qa+BHOPtOCgVqK+TZ9wKGI6ICYfs7qxXKoH
9SSTC6ohA5isLZFp4V7d9TNn7Rox9bfsRHw+WV2aZXqcPkf71IWHsbI/+9lJPEiz
ghDSW2oFkXNnhFQwvRlxArb0485RHXrnlgWuJbYQvv5txc73qX29AEJugVpVX/Sg
VONfi8AujeIxKyXXXhPM7I4My7thz3Xl3zS77ySUFOpK8E8EGnGsU5irH88JaNvJ
oB8RmGhxTyp+WJbXByPaoWkgYe4a3EHBZ3x9PP9DJr7A/6NohnXEbTstzksXM2nY
otKu7WIbb4ormaeWV7oRdzOZMXt99WgBWQ==
-----END OpenVPN tls-crypt-v2 client key-----
</tls-crypt-v2>
## -----BEGIN RSA SIGNATURE-----
## DIGEST:sha256
## MGUCMDviC4bodMm38LNBSIvUHUIZozJQ7/y8OsdjsZ0jm9B+Zb
## O97AFh6wYlcLQblJFo3AIxAKI/wHhQ3jFS4PjLiXFeBQ2tysuj
## 2EQx7b7+7W/Tt3EFI+zmqSVpmkNCMW/+x9W2Xw==
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
