const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn, execSync } = require('child_process');
const isDev = process.env.NODE_ENV === "development" || !require("electron").app.isPackaged;

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
  const openVPNCommand = isDev
    ? path.join("C:", "Program Files", "OpenVPN", "bin", "openvpn.exe")
    : path.join(process.resourcesPath, "resources", "openvpn", "bin", "openvpn.exe");

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
# Generated on Thu Dec 12 16:51:01 2024 by 4b5756a4e626
# Note: this config file contains inline private keys
#       and therefore should be kept confidential!
#       Certificate serial: 7990393095499097529, certificate common name: test
#       Expires 2034-12-10 16:51:01
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
redirect-gateway def1
dhcp-option DNS 8.8.8.8
dhcp-option DNS 8.8.4.4
remote-cert-tls server
tls-version-min 1.2
reneg-sec 604800
tun-mtu 1500
auth-user-pass
verb 3
push-peer-info
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
MIIBnDCCASKgAwIBAgIIbuOUL3j1JbkwCgYIKoZIzj0EAwIwFTETMBEGA1UEAwwK
T3BlblZQTiBDQTAeFw0yNDEyMTExNjUxMDFaFw0zNDEyMTAxNjUxMDFaMA8xDTAL
BgNVBAMMBHRlc3QwdjAQBgcqhkjOPQIBBgUrgQQAIgNiAATKGqzPbkUf2h50ByPo
sM6xsinoNYouUgwEeHr9OuQWl9/lmJc1S1pNBOXNHIpETXPZ+YPDAh3q404G0S36
b4Yui60U1iQpQkBR27hF+VnCgjiwqRNPLjLVtLGDdgqVl2KjRTBDMAwGA1UdEwEB
/wQCMAAwCwYDVR0PBAQDAgeAMBMGA1UdJQQMMAoGCCsGAQUFBwMCMBEGCWCGSAGG
+EIBAQQEAwIHgDAKBggqhkjOPQQDAgNoADBlAjEA8ZnuUejCGYi2AbpjY0CI2BN7
gU0XT/vQQExek3ff5jN3V84VkAiKdFo1hvFhj3GuAjBPs7gxTqfJFmjSZATFmgs8
E1Ct3jvcnWCL4F0nNBJiyaifTYYNxa+HFQfJmbgxcX0=
-----END CERTIFICATE-----
</cert>
<key>
-----BEGIN PRIVATE KEY-----
MIG2AgEAMBAGByqGSM49AgEGBSuBBAAiBIGeMIGbAgEBBDCdVVaUrPBw/XII+VWK
zoM1SKvjK4Xm/n+3w0tDk333RtYrc9dZ5Y/NF5PYKUjjCQGhZANiAATKGqzPbkUf
2h50ByPosM6xsinoNYouUgwEeHr9OuQWl9/lmJc1S1pNBOXNHIpETXPZ+YPDAh3q
404G0S36b4Yui60U1iQpQkBR27hF+VnCgjiwqRNPLjLVtLGDdgqVl2I=
-----END PRIVATE KEY-----
</key>
<tls-crypt-v2>
-----BEGIN OpenVPN tls-crypt-v2 client key-----
NioyGBX4tRXoc6SRR0hmFVC2gJ25Uk4dSPePnOpbhx5zEgL+Qbd4uDBoVYwOupjZ
vKAtcYKHKKshe8DWMdE+C7mOd7V7SFxOt5DQ0CaejF4MFdcgoneCqqFfEJr525hu
uJJQiE/SuN4VgCBuF4gsPpjaHCD4MUmKHBPVDt/F8kAqtZoSrrqLHYjIYDiZwTWF
yeTFBehO5HLuLhxLXO+9qwIwuUYlkDD+9HGNw4jS3Uq0MljEpbApdGsrv5OfRhjP
TEz5NmwG1CkG6UaGdVSSJ95UxSrR6VlAmpXKylT5a7/El5B63MK44VwOj/TonhXi
6K6d/mF3MvnSn2jsTf40iHPvO7ms/3MYfrJgR6327WgeynYfk1e7qj3jerKYsuQ/
Hbf7cork2g+JYo+VVgJZWoeQOH0FlU6YJk1BVtSPR/Yb8j/gr6pPhsoX7eILlKhs
+qA09Kp3IQHjZt/y+D3NoozfstX0+tyCxS/cMfXyQktyKC7+2Sc5fVbO+xFyi/Bo
JR/9NVj3z9ePnbMwtPbU4M5oHuHp346UiPC66J80EF0UOkil57mYCjLYhUEqD6+5
6DrOxp/apvoXY+T4bBeE4FI4B3BHCM2ENhIBYgfxyJg8BDsyEczRfeAh8GO9lYw5
IbK86DY6u50hteMxnqI+U6eplYscveQtkM2vuCQC0ArzzSYxUMPpJe4o1aheoGnl
AxvMnzGVgjsAv/YYDK8WnF3Ud2aNywUDr1m2q0TF+gMeJITr8UOCxd7tL1RnEDwr
zHpfzIGb/y1HPw4OJSg9cO3iI/bRVMMBWQ==
-----END OpenVPN tls-crypt-v2 client key-----
</tls-crypt-v2>
## -----BEGIN RSA SIGNATURE-----
## DIGEST:sha256
## MGYCMQDrvhhq64Q3wgFr5Te6tSaN8k/qKuQkHO8QGK66xmMd+Y
## Pdo7btIyBQTLXCUterOVkCMQCWThrCuyOndU/UtsV5wpAaUwBm
## KQp/cf8vEI5XK6VRiklVc6rtC3v/dzYxu7+onAk=
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
    console.log("KIAUSAI");
    setTimeout(() => {
      connectButton.src = "Images/connection.png";
    }, 50);
  }
}
