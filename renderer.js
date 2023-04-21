const { ipcRenderer } = require('electron');

document.getElementById('stop-button').addEventListener('click', () => {
  const confirmed = window.confirm('Are you sure you want to stop the application?');
  
  if (confirmed) {
    ipcRenderer.send('stop-application');
    window.close();
  }
});

document.getElementById('start-button').addEventListener('click', () => {
  ipcRenderer.send('start-button-clicked');

  const outputDiv = document.getElementById('output');
  outputDiv.style.width = '700px';
  outputDiv.style.overflow = 'break-word';
  outputDiv.style.whiteSpace = 'pre-wrap';
  outputDiv.innerHTML = ''; 

  // ./easyrsa init-pki
  const outputField = document.createElement('div');
  outputDiv.appendChild(outputField);

  const inputField = document.createElement('input');
  inputField.type = 'text';
  outputDiv.appendChild(inputField);
  inputField.focus();

  inputField.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      const userInput = inputField.value.trim();
      inputField.value = '';
      ipcRenderer.send('user-input', userInput);
      inputField.style.display = 'none';
      inputField2.style.display = 'block';
      }
  });

  ipcRenderer.on('initPki-stdout', (event, data) => {
    const decoder = new TextDecoder('utf-8');
    const text = decoder.decode(data);
    const pre = document.createElement('pre');
    pre.innerHTML = `${text.replace(/\n/g, '<br>')}`;
    outputField.appendChild(pre);
  });

  ipcRenderer.on('initPki-stderr', (event, data) => {
    const p = document.createElement('p');
    p.textContent = `${data}`;
    outputField.appendChild(p);
  });

  ipcRenderer.on('initPki-close', (event, code) => {
    outputField.style.display = "none";
    outputDiv.appendChild(inputField2);
  });

  // ./easyrsa build-ca
  const outputField2 = document.createElement('div');
  outputDiv.appendChild(outputField2);

  const inputField2 = document.createElement('input');
  inputField2.type = 'text';
  inputField2.style.display = 'none';

  inputField2.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      const userInput = inputField2.value.trim();
      inputField2.value = '';
      ipcRenderer.send('user-input2', userInput);
      inputField2.style.display = 'none';
      inputField3.style.display = 'block';
      outputDiv.appendChild(inputField3); 
      }
  });

  const inputField3 = document.createElement('input');
  inputField3.type = 'text';


  inputField3.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      const userInput = inputField3.value.trim();
      inputField3.value = '';
      ipcRenderer.send('user-input3', userInput);
      inputField3.style.display = 'none';
      outputDiv.appendChild(inputField4);
       }
  });

  ipcRenderer.on('buildCa-stdout', (event, data) => {
    const decoder = new TextDecoder('utf-8');
    const text = decoder.decode(data);
    const pre = document.createElement('pre');
    pre.innerHTML = `${text.replace(/\n/g, '<br>')}`;
    outputField2.appendChild(pre);
  });

  ipcRenderer.on('buildCa-stderr', (event, data) => {
    const decoder = new TextDecoder('utf-8');
    const text = decoder.decode(data);
    const pre = document.createElement('pre');
    pre.innerHTML = `${text.replace(/\n/g, '<br>')}`;
    outputField2.appendChild(pre);
  });

  ipcRenderer.on('passphrase-confirmed', (event, data) => {
    const text = data;
    const pre = document.createElement('pre');
    pre.innerHTML = `${text.replace(/\n/g, '<br>')}`;
    outputField2.appendChild(pre);
  });

  ipcRenderer.on('buildCa-close', (event, code) => {
    outputField2.style.display = "none";
  });

  // cat pki/ca.crt
  const outputField3 = document.createElement('div');
  outputDiv.appendChild(outputField3);
  
  ipcRenderer.on('catCrt-stdout', (event, data) => {
    const decoder = new TextDecoder('utf-8');
    const text = decoder.decode(data);
    const pre = document.createElement('pre');
    pre.innerHTML = `${text.replace(/\n/g, '<br>')}`;
    outputField3.appendChild(pre);
  });

  ipcRenderer.on('catCrt-stderr', (event, data) => {
    const p = document.createElement('pre');
    p.textContent = `${data}`;
    outputField3.appendChild(p);
  });

  ipcRenderer.on('catCrt-close', (event, code) => {
    outputField3.style.display = "none";
  });

  // ./easyrsa gen-dh
  const outputField4 = document.createElement('div');
  outputField3.style.display = 'none';
  outputDiv.appendChild(outputField4);

  const inputField4 = document.createElement('input');
  inputField4.type = 'text';

  inputField4.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      const userInput = inputField4.value.trim();
      inputField4.value = '';
      ipcRenderer.send('user-input4', userInput);
      inputField4.style.display = 'none';
      inputField5.style.display = 'block';

      }
  });

  ipcRenderer.on('genDh-stdout', (event, data) => {
    const decoder = new TextDecoder('utf-8');
    const text = decoder.decode(data);
    const pre = document.createElement('pre');
    pre.innerHTML = `${text.replace(/\n/g, '<br>')}`;
    outputField4.appendChild(pre);
  });

  ipcRenderer.on('genDh-stderr', (event, data) => {
    const decoder = new TextDecoder('utf-8');
    const text = decoder.decode(data);
    const outputChunks = text.trim().split(/\s+/g).reduce((chunks, word) => {
      if (chunks[chunks.length - 1].length === 20) {
        chunks.push([]);
      }
      chunks[chunks.length - 1].push(word);
      return chunks;
    }, [[]]).map(chunk => chunk.join(' '));
    
    const span = document.createElement('span');
    span.innerHTML = outputChunks.join(' ');
    outputField4.appendChild(span);
  });

  ipcRenderer.on('genDh-close', (event, code) => {
    outputField4.style.display = "none";
  });

  // cat pki/dh.pem
  const outputField5 = document.createElement('div');
  outputDiv.appendChild(outputField5);

  ipcRenderer.on('catDh-stdout', (event, data) => {
    const decoder = new TextDecoder('utf-8');
    const text = decoder.decode(data);
    const pre = document.createElement('pre');
    pre.innerHTML = `${text.replace(/\n/g, '<br>')}`;
    outputField5.appendChild(pre);
  });

  ipcRenderer.on('catDh-stderr', (event, data) => {
    const p = document.createElement('pre');
    p.textContent = `${data}`;
    outputField5.appendChild(p);
  });

  ipcRenderer.on('catDh-close', (event, code) => {
    outputField5.style.display = "none";
  });

  // ./easyrsa build-server-full server nopass
  const outputField6 = document.createElement('div');
  outputDiv.appendChild(outputField6);

  const inputField5 = document.createElement('input');
  inputField5.type = 'text';
  inputField5.style.display = 'none';


  inputField5.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      const userInput = inputField5.value.trim();
      inputField5.value = '';
      inputField5.style.display = 'none';
      ipcRenderer.send('user-input5', userInput);
      }
  });

  ipcRenderer.on('buildServerFull-stdout', (event, data) => {
    const decoder = new TextDecoder('utf-8');
    const text = decoder.decode(data);
    const pre = document.createElement('pre');
    pre.innerHTML = `${text.replace(/\n/g, '<br>')}`;
    outputField6.appendChild(pre);
    outputDiv.appendChild(inputField5);
  });

  ipcRenderer.on('buildServerFull-prompt', (event, data) => {
    const fontInfo = document.createElement('pre');
    fontInfo.textContent = data;
    fontInfo.style.fontSize = '20px';
    outputField6.appendChild(fontInfo);
  })

  ipcRenderer.on('buildServerFull-stderr', (event, data) => {
    const decoder = new TextDecoder('utf-8');
    const text = decoder.decode(data);
    const p = document.createElement('pre');
    p.innerHTML = `${text.replace(/\n/g, '<br>')}`;
    outputField6.appendChild(p);
  });

  ipcRenderer.on('buildServerFull-close', (event, code) => {
    outputField6.style.display = "none";
  });

  // cat pki/issued/server.crt
  const outputField7 = document.createElement('div');
  outputDiv.appendChild(outputField7);

  ipcRenderer.on('serverCrt-stdout', (event, data) => {
    const decoder = new TextDecoder('utf-8');
    const text = decoder.decode(data);
    const pre = document.createElement('pre');
    pre.innerHTML = `${text.replace(/\n/g, '<br>')}`;
    outputField7.appendChild(pre);
  });

  ipcRenderer.on('serverCrt-stderr', (event, data) => {
    const decoder = new TextDecoder('utf-8');
    const text = decoder.decode(data);
    const p = document.createElement('pre');
    p.innerHTML = `${text.replace(/\n/g, '<br>')}`;
    outputField7.appendChild(p);
  });

  ipcRenderer.on('serverCrt-close', (event, code) => {
    const p = document.createElement('pre');
    p.textContent = 'Here is Server Certificate and Key information.\nClick Next to Build Client Certificate and Key.';
    outputField7.appendChild(p);

    const button = document.createElement('button');
    button.textContent = 'Next';

    button.addEventListener('click', () => {
      outputField7.style.display = 'none';
      button.style.display = 'none';
      outputDiv.appendChild(outputField8);
      outputField8.style.display = 'block';
      outputDiv.appendChild(inputField6);
      inputField6.style.display = 'block';
    });

    outputField7.appendChild(button);
  });

  // cat pki/private/server.key
  const outputField8 = document.createElement('div');

  const inputField6 = document.createElement('input');
  inputField6.type = 'text';
  inputField6.style.display = 'none';

  inputField6.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      const userInput = inputField6.value.trim();
      inputField6.value = '';
      inputField6.style.display = 'none';
      ipcRenderer.send('user-input6', userInput);
      }
  });

  ipcRenderer.on('buildClientFull-stdout', (event, data) => {
    const decoder = new TextDecoder('utf-8');
    const text = decoder.decode(data);
    const pre = document.createElement('pre');
    pre.innerHTML = `${text.replace(/\n/g, '<br>')}`;
    outputField8.appendChild(pre);
    outputDiv.appendChild(inputField6);
  });

  ipcRenderer.on('buildClientFull-prompt', (event, data) => {
    const fontInfo = document.createElement('pre');
    fontInfo.textContent = data;
    fontInfo.style.fontSize = '20px';
    outputField8.appendChild(fontInfo);
  });

  ipcRenderer.on('buildClientFull-stderr', (event, data) => {
    const decoder = new TextDecoder('utf-8');
    const text = decoder.decode(data);
    const p = document.createElement('pre');
    p.innerHTML = `${text.replace(/\n/g, '<br>')}`;
    outputField8.appendChild(p);
  });

  ipcRenderer.on('buildClientFull-close', (event, code) => {
    outputField8.style.display = "none";
  });

  const outputField9 = document.createElement('div');
  outputDiv.appendChild(outputField9);

  ipcRenderer.on('clientCrt-stdout', (event, data) => {
    const decoder = new TextDecoder('utf-8');
    const text = decoder.decode(data);
    const pre = document.createElement('pre');
    pre.innerHTML = `${text.replace(/\n/g, '<br>')}`;
    outputField9.appendChild(pre);
  });

  ipcRenderer.on('clientCrt-stderr', (event, data) => {
    const decoder = new TextDecoder('utf-8');
    const text = decoder.decode(data);
    const p = document.createElement('pre');
    p.innerHTML = `${text.replace(/\n/g, '<br>')}`;
    outputField9.appendChild(p);
  });

  ipcRenderer.on('clientCrt-close', (event, code) => {
  });

  const outputField10 = document.createElement('div');
  outputDiv.appendChild(outputField10);

  ipcRenderer.on('clientKey-stdout', (event, data) => {
    const decoder = new TextDecoder('utf-8');
    const text = decoder.decode(data);
    const pre = document.createElement('pre');
    pre.innerHTML = `${text.replace(/\n/g, '<br>')}`;
    outputField10.appendChild(pre);
  });

  ipcRenderer.on('clientKey-stderr', (event, data) => {
    const decoder = new TextDecoder('utf-8');
    const text = decoder.decode(data);
    const p = document.createElement('pre');
    p.innerHTML = `${text.replace(/\n/g, '<br>')}`;
    outputField10.appendChild(p);
  });

  ipcRenderer.on('clientKey-close', (event, code) => {
    const p = document.createElement('pre');
    p.textContent = `Here is Client Certificate and Key information.\nPKI configuration is now complete.\nYou can now exit this applicaiton and distribute the files as needed.`;
    outputField10.appendChild(p);

    const button = document.createElement('button');
    button.textContent = 'Exit';

    button.addEventListener('click', () => {
      const confirmed = window.confirm('Are you sure you want to exit the application?');
  
      if (confirmed) {
        ipcRenderer.send('stop-application');
        window.close();
      }
    });
    outputField10.appendChild(button);
  });
});