import axios from './axios'

// ---------------米老师的课件--------------------
// 根据id获取课件信息
/**
 * @param {string}  id 课件id
 */
export function getMiById(id) {
  return axios.get('/lessonPlan/getLessonList', {params:{
    sign:'1DA6D1FC14E2A9B461F9B0CBD59CFBD3',
    lessonId:3064723,
    userId:143156,
    token:'7e646df2186ee2e156f658e8a14bb647',
    timestamp:20190718165530
  }})
}

// 根据id获取课件信息
/**
 * @param {string}  id 课件id
 */
export function getById(id) {
  return axios.get('/course/chapter/ware/getById', {params:{id}})
}

// 根据id获取课件信息
/**
 * @param {string}  id 课件id
 * @param {string}  jsonData 课件json
 */
export function update(id, jsonData) {
  return axios.post('/course/chapter/ware/update', {id, jsonData})
}