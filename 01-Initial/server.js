const express = require('express');
const EventEmitter = require('events');
const fs = require('fs')
const cors = require('cors');

const app = express();
const chatEmitter = new EventEmitter();
chatEmitter.on('message', console.log)

const respondJSON = (req, res) => {

   res.json({ text: 'hi', numbers: [1, 2, 3] })
}

const respondText = (req, res) => {
   res.send("Olá Amigo")
}

const respond404 = (req, res) => {
   res.status(404).send("Não encontrado");
}

const respondEcho = (req, res) => {

   const { input = '' } = req.query

   res.json({
      normal: input,
      shouty: input.toLowerCase(),
      characterCount: input.length,
      backwards: input.split('').reverse().join('')
   })
}

const respondStatic = (req, res) => {

   const filename = `${__dirname}/public/${req.params[0]}`
   fs.createReadStream(filename)
      .on('error', () => respond404(req, res))
      .pipe(res)
}

const respondChat = (req, res) => {
   const { message } = req.query;

   chatEmitter.emit('message', message)

   res.end();
}

const respondSSE = (req, res) => {
   res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive'
   })

   const onMessage = msg => res.write(`data: ${msg}\n\n`);
   chatEmitter.on('message', onMessage)
   res.on('close', function () {
      chatEmitter.off('message', onMessage);
   })
}

app.get('/', respondText);
app.get('/json', respondJSON);
app.get('/echo', respondEcho);
app.get('/static/*', respondStatic);
app.get('/chat', respondChat);
app.get('/sse', respondSSE)
app.get('*', respond404);


const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Rodandno na porta ${port}`));