const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 750,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

/*   win.webContents.openDevTools(); */

  win.loadFile(path.join(__dirname, 'index.html'));

  ipcMain.on('start-button-clicked', () => {
    const initPki = spawn('./easyrsa', ['init-pki'], { cwd: __dirname, stdio: ['pipe', 'pipe', 'pipe'] });
  
    initPki.stdout.on('data', (data) => {
      if (data.includes("Confirm removal:")) {
        win.webContents.send('user-input', '\n');
        ipcMain.once('user-input', (event, userInput) => {
          if (userInput === 'yes') {
            initPki.stdin.write('yes\n');
          }
          else {
            initPki.kill();
            win.close();
            dialog.showErrorBox('Error', 'You have entered wrong information. Closing the application.');
          }
        })
      }
      if (data.includes("Enter a PEM pass phrase:")) {
        initPki.stdin.write('mypassword\n');
      }
      win.webContents.send('initPki-stdout', data);
    });
    
  
    initPki.stderr.on('data', (data) => {
      win.webContents.send('initPki-stderr', data);
    });

  
    initPki.on('close', (code) => {
      win.webContents.send('initPki-close', code);
      if (code === 0) {
        const buildCa = spawn('./easyrsa', ['build-ca'], { cwd: __dirname, stdio: ['pipe', 'pipe', 'pipe'] });
        
        let passphrase1 = '';
        let passphrase2 = '';

        buildCa.stdout.on('data', (data) => {
          if (data.includes("Enter New CA Key Passphrase:")) {
            win.webContents.send('user-input2', '\n');
            ipcMain.once('user-input2', (event, userInput) => {
              passphrase1 = userInput.trim();
              buildCa.stdin.write(userInput + '\n');
            });
          }
          if (data.includes("Re-Enter New CA Key Passphrase:")) {
            win.webContents.send('user-input3', '\n');
            ipcMain.once('user-input3', (event, userInput) => {
              passphrase2 = userInput.trim();
              buildCa.stdin.write(userInput + '\n');

              if (passphrase1 !== passphrase2) {
                dialog.showErrorBox('Error', 'Passphrases do not match. The process will now terminate.');
                app.exit(1);
              }
              else {
                win.webContents.send('passphrase-confirmed', 'Your passphrase has been confirmed. Please remember your passphrase for later.');
              }
            });
          }
          win.webContents.send('buildCa-stdout', data);
        });
  
        buildCa.stderr.on('data', (data) => {

          if (data.includes('Common Name (eg: your user, host, or server name) [Easy-RSA CA]:')) {
            win.webContents.send('user-input4', '\n');
            ipcMain.once('user-input4', (event, userInput) => {
              buildCa.stdin.write(userInput + '\n');
            })
          }
          win.webContents.send('buildCa-stderr', data);
        });
  
        buildCa.on('close', (code) => {
          win.webContents.send('buildCa-close', code);
          if (code === 0) {
            const catCrt = spawn('cat', ['pki/ca.crt'], { cwd: __dirname, stdio: ['pipe', 'pipe', 'pipe'] });
    
            catCrt.stdout.on('data', (data) => {
              win.webContents.send('catCrt-stdout', data);
            });
    
            catCrt.stderr.on('data', (data) => {
              win.webContents.send('catCrt-stderr', data);
            });
    
            catCrt.on('close', (code) => {
              win.webContents.send('catCrt-close', code);
              if (code === 0) {
                const genDh = spawn('./easyrsa', ['gen-dh'], { cwd: __dirname, stdio: ['pipe', 'pipe', 'pipe'] });
  
                genDh.stdout.on('data', (data) => {
                  win.webContents.send('genDh-stdout', data);
                });
  
                genDh.stderr.on('data', (data) => {
                  process.stderr.write(`${data}`);
                  win.webContents.send('genDh-stderr', data);
                });
  
                genDh.on('close', (code) => {
                  win.webContents.send('genDh-close', code);
                  if (code === 0) {
                    const catDh = spawn('cat', ['pki/dh.pem'], { cwd: __dirname, stdio: ['pipe', 'pipe', 'pipe'] });
      
                    catDh.stdout.on('data', (data) => {
                      win.webContents.send('catDh-stdout', data);
                    });
      
                    catDh.stderr.on('data', (data) => {
                      win.webContents.send('catDh-stderr', data);
                    });
      
                    catDh.on('close', (code) => {
                      win.webContents.send('catDh-close', code);
                      if (code === 0) {
                        const buildServerFull = spawn('./easyrsa', ['build-server-full', 'server', 'nopass'], { cwd: __dirname, stdio: ['pipe', 'pipe', 'pipe'] });
                        
                        let showPrompt = false;

                        buildServerFull.stdout.on('data', (data) => {
                          if (data.includes("Confirm request details:")) {
                            showPrompt = true;
                            win.webContents.send('user-input5', '\n');
                            ipcMain.once('user-input5', (event, userInput) => {
                              if (userInput === 'yes') {
                                buildServerFull.stdin.write(userInput + '\n');
                                win.webContents.send('buildServerFull-prompt', 'Go to Command Prompt/Terminal to answer SSH Key Passphrase.');
                              }
                              else {
                                buildServerFull.kill();
                              }
                            })
                          }
                          win.webContents.send('buildServerFull-stdout', data);
                        });
                        buildServerFull.stderr.on('data', (data) => {
                          win.webContents.send('buildServerFull-stderr', data);
                        });
                        buildServerFull.on('close', (code) => {
                          win.webContents.send('buildServerFull-close', code);
                          if (code === 0) {
                            const serverCrt = spawn('cat', ['pki/issued/server.crt'], { cwd: __dirname, stdio: ['pipe', 'pipe', 'pipe'] });

                            serverCrt.stdout.on('data', (data) => {
                                win.webContents.send('serverCrt-stdout', data);
                            });
                            serverCrt.stderr.on('data', (data) => {
                                win.webContents.send('serverCrt-stderr', data);
                            });
                            serverCrt.on('close', (code) => {
                                win.webContents.send('serverCrt-close', code);
                                if (code === 0) {
                                    const serverKey = spawn('cat', ['pki/private/server.key'], { cwd: __dirname, stdio: ['pipe', 'pipe', 'pipe'] });
        
                                    serverKey.stdout.on('data', (data) => {
                                        win.webContents.send('serverKey-stdout', data);
                                    });
                                    serverKey.stderr.on('data', (data) => {
                                        win.webContents.send('serverKey-stderr', data);
                                    });
                                    serverKey.on('close', (code) => {
                                        win.webContents.send('serverKey-close', code);
                                        if (code === 0) {
                                            const buildClientFull = spawn('./easyrsa', ['build-client-full', 'client1', 'nopass'], { cwd: __dirname, stdio: ['pipe', 'pipe', 'pipe'] });

                                            showPrompt = false;
                                            buildClientFull.stdout.on('data', (data) => {
                                              if (data.includes("Confirm request details:")) {
                                                showPrompt = true;
                                                win.webContents.send('user-input6', '\n');
                                                ipcMain.once('user-input6', (event, userInput) => {
                                                  if (userInput === 'yes') {
                                                    buildClientFull.stdin.write(userInput + '\n');
                                                    win.webContents.send('buildClientFull-prompt', 'Go to Command Prompt/Terminal to answer SSH Key Passphrase.');
                                                  }
                                                  else {
                                                    buildClientFull.kill();
                                                  }
                                                });
                                              }
                                              win.webContents.send('buildClientFull-stdout', data);
                                            });
                                            buildClientFull.stderr.on('data', (data) => {
                                              win.webContents.send('buildClientFull-stderr', data);
                                            });
                                            buildClientFull.on('close', (code) => {
                                                win.webContents.send('buildClientFull-close', code);

                                                if (code === 0) {
                                                    const clientCrt = spawn('cat', ['pki/issued/client1.crt'], { cwd: __dirname, stdio: ['pipe', 'pipe', 'pipe'] });
                        
                                                    clientCrt.stdout.on('data', (data) => {
                                                        win.webContents.send('clientCrt-stdout', data);
                                                    });
                                                    clientCrt.stderr.on('data', (data) => {
                                                        win.webContents.send('clientCrt-stderr', data);
                                                    });
                                                    clientCrt.on('close', (code) => {
                                                        win.webContents.send('clientCrt-close', code);
                                                        if (code === 0) {
                                                            const clientKey = spawn('cat', ['pki/private/client1.key'], { cwd: __dirname, stdio: ['pipe', 'pipe', 'pipe'] });
                                
                                                            clientKey.stdout.on('data', (data) => {
                                                                win.webContents.send('clientKey-stdout', data);
                                                            });
                                                            clientKey.stderr.on('data', (data) => {
                                                                win.webContents.send('clientKey-stderr', data);
                                                            });
                                                            clientKey.on('close', (code) => {
                                                                win.webContents.send('clientKey-close', code);
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                          }
                        });
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
  }
  )};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});