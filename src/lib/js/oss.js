import OSS from 'ali-oss'
import axios from '../../api/axios'
import uuidv5 from 'uuid/v5'
import { stringify } from 'qs'
import storage from 'good-storage'
import { env } from '@tools'

/**
 * OSS服务
 * @param file
 * @param filePath 文件在oss里的路径
 */

export default async (file, filePathName) => {
  filePathName = 'document'
  if (!file) throw new Error('文件对象不能为空')
  // 某些情况下上传blob文件，不会有文件名 给个默认值
  let _origiName = file.name || 'noName.png'
  console.log(_origiName)
  //文件名
  let fileName = uuidv5(String(Date.now()), uuidv5.URL)
  //文件类型
  let fileType = (()=>{
    let _arr = _origiName.split('.')
    return _arr[_arr.length-1]
  })()

  let params = {
    userId: storage.get('token').split('_')[1],
    name: 'document'
  }
  
  // 回去上传用token
  let res = await axios.get('/support/oss/security', {params})
  if (res.status !== 2000){
    console.log(res)
    return false
  }

  //存放路径
  let date = new Date()
  let filePath = `/${res.data.bucketInfo.preffix}/${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
  //放入oss的全路径
  let storeAs = `${filePath}/${fileName}.${fileType}`
  
  //创建oss实例
  let ossClient = new OSS({
    endpoint: null,
    region: 'oss-cn-hangzhou',
    accessKeyId: res.data.keyId,
    accessKeySecret: res.data.secret,
    stsToken: res.data.token,
    bucket: res.data.bucketInfo.bucket
  })
  //执行上传操作
  let ossRes = await ossClient.multipartUpload(storeAs, file, {
    progress: async function(p, checkpoint) {
      console.log('开始上传','路径：',storeAs)
    },
    meta: { year: 2019, people: 'shai2' },
    mime: 'image/jpeg'
  })
  if (ossRes.res.status !== 200) {
    window.$message.error('oss上传出现错误');
    return false
  }
  //返回上传文件的信息
  console.log('上传成功',`name: ${_origiName}`,`http://${res.data.bucketInfo.bucket}.yimifudao.com${ossRes.name}`)
  return [{name: _origiName, url: `http://${res.data.bucketInfo.bucket}.yimifudao.com${ossRes.name}`}]

  // return [{name: 'food.jpeg', url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100'}]
}
