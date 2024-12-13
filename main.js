const path = require("path");
const { app, BrowserWindow, Menu } = require("electron");

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


// Create the main window
function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: isDev ? 1200 : 800,
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

app.on("window-all-closed", () => {
  if (!isMac) app.quit();
});


app.on('before-quit', () => {
  if (vpnProcess) {
    console.log('Terminating OpenVPN process...');
    vpnProcess.kill('SIGTERM'); // Gracefully terminate OpenVPN
  }
});