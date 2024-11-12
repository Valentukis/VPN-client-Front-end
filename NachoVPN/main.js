const { app, BrowserWindow, Menu } = require("electron");

const isMac = process.platform === "darwin";

// Create the main window
function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    useContentSize: true,
    webPreferences: {
      nodeIntegration: true, // Enable Node integration
      contextIsolation: false, // Disable context isolation
    },
  });

  // Load your HTML file
  mainWindow.loadFile("index.html");

  const { width, height } = mainWindow.getContentBounds();
  console.log(width, height);
}

// App ready
app.whenReady().then(() => {
  createMainWindow();

  // implement menu
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
