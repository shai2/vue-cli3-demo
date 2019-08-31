import axios from 'axios'
import JsCookie from 'js-cookie'
import storage from 'good-storage'
import { env, findQuery } from '@tools'

let baseURL
if(findQuery('type')=='mi'){
  baseURL = `https://${env}api.yimifudao.com/v2.4/api`
  console.log('米老师接口',baseURL)
}else{
  baseURL = `http://${env}platform.yimifudao.com/v1.0.0/erp`
  console.log('H5接口',baseURL)
}
// 先注释掉
// if(!token || token.length == 0){
//   window.location.href = `//${env}mis.yimifudao.com/login`
// }

// create an axios instance
const require = axios.create({
  // baseURL: () => {
  //   return process.env.NODE_ENV === "development" ? '/api' : process.env.baseURL
  // },
  baseURL: baseURL,
  timeout: 20000,
  withCredentials: true,
  headers: {
    'X-AUTH-TOKEN': findQuery('token')||localStorage.getItem('token'),
    'Content-Type': 'application/json'
  }
})

// request interceptor
require.interceptors.request.use(config => {
  // config.headers['sessionId'] = storage.get('sessionId', '')
  return config
}, error => {
  console.log(error)
  Promise.reject(error)
})

// respone interceptor
require.interceptors.response.use(
  // 请求后
  res => {
    // 1003是token失效
    if(res.data.status == 1003){
      window.$message({ message: '登录过期，请重新登录后打开页面', duration: 3000 });
    }
    // h5项目中 2000是成功
    else if (res.data.status !== 2000) {
      console.log('不是2000',res)
      window.$message({ message: '请求失败，请稍后重试', duration: 1000 });
      return Promise.reject(res.data.message)
    } else {
      return res.data
    }
  },
  error => {
    console.log('err' + error)
    // window.$message({ message: error.message, duration: 1000 });
    window.$message({ message: '与服务器连接出现异常', duration: 1000 });
    return Promise.reject(error)
  })

export default require