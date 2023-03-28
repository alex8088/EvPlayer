import { app, BrowserWindow, Menu } from 'electron'
import path from 'path'
import { electronApp, optimizer, is, platform } from '@electron-toolkit/utils'

import icon from '../../resources/icons/icon.png?asset'

import { getVideoFromPath } from './utils'
import ipc from './ipc'

import { IpcEvents } from '../common/ipcEvents'

let mainWindow: BrowserWindow | null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    title: 'EvPlayer',
    width: 860,
    height: 520,
    minWidth: 640,
    minHeight: 420,
    show: false,
    frame: platform.isLinux,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: {
      x: 8,
      y: 8
    },
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      webSecurity: false,
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.on('dom-ready', () => {
    playVideo()
  })

  mainWindow.on('minimize', () => {
    sendIPC(IpcEvents.EV_PAUSE)
  })

  mainWindow.on('maximize', () => {
    sendIPC(IpcEvents.WIN_MAX_REPLY, true)
  })

  mainWindow.on('unmaximize', () => {
    sendIPC(IpcEvents.WIN_MAX_REPLY, false)
  })

  mainWindow.on('close', () => {
    if (mainWindow) mainWindow = null
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
}

function sendIPC(channel: IpcEvents, ...args): void {
  mainWindow?.webContents.send(channel, args)
}

function initApp(): void {
  // Make this app a single instance app.
  const lock = app.requestSingleInstanceLock()

  if (!lock) {
    app.quit()
  } else {
    app.on('second-instance', (_, argv: string[]) => {
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.focus()
        playVideo(argv)
      }
    })

    app.whenReady().then(() => {
      // Set app user model id for windows
      electronApp.setAppUserModelId('ev-player')

      // Default open or close DevTools by F12 in development
      // and ignore CommandOrControl + R in production.
      // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
      app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window)
      })

      if (platform.isMacOS) {
        Menu.setApplicationMenu(Menu.buildFromTemplate([]))
      }

      optimizer.registerFramelessWindowIpc()

      ipc.register()

      createWindow()

      app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
      })
    })

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit()
      }
    })

    // For macOS open file
    app.on('open-file', (e, path) => {
      e.preventDefault()
      macOpenVideoURI = path
      if (mainWindow) {
        mainWindow.show()
        playVideo()
      } else {
        createWindow()
      }
    })
  }
}

let macOpenVideoURI = ''

function resolveOpenedPathFromArgs(argv?: string[]): string {
  if (platform.isMacOS) {
    const uri = macOpenVideoURI
    macOpenVideoURI = ''
    return uri
  }
  const args = argv || process.argv
  const uri = args.find((arg) => arg.startsWith('--uri='))
  if (uri) {
    return uri.substring(6)
  }
  return args.pop() || ''
}

function playVideo(args?: string[]): void {
  const path = resolveOpenedPathFromArgs(args)
  if (path) {
    const video = getVideoFromPath(path)
    if (video) sendIPC(IpcEvents.EV_PLAY, [video])
  }
}

initApp()
