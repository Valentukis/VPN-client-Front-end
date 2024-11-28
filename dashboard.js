const fs = require('fs');
const path = require('path');
const os = require('os'); // Import the os module to get the Documents folder path

document.addEventListener('DOMContentLoaded', () => {
  const connectButton = document.getElementById('connectButton');

  if (connectButton) {
    connectButton.addEventListener('click', () => {
      // Generate OpenVPN configuration content
      const vpnConfig = `
client
dev tun
proto udp
remote your-server-address 1194
resolv-retry infinite
nobind
persist-key
persist-tun
remote-cert-tls server
cipher AES-256-CBC
auth SHA256
verb 3
<ca>
# Insert Certificate Authority (CA) content here
</ca>
<cert>
# Insert Client Certificate here
</cert>
<key>
# Insert Private Key here
</key>
<tls-auth>
# Insert TLS Auth Key here
</tls-auth>
key-direction 1
      `;

      // Save the file to the user's Documents folder
      const documentsPath = path.join(os.homedir(), 'Documents'); // Get the Documents folder path
      const filePath = path.join(documentsPath, 'user-config.ovpn'); // Path for the .ovpn file

      // Write the configuration to the file
      fs.writeFile(filePath, vpnConfig, (err) => {
        if (err) {
          console.error('Error writing VPN configuration:', err);
          alert('Failed to generate VPN configuration file!');
        } else {
          console.log('VPN configuration saved at:', filePath);
          alert(`VPN configuration file generated and saved successfully in: ${filePath}`);
        }
      });
    });
  }
});
