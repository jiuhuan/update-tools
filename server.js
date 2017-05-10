const fs = require('fs');
const http = require('http');
const { parse } = require('url');
const crypto = require('crypto');
const Busboy = require('busboy');
const Cookies = require('cookies');

const port = get('port') || 8080;

// 管理员名单
const admins = {
  'jiuhuan': 'hello123456',
};
// 加密秘钥
const secret = 'hello@123456';

const server = http.createServer((req, res) => {

  const urlObj = parse(req.url, true);

  const cookies = new Cookies(req, res, {
    keys: [ 'update@123456' ],
    secure: false
  });

  // 判断登录状态
  if(urlObj.pathname.indexOf('/submit_login') === 0){
    const { username, password } = urlObj.query;
    console.log(username, password);
    if(username && password && admins[username] && admins[username] === password){
      console.log('login ok.');
      const val = encryption(`${username}:${password}`, secret);
      cookies.set('_UPDATE_SN', val, {
        httpOnly: true,
        secure: false,
        maxAge: Date.now() + (1000 * 60 * 60 * 24 * 100) // 100天
      });
      res.writeHead(303, { Connection: 'close', Location: '/' });
      res.end();
      return;
    }
    res.writeHead(303, { Connection: 'close', Location: '/login' });
    res.end();
  }

  // 渲染登录页面
  if(urlObj.pathname.indexOf('/login') === 0){
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    fs.createReadStream(__dirname+'/login.html').pipe(res);
    return;
  }

  // 判断是否有上传权限
  const update_sn = cookies.get('_UPDATE_SN');
  if(update_sn && update_sn.length === 64){
    const [ username, password ] = deciphering(update_sn, secret).split(':');
    if(!(admins[username] && admins[username] === password)){
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      res.end('You do not have upload permissions.');
      return;
    }
  }else{
    res.writeHead(303, { Connection: 'close', Location: '/login' });
    res.end();
  }

  if (req.method === 'POST') {
    const busboy = new Busboy({ headers: req.headers });
    busboy.on('file', (fieldname, file, filename, encoding, mimetype)=> {
      const pathfull = `${__dirname}/uploader/${filename}.${Date.now()}.tmp`;
      const stream = fs.createWriteStream(pathfull);
      file.pipe(stream);
    });
    busboy.on('finish', ()=> {
      res.writeHead(303, { Connection: 'close', Location: '/' });
      res.end();
    });
    req.pipe(busboy);
  } else if (req.method === 'GET') {
    res.writeHead(200, { Connection: 'close', 'Content-Type':'text/html' });
    fs.createReadStream(__dirname+'/index.html').pipe(res);
  }
});
server.listen(port, '0.0.0.0', ()=>{
  const exists = fs.existsSync(__dirname+'/uploader');
  if(!exists){
    fs.mkdirSync(__dirname+'/uploader');
  }
  console.log(`Listening [${port}] for requests.`);
  console.log(`open 'http://127.0.0.1:${port}'`)
});

function get(key) {
  const argv = process.argv.slice(2);
  for (const arg of argv) {
    if (arg.indexOf(`--${key}`) === 0) {
      const v = arg.split('=')[1];
      if (!v) {
        return undefined;
      }
      if (!isNaN(v)) {
        return parseInt(v);
      }
      return v;
    }
  }
}

function encryption(value, password){
  const crypto = require('crypto');
  const cipher = crypto.createCipher('aes192', password);
  let encrypted = cipher.update(value, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function deciphering(value, password){
  const crypto = require('crypto');
  const decipher = crypto.createDecipher('aes192', password);
  let decrypted = decipher.update(value, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
