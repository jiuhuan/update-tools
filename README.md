upload server
=====================================

简单的一个上传工具，有时需要往服务器或想让别人传送文件给你时，可以使用这个小工具帮助你快速实现。

## Usage:

首先在`server.js`里修改管理员和秘钥：
```javascript
// 管理员名单
const admins = {
  'jiuhuan': 'hello123456',
};
// 加密秘钥
const secret = 'hello@123456';
```

然后按照以下命令依次操作：
```base
npm run install-npm
npm run install-node
npm run start
open 'http://127.0.0.1:8080'
```

或者，还可以使用`build.sh`脚本进行打包：
```bash
sh ./build.sh
```

打包后的压缩包文件存放在`build/`目录下。

