import { app, BrowserWindow, ipcMain, dialog } from 'electron'
//import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer'
import { enableLiveReload } from 'electron-compile'

import path from 'path'

// const spawn = require('child_process').spawn;
// const pipe = spawn('mongod', [' — dbpath=YourDBPath', ' — port', '27018']);
// pipe.stdout.on('data', function (data) {
//   //console.log(data.toString('utf8'));
// });
// pipe.stderr.on('data', (data) => {
//   //console.log(data.toString('utf8'));
// });
// pipe.on('close', (code) => {
//   //console.log('Process exited with code: '+ code);
// });


import {
  SEND_CREATE_PIECE,
  GET_CREATE_PIECE,
  SEND_ALL_PIECES,
  GET_ALL_PIECES,
  SEND_ONE_PIECE,
  GET_ONE_PIECE,
  GET_UPDATE_PIECE,
  SEND_UPDATE_PIECE,
  GET_DELETE_PIECE,
  SEND_DELETE_PIECE,

  SEND_CREATE_REPORT,
  GET_CREATE_REPORT,
  SEND_ALL_REPORTS,
  GET_ALL_REPORTS,
  SEND_ONE_REPORT,
  GET_ONE_REPORT,
  SEND_UPDATE_REPORT,
  GET_UPDATE_REPORT,
  SEND_DELETE_REPORT,
  GET_DELETE_REPORT,

  SEND_REPORT_PDF,
  GET_REPORT_PDF,

  SEND_BACKUP,
  GET_BACKUP,
  SEND_RESTORE,
  GET_RESTORE

} from './config/utils/constants';

import {
  createPiece,
  getAllPieces,
  getOnePiece,
  updatePiece,
  removePiece } from './controllers/PieceController'

import {
  createReport,
  getAllReports,
  getOneReport,
  updateReport,
  removeReport } from './controllers/ReportController'

import {
  backup,
  restore } from './controllers/ServicesController'



app.setAppUserModelId("com.jeffnts.gerencia-textil")
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

let PDFWindow


const  nodeStatic = require('node-static');
const  file = new nodeStatic.Server(path.join(__dirname, 'public', 'images'))

require('http').createServer(function (request, response) {
  request.addListener('end', function () {
    file.serve(request, response)
  }).resume()
}).listen(9990)

const isDevMode = process.execPath.match(/[\\/]electron/);

if (isDevMode) enableLiveReload({ strategy: 'react-hmr' });

const createWindow = async () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 900,
    icon: './src/public/icon/icon.png',
    show: false
  });


  //mainWindow.setMenu(null)

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`)

  mainWindow.once('ready-to-show', () =>{ mainWindow.show()})
  //mainWindow.webContents.openDevTools();

  // Open the DevTools.
  if (isDevMode) {
    //await installExtension(REACT_DEVELOPER_TOOLS);
    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

};

const createPDFWindow = () =>{
  PDFWindow = new BrowserWindow({
    width: 1280,
    height: 900,
    icon: './src/public/icon/icon.png',
    show: false,
    parent: mainWindow
  });


  PDFWindow.setMenu(null)

  PDFWindow.loadURL(`file://${__dirname}/pdf.html`)

  if (isDevMode) {
    PDFWindow.webContents.openDevTools();
  }


  PDFWindow.once('ready-to-show', () =>{ PDFWindow.show()})


  PDFWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    PDFWindow = null;
  });

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
    //pipe.kill('SIGINT');
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.


//IPC Main Processes

//-------------------Pieces----------------------
ipcMain.on(SEND_CREATE_PIECE, async (event, arg) =>{
  const piece = await createPiece(arg)

  const data  = JSON.stringify(piece)

  event.sender.send(GET_CREATE_PIECE, {data})

})

ipcMain.on(SEND_ALL_PIECES, async (event, arg) =>{
  const { name, page, limit } = arg
  const pieces = await getAllPieces(name, page, limit)

  const data = JSON.stringify(pieces)

  event.sender.send(GET_ALL_PIECES, {data})

})

ipcMain.on(SEND_ONE_PIECE, async (event, arg) =>{
  const piece = await getOnePiece(arg)

  const data = JSON.stringify(piece)

  event.sender.send(GET_ONE_PIECE, {data})

})

ipcMain.on(SEND_UPDATE_PIECE, async (event, arg) =>{
  const { id, values } = arg

  const piece = await updatePiece(id, values)

  const data = JSON.stringify(piece)

  event.sender.send(GET_UPDATE_PIECE, {data})

})


ipcMain.on(SEND_DELETE_PIECE, async (event, arg) =>{
  const piece = await removePiece(arg)

  const data = JSON.stringify(piece)

  event.sender.send(GET_DELETE_PIECE, {data})

})


//-------------------Reports----------------------

ipcMain.on(SEND_CREATE_REPORT, async (event, arg) =>{
  const report = await createReport(arg)

  const data = JSON.stringify(report)

  event.sender.send(GET_CREATE_REPORT, {data})
})


ipcMain.on(SEND_ALL_REPORTS, async (event, arg) =>{
  const { name, page, limit } = arg
  const reports = await getAllReports(name, page, limit)

  const data = JSON.stringify(reports)

  event.sender.send(GET_ALL_REPORTS, {data})
})

ipcMain.on(SEND_ONE_REPORT, async (event, arg) =>{
  const report = await getOneReport(arg)

  const data = JSON.stringify(report)

  event.sender.send(GET_ONE_REPORT, {data})
})

ipcMain.on(SEND_UPDATE_REPORT, async (event, arg) =>{
  const { id, data } = arg
  const report = await updateReport(id, data)

  const result = JSON.stringify(report)

  event.sender.send(GET_UPDATE_REPORT, {result})
})

ipcMain.on(SEND_DELETE_REPORT, async (event, arg) =>{
  const report = await removeReport(arg)

  const data = JSON.stringify(report)

  event.sender.send(GET_DELETE_REPORT, {data})
})


//-------------------Report PDF----------------------
ipcMain.on(SEND_REPORT_PDF, (event, arg) =>{
  createPDFWindow()
  const id = arg

  PDFWindow.webContents.on('did-finish-load', arg =>{
    console.log(arg)

    PDFWindow.webContents.send(GET_REPORT_PDF, id)
  })
})



//-------------------Services----------------------
ipcMain.on(SEND_BACKUP, async (event, arg) =>{
  const backupData = await backup(arg)

  const data = JSON.stringify(backupData)

  event.sender.send(GET_BACKUP, {data})
})

ipcMain.on(SEND_RESTORE, async (event, arg) =>{
  const restoreData = await restore(arg)

  const data = JSON.stringify(restoreData)

  event.sender.send(GET_RESTORE, {data})
})
