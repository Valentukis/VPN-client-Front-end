const path = require("path");
const { app, BrowserWindow, Menu } = require("electron");
const electronReload = require("electron-reload");

const isDev = process.env.NODE_ENV === "production";
const isMac = process.platform === "darwin";

electronReload(__dirname, {
  electron: path.join(__dirname, "node_modules", ".bin", "electron"),
});

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

  // Open dev tools if in dev env
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Load your HTML file
  mainWindow.loadFile("index.html");

  // const { width, height } = mainWindow.getContentBounds();
  // console.log(width, height);
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
