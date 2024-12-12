const fs = require('fs');
const path = require('path');
const os = require('os'); // Import the os module to get the Documents folder path
const { exec } = require('child_process'); // Import child_process for running commands

document.addEventListener('DOMContentLoaded', () => {
  const connectButton = document.getElementById('connectButton');

  if (connectButton) {
    connectButton.addEventListener('click', () => {

     // Create the credentials file
  const credentialsContent = 'username\npassword';
  const credentialsPath = path.join(os.homedir(), 'Documents', 'credentials.txt');

  fs.writeFileSync(credentialsPath, credentialsContent);


      // Generate OpenVPN configuration content
      const vpnConfig = `

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

          // Connect to OpenVPN using the generated file
          connectToVPN(filePath);
        }
      });
    });
  }
});

function connectToVPN(configFilePath) {
  const openVPNCommand = `openvpn --config "${configFilePath}"`; // Command to connect using OpenVPN

  exec('openvpn --version', (error, stdout) => {
    if (error) {
      alert('OpenVPN is not installed or not in the PATH. Please install OpenVPN and try again.');
      return;
    }
    console.log('OpenVPN version:', stdout);
  });

  exec(openVPNCommand, (error, stdout, stderr) => {
    console.log('PATH environment variable:', process.env.PATH);
    if (error) {
      console.error('Error connecting to VPN:', error);
      alert('Failed to connect to VPN. Please ensure OpenVPN is installed and try again.');
      return;
    }

    console.log('VPN Connection Output:', stdout);
    console.error('VPN Connection Errors:', stderr);
    alert('Successfully connected to VPN!');
  });
}
