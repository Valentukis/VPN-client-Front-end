const path = require("path");
const { app, BrowserWindow, Menu } = require("electron");
const { exec, spawn } = require("child_process");
const fs = require("fs");

let vpnProcess; // Track the global vpnProcess here

// Check if the environment is development
const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;
const isMac = process.platform === "darwin";

// Only require electron-reload in development
if (isDev) {
  try {
    require("electron-reload")(__dirname, {
      electron: path.join(__dirname, "node_modules", ".bin", "electron"),
    });
  } catch (error) {
    console.error("Failed to load electron-reload:", error);
  }
}

// Path to the OpenVPN executable
const openvpnPath = "C:\\Program Files\\OpenVPN\\bin\\openvpn.exe";
const installerPath = isDev
  ? path.join(__dirname, "resources", "OpenVPN-2.6.12-I001-amd64.msi")
  : path.join(process.resourcesPath, "resources", "OpenVPN-2.6.12-I001-amd64.msi");

function checkAndInstallOpenVPN() {
  console.log("Checking if OpenVPN is installed...");

  // First, check if the OpenVPN executable exists
  if (fs.existsSync(openvpnPath)) {
    console.log("OpenVPN is already installed.");
    return;
  }

  // Run 'openvpn --version' to verify installation
  exec(`"${openvpnPath}" --version`, (error, stdout, stderr) => {
    if (!error && stdout) {
      console.log("OpenVPN is already installed:", stdout);
      return;
    }

    console.warn("OpenVPN is not installed. Launching installer...");

    // Install OpenVPN silently
    const installer = spawn("msiexec", ["/i", installerPath, "/qn"], {
      stdio: "inherit",
      shell: true,
    });

    installer.on("close", (code) => {
      if (code === 0) {
        console.log("OpenVPN installed successfully.");
      } else {
        console.error(`OpenVPN installation failed with exit code ${code}`);
      }
    });

    installer.on("error", (err) => {
      console.error("Failed to launch OpenVPN installer:", err);
    });
  });
}


// Create the main window
function createMainWindow() {
  const mainWindow = new BrowserWindow({
    // width: isDev ? 1200 : 800,
    width: 800,
    height: 600,
    useContentSize: true,
    webPreferences: {
      nodeIntegration: true, // Enable Node integration
      contextIsolation: false, // Disable context isolation
    },
  });

  // Open dev tools if in dev environment
  if (isDev) {
    mainWindow.webContents.openDevTools();
  } /*Cia ryt komparcho pritstatymui, isdev checkas neveikia*/

  // Load your HTML file
  mainWindow.loadFile("index.html");
}

// App ready
app.whenReady().then(() => {
  checkAndInstallOpenVPN(); // Check and install OpenVPN if necessary

  createMainWindow();

  // Implement menu
  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  // Open a window if none are open (macOS)
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

// Menu template
const menu = [
  {
    label: "File",
    submenu: [
      {
        label: "Quit",
        click: () => app.quit(),
        accelerator: "Ctrl+W",
      },
    ],
  },
];

// Handle app closure
app.on("window-all-closed", () => {
  if (!isMac) app.quit();
});

// Terminate OpenVPN process before quitting
app.on("before-quit", () => {
  if (vpnProcess) {
    console.log("Terminating OpenVPN process...");
    vpnProcess.kill("SIGTERM"); // Gracefully terminate OpenVPN
  }
});
