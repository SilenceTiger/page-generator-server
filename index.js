const express = require('express')
const app = express()
const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
const fs = require('fs')
const path = require('path')

// const qiniu = require('qiniu')
const accessKey = 'vrK8D8_ll2jaS-2MbIjVRtnWLPJcUzxWMKeqcda7'
const secretKey = 'aU3zO6ESIl951PqwJGr4pmMLFlRcEqxwTcUTloP9'
// const mac = new qiniu.auth.digest.Mac(accessKey, secretKey) // 鉴权对象
const bucketName = 'silence-tiger'
const DOMAIN = 'http://qq1munyah.hn-bkt.clouddn.com'

/*为app添加中间件处理跨域请求*/
app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*') //项目上线后改成页面的地址
  res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
  next()
})

app.get('/', function (req, res) {
  res.send('welcome to my mock-server')
})

// 上传图片token
// app.post('/token', (req, res) => {
//   const key = req.body.key
//   const body = {
//     fileUrl: DOMAIN + '/' + key,
//   }
//   const putPolicy = new qiniu.rs.PutPolicy({
//     scope: bucketName,
//     returnBody: JSON.stringify(body),
//   })
//   const uploadToken = putPolicy.uploadToken(mac)
//   res.json({
//     token: uploadToken,
//   })
// })

// 获取所有的pages
app.get('/pages', (req, res) => {
  const jsonStr = fs.readFileSync(path.resolve(__dirname, './data/pages.json'), 'utf-8')
  let data = JSON.parse(jsonStr)
  res.json({
    code: 200,
    data: data.sort((a, b) => b.id - a.id),
  })
})

// 根据page id 获取 pageConfig
app.get('/page-config', (req, res) => {
  const targetId = +req.query.id
  const pagesStr = fs.readFileSync(path.resolve(__dirname, './data/pages.json'), 'utf-8')
  let pages = JSON.parse(pagesStr)
  const targetPage = pages.find((item) => item.id === targetId)
  const configStr = fs.readFileSync(path.resolve(__dirname, './data/pages-config.json'), 'utf-8')
  let configs = JSON.parse(configStr)
  let targetConfig = configs.find((item) => item.id === targetId) || {}
  targetPage.config = targetConfig.config 
  res.json({
    code: 200,
    data: targetPage,
  })
})

// 新增page
app.post('/page', (req, res) => {
  let _page = req.body
  let copyId = _page.id
  const pagesStr = fs.readFileSync(path.resolve(__dirname, './data/pages.json'), 'utf-8')
  let pages = JSON.parse(pagesStr)
  let max = 0
  for (let i = 0; i < pages.length; i++) {
    if (pages[i].id > max) {
      max = pages[i].id
    }
  }
  let _id = max + 1
  _page.id = _id
  pages.push(_page)
  fs.writeFileSync(path.resolve(__dirname, './data/pages.json'), JSON.stringify(pages, null, 2))

  const configStr = fs.readFileSync(path.resolve(__dirname, './data/pages-config.json'), 'utf-8')
  let configs = JSON.parse(configStr)
  let temp = {
    id: _id,
    config: [],
  }
  if (copyId) {
    let _config = configs.find((c) => c.id === copyId)
    temp.config = _config.config
  }
  configs.push(temp)
  fs.writeFileSync(path.resolve(__dirname, './data/pages-config.json'), JSON.stringify(configs, null, 2))
  res.json({
    code: 200,
    msg: 'Add Success！',
  })
})

// 修改page
app.put('/page', (req, res) => {
  const newPage = req.body
  const pagesStr = fs.readFileSync(path.resolve(__dirname, './data/pages.json'), 'utf-8')
  let pages = JSON.parse(pagesStr)
  for (let i = 0; i < pages.length; i++) {
    if (pages[i].id === newPage.id) {
      pages.splice(i, 1, newPage)
    }
  }
  fs.writeFileSync(path.resolve(__dirname, './data/pages.json'), JSON.stringify(pages, null, 2))
  res.json({
    code: 200,
  })
})

// 删除page
app.delete('/page/:id', (req, res) => {
  const _id = +req.params.id
  const pagesStr = fs.readFileSync(path.resolve(__dirname, './data/pages.json'), 'utf-8')
  let pages = JSON.parse(pagesStr)
  let len = pages.length
  for (let i = len - 1; i >= 0; i--) {
    if (pages[i].id === _id) {
      pages.splice(i, 1)
      break
    }
  }
  fs.writeFileSync(path.resolve(__dirname, './data/pages.json'), JSON.stringify(pages, null, 2))
  const configStr = fs.readFileSync(path.resolve(__dirname, './data/pages-config.json'), 'utf-8')
  let configs = JSON.parse(configStr)
  let _len = configs.length
  for (let i = _len - 1; i >= 0; i--) {
    if (configs[i].id === _id) {
      configs.splice(i, 1)
      break
    }
  }
  fs.writeFileSync(path.resolve(__dirname, './data/pages-config.json'), JSON.stringify(configs, null, 2))
  res.json({
    code: 200,
  })
})

// 修改page-config
app.post('/page-config', (req, res) => {
  let _config = req.body
  const configStr = fs.readFileSync(path.resolve(__dirname, './data/pages-config.json'), 'utf-8')
  let configs = JSON.parse(configStr)
  for (let i = 0; i < configs.length; i++) {
    if (configs[i].id === _config.id) {
      configs.splice(i, 1, _config)
      break
    }
  }
  fs.writeFileSync(path.resolve(__dirname, './data/pages-config.json'), JSON.stringify(configs, null, 2))
  res.json({
    code: 200,
  })
})

// TEST REMOTE URL
app.get('/module-line', (req, res) => {
  res.json({
    code: 200,
    data: {
      xAxis: ['One', 'Two', 'Three', 'Four', 'Five', 'Six'],
      series: [
        {
          name: '勇神一号',
          data: [94, 88, 99, 75, 86, 59],
        },
        {
          name: '勇神二号',
          data: [71, 35, 41, 53, 67, 71],
        },
        {
          name: '勇神三号',
          data: [11, 25, 31, 43, 67, 71],
        },
      ],
    },
  })
})

app.get('/module-line-data', (req, res) => {
  res.json({
    code: 200,
    data: {
      series: [
        {
          name: '科比',
          xAxis: ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven'],
          data: [94, 88, 99, 75, 86, 59, 44],
        },
        {
          name: '艾佛森',
          xAxis: ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven'],
          data: [71, 35, 41, 53, 67, 71, 64],
        },
        {
          name: '奥尼尔',
          xAxis: ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven'],
          data: [11, 25, 31, 43, 67, 71, 98],
        },
      ],
    },
  })
})

let server = app.listen(9999, function () {
  console.log('app listening at http://localhost:9999')
})
