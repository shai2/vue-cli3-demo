/*eslint-disable*/
// TcPlayer文档 https://cloud.tencent.com/document/product/454/7503
// Web 直播聊天室文档 https://cloud.tencent.com/document/product/269/4066
const $ = require('jquery')
const webim = require('./webim.js').default
const moment = require('moment')
const md5 = require('md5')
const axios = require('axios')
const qs = require('qs')
import sensitiveWord from './sensitiveWord'
const sensitiveWordArr = sensitiveWord.split('\n')
import { Toast } from 'antd-mobile'
const env = (window.location.host.match(/\w+(?:-)/) || [])[0] || ''
// console.log(webim.Log)
class MySDK {
  constructor(config = {}) {
    console.log(2222222,config)
    this.token = config.token
    this.lessonId = config.lessonId
    this.poster = config.poster
    this.partnerId = config.partnerId
    this.userInfo = {}
    this.groupId = null
    this.memberNumber = null
    this.joinSuccess = null
    // 初始化axios
    this.axiosInit()
    // --------------------------聊天部分----------------------------------
    /**
     *  this.userInfo{}应该包括以下字段 用于调用sdk身份验证
     *  sdkAppID 用户标识接入 IM SDK 的应用 ID，必填
     *  appIDAt3rd App 用户使用 OAuth 授权体系分配的 Appid，必填
     *  userSig 鉴权 Token，identifier 不为空时，必填
     *  accountType 必填
     *  identifier 用户帐号，选填
     *  identifierNick 昵称，选填
     *  headurl 当前用户默认头像，选填
     */
    // TODO
    // var p1 = this.getUserInfo() //获取当前登录用户身份信息，得到headurl
    // var p2 = this.getAppInfo() //获取腾讯直播课主体的相关信息，得到sdkAppID、appIDAt3rd
    // var p3 = this.getChatterInfo() //获取聊天人个人信息，得到userSig、identifier、identifierNick
    // var p4 = this.getChatId() //获取聊天室群组id，得到groupId

    // Promise.all([p1,p2,p3,p4]).then(()=>{
    //   await sdk.login()
    //   获取人数
    // })
    
    this.onMessage = config.onMessage //收到消息回调
    this.selSess = null
    // --------------------------视频部分----------------------------------
    /**
     * 视频类型播放优先级
     * mobile ：m3u8>mp4
     * PC ：RTMP>flv>m3u8>mp4
     */
    this.m3u8 = config.m3u8
    this.mp4 = config.mp4
    // 只pc支持 rtmp、flv
    const isPC = this.isPC()
    if(isPC){
      this.flv = config.flv
      this.rtmp = config.rtmp
    }else{
      this.flv = ''
      this.rtmp = ''
    }
    
    // https://media.w3.org/2010/05/sintel/trailer.mp4
    //1256993030.vod2.myqcloud.com/d520582dvodtransgzp1256993030/7732bd367447398157015849771/v.f30.mp4
    // this.mp4 = config.mp4 || '//1256993030.vod2.myqcloud.com/d520582dvodtransgzp1256993030/7732bd367447398157015849771/v.f30.mp4'

    this.player = null //实例
    this.domId = config.domId || 'video-wrapper'//视频wrapper组件id
    console.log(config.domId,this.domId)
    this.live = config.live || false//是否是直播
    this.loadCallback = config.loadCallback //load回调，初始化执行一次
    this.playCallback = config.playCallback //播放回调
    this.pauseCallback = config.pauseCallback //暂停回调

    // 初始化加载tcplayer.js
    this.scriptInit(this.domId)
    // 页面关闭前发请求，退出直播群
    window.addEventListener('beforeunload', () => {
      this.quitBigGroup()
    });
  }
  // 判断是不是pc
  isPC = () => {
    var userAgentInfo = navigator.userAgent;
    var Agents = ["Android", "iPhone",
        "SymbianOS", "Windows Phone",
        "iPad", "iPod"];
    var flag = true;
    for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) {
            flag = false;
            break;
        }
    }
    return flag;
  }
  // 初始化axios公共参数
  axiosInit = () => {
    axios.defaults.baseURL = `//${env}mid.yimifudao.com`
    axios.defaults.headers = {
      'Content-Type': 'application/json;charset=utf-8',
      'biz-info': JSON.stringify({partnerId: this.partnerId})
    }

    axios.defaults.transformRequest = [(data) => {
      data.applyId = 1
      data.timestamp = moment().format('YYYYMMDDHHmmss')
      data.token = this.token
      // 排序 sign字段要用到
      var _arr=Object.keys(data).sort();
      var _result = {};
      _arr.map(m=>{
        _result[m] = data[m];
      });

      data.sign = md5(qs.stringify(_result, {encode: false})).toUpperCase()
      return JSON.stringify(data)
    }]
    // 拦截器
    axios.interceptors.response.use(
      res => {
        return res.data
      },
      error => {throw Error(error)}
    )
  }
  // 初始化聊天
  chatInit = (fn) => {
    const p1 = this.getUserInfo()
    const p2 = this.getAppInfo()
    const p3 = this.getChatterInfo()
    const p4 = this.getChatId()

    Promise.all([p1, p2, p3, p4]).then(async () => {
      //登录im 加入聊天组
      await this.login()
      if(fn) fn()
    })
  }
  // 获取当前登录用户身份信息
  getUserInfo = () => {
    return axios.post('/cloudliveCenter/im/getUserInfo',{})
      .then((res) => {
        // TODO:判断一下中台token过期跳到登录
        if(res.code=='850016'){
          // 1是小组课的
          if(this.partnerId == 1){
            // 跳转到小组课登录
            if(document.location.href.includes(':3000')){
              http://sit01-opencourse.yimifudao.com/bind:3000
              window.location.href = `//${env}opencourse.yimifudao.com:3000/bind`
            }else{
              window.location.href = `//${env}opencourse.yimifudao.com/bind`
            }
          }
        }
        console.log('getUserInfo',res.data);
        this.userInfo.headurl = res.data.headPicture
        this.userInfo.userId = res.data.userId
      })
      .catch((err) => {
        console.log(err)
      })
  }
  // 获取腾讯直播课主体的相关信息
  getAppInfo = () => {
    return axios.post('/cloudliveCenter/im/getAppInfo',{})
      .then((res) => {
        console.log('getAppInfo',res.data);
        this.userInfo.sdkAppID = res.data.appID
        this.userInfo.appIDAt3rd = res.data.appIDAt3rd
        this.userInfo.accountType = res.data.accountType
      })
      .catch((err) => {console.log(err)})
  }
  // 获取聊天人个人信息
  getChatterInfo = () => {
    return axios.post('/cloudliveCenter/im/getChatterInfo',{})
    .then((res) => {
      console.log('getChatterInfo',res.data);
      this.userInfo.userSig = res.data.userSig
      this.userInfo.identifier = res.data.identifier
      this.userInfo.identifierNick = res.data.nickName
    })
    .catch((err) => {console.log(err)})
  }
  // 获取聊天室群组id
  getChatId = () => {
    return axios.post('/cloudliveCenter/im/getChatId',{"lessonId": this.lessonId})
      .then((res) => {
        console.log('getChatId',res.data);
        this.groupId = res.data.chatId
      })
      .catch((err) => {console.log(err)})
  }
  // 获取聊天记录
  getRoomMessages = async(pageNum = 1, pageSize = 10) => {
    let _res = await axios.post('/cloudliveCenter/im/getRoomMessages',{
      "groupId": this.groupId,
      pageSize,
      pageNum
    })
    return this.formatChatData(_res.data.list)
  }
  // 格式化聊天记录
  formatChatData(data) {
    const _result = [];
    data.forEach(e => {
      try {
        let _showTime
        let _sendYear = moment(e.createTime).format("YYYY")
        let _newYear = moment(new Date()).format("YYYY")
        if(_sendYear === _newYear){
          _showTime = moment(e.createTime).format("MM-DD HH:mm")
        }else{
          _showTime = moment(e.createTime).format("YYYY-MM-DD HH:mm")
        }

        _result.push({
          content: JSON.parse(e.msgBody)[0].MsgContent.Text,
          userName: e.nickName || e.fromAccount,
          sendTime: _showTime,
          photo: e.headPicture,
          isMine: e.fromAccount === this.userInfo.identifier,
          type:'text' //目前只有text
        });
      } catch (e) {
        throw new Error(e)
      }
    });
    return _result;
  }
  // 中台接口
  addDiscuss = ({lessonId,userId,content}) => {
    return axios.post('/evaluateDiscussCenter/discuss/create',{
      discussType: 'openLesson', //讨论类型：公开课
      discussObjectId: lessonId, //直播课ID
      partnerClientId: userId, //学生ID
      clientId: 0, //客户ID(暂无)，当前默认0
      discussContent: content, //讨论内容
      publishTime: moment().format('YYYY-MM-DD HH:mm:ss'), //发表时间（yyyy-MM-dd HH:mm:ss）
    })
      .then((res) => {
        // console.log('中台返回的',res.data);
      })
      .catch((err) => {console.log(err)})
  }
  // 加载tcplayer.js
  scriptInit = () => {
    if (typeof window == 'undefined') return
    // 加载js
    const tcPlayerScript = document.createElement('script')
    document.head.appendChild(tcPlayerScript)
    tcPlayerScript.src = 'https://imgcache.qq.com/open/qcloud/video/vcplayer/TcPlayer-2.3.1.js'
    tcPlayerScript.addEventListener('load', () => {
      //载入成功 初始化播放器
      this.playerInit()
    })
  }
  // js加载完成后执行
  playerInit = () => {
    let _width = $(`#${this.domId}`).width()
    let _height = _width * 9 / 16
    let config = {
      "m3u8": this.m3u8,
      "flv": this.flv,
      "mp4": this.mp4,
      "rtmp": this.rtmp,
      "autoplay": false,// safari以及大部分移动端浏览器是不开放视频自动播放
      "poster": {// 预览封面图
        "style": "default", //default, stretch, cover
        "src": this.poster,
      },
      "pausePosterEnabled": {// 暂停封面
        "style": "default", //default, stretch, cover
        "src": this.poster,
      },
      "width": _width,// 视频显示宽度
      "height": _height,// 视频显示高度
      "live": this.live,// 是否为直播类型，影响tcPlayer是否渲染时间轴等控件、区分点直播的处理逻辑
      "controls": this.live ? 'none' : 'default',//控件选择: default, none, system
      "systemFullscreen": true, //在不支持 Fullscreen API 的浏览器环境下，尝试使用浏览器提供的 webkitEnterFullScreen 方法进行全屏
      "x5_player": false,//播放器将在 TBS 模式下
      "x5_orientation": 2,
      "h5_flv": false,//是否启用 flv.js 的播放 flv
      "wording": {//定制提示语句
        2032: "请求视频失败，请检查网络",
      },
      "listener": this.listener,
    }
    console.log('config',config)
    this.player = new TcPlayer(this.domId, config);
    // 改变视频方向
    window.addEventListener('orientationchange', () => {
      console.log('触发转向')
      this.changeOrientation()
    })
    $('video').attr({
      'playsinline': "true",
      'webkit-playsinline': "true",
      'x-webkit-airplay': "true",
      'x5-playsinline': "true",
    })
    // resize
    window.onresize = () => {
      // console.log(this.player)
    }
  }
  // 各种情况监听
  listener = (msg) => {
    // console.log('msg',msg)
    if (msg.type === 'play') {
      // console.log($('.vcp-poster'))
      if($('.vcp-poster')[0].style.display!=='none'){
        document.querySelector('.my-loading').style.display="flex"
      // document.querySelector('.vcp-poster').style.display="none"
      }
      
      this.playCallback && this.playCallback()
    }
    if (msg.type === 'pause') {
      this.pauseCallback && this.pauseCallback()
    }
    if (msg.type === 'load') {
      // document.querySelector('.my-loading').style.display="flex"
      this.loadCallback && this.loadCallback()
    }
    if (msg.type === 'timeupdate') {
      document.querySelector('.my-loading').style.display="none"
    }
    if (msg.type === 'seeking') {
      document.querySelector('.my-loading').style.display="flex"
    }
    if (msg.type === 'seeked') {
      document.querySelector('.my-loading').style.display="none"
    }
    if (msg.type === 'ended') {
    }
  }
  // 转屏事件
  changeOrientation = () => {
    if (window.orientation === 180 || window.orientation === 0) {
      // this.player.fullscreen(false)
    } else if (window.orientation === 90 || window.orientation === -90) {
      this.player.fullscreen(true)
    }
  }
  // 手动调用播放
  play = () => {
    this.player.play()
  }
  // 切换播放
  togglePlay = () => {
    this.player.togglePlay()
  }
  // 重新载入播放地址
  load = (url) => {
    this.player.load(url)
  }

  // 登录im 拿到所有身份后调用
  login = () => {
    console.log('this.userInfo',this.userInfo)
    webim.login(this.userInfo, this.imListeners(), {},
      // 成功回调
      async (identifierNick) => {
        console.log('TODO登录成功的身份',identifierNick)
        //identifierNick 为登录用户昵称(没有设置时，为帐号)，无登录态时为空
        webim.Log.info('webim登录成功');
        await this.setProfilePortrait();
        await this.applyJoinBigGroup();//加入大群
      },
      (err) => {
        console.warn(err.ErrorInfo);
      }
    )
  }

  setProfilePortrait = () => {
    let profile_item = [{
      "Tag": "Tag_Profile_IM_Nick",
      "Value": this.userInfo.identifierNick || this.userInfo.identifierNick.identifier
    },{
      "Tag": "Tag_Profile_IM_Image",
      "Value": this.userInfo.headurl
    }]
    webim.setProfilePortrait(
      {'ProfileItem': profile_item},
      function (resp) {
          console.log('设置个人资料成功');
      },
      function (err) {
      }
    )
  }
  // 聊天初始化回调
  imListeners = () => {
    return {
      //监听连接状态回调变化事件，选填
      "onConnNotify": (resp) => {
        switch (resp.ErrorCode) {
          case webim.CONNECTION_STATUS.ON:
            //webim.Log.warn('连接状态正常...');
            break;
          case webim.CONNECTION_STATUS.OFF:
            webim.Log.warn('连接已断开，无法收到新消息，请检查下您的网络是否正常');
            break;
          default:
            webim.Log.error('未知连接状态,status=' + resp.ErrorCode);
            break;
        }
      },
      //监听大群新消息（普通，点赞，提示，红包），必填
      "onBigGroupMsgNotify": this.onBigGroupMsgNotify,
      //监听新消息(私聊(包括普通消息和全员推送消息)，普通群(非直播聊天室)消息)事件，必填
      "onMsgNotify": (newMsgList) => {
        for (var j in newMsgList) {//遍历新消息
          var newMsg = newMsgList[j];
          console.log('newMsg', newMsg)
          this.onMessage && this.onMessage(this.formatMsg(newMsg)) //处理新消息
        }
      },
    }
  }
  onBigGroupMsgNotify = (msgList) => {
    if(!msgList.length) return
    for (var i = msgList.length - 1; i >= 0; i--) {//遍历消息，按照时间从后往前
      console.log('收到消息，处理前: ',msgList[i])
      var msg = this.formatMsg(msgList[i]) //格式化成可以识别的
      if(!msg.content.length) return //消息为空 不展示
      console.log('收到消息，处理后: ', msg);
      // webim.Log.warn('收到消息: ' + msg.content);
      //显示收到的消息
      this.onMessage && this.onMessage(msg) //抛出去,处理新消息
    }
  }
  // 加入直播大群
  applyJoinBigGroup = () => {
    webim.applyJoinBigGroup(
      {'GroupId': this.groupId},//群 ID
      (resp) => {
        //JoinedSuccess:加入成功; WaitAdminApproval:等待管理员审批
        if (resp.JoinedStatus && resp.JoinedStatus == 'JoinedSuccess') {
          webim.Log.info('加入房间成功');
          this.joinSuccess = true
          this.getGroupInfo()
        } else {
          Toast.info('加入房间失败，请刷新页面', 1)
        }
      },
      (err) => {
        console.warn(err.ErrorInfo);
      }
    )
  }
  //退出直播大群
  quitBigGroup = () => {
    webim.quitBigGroup(
      {'GroupId': this.groupId},
      function (resp) {
          webim.Log.info('退群成功');
      },
      function (err) {
          throw new Error(err.ErrorInfo);
      }
    );
  }
  // 读取群组基本资料-高级接口
  getGroupInfo = () => {
    if(!this.joinSuccess) return
    const options = {
      'GroupIdList': [
        this.groupId
      ],
      'GroupBaseInfoFilter': [
        'Type',
        'Name',
        'Introduction',
        'Notification',
        'FaceUrl',
        'CreateTime',
        'Owner_Account',
        'LastInfoTime',
        'LastMsgTime',
        'NextMsgSeq',
        'MemberNum',
        'MaxMemberNum',
        'ApplyJoinOption'
      ],
      'MemberInfoFilter': [
        'Account',
        'Role',
        'JoinTime',
        'LastSendMsgTime',
        'ShutUpUntil'
      ]
    }
    webim.getGroupInfo(
      options,
      (res) => {
        // console.log('%cres','color:blue',res)
        this.memberNumber = res.GroupInfo[0].MemberList.length

        // webim.syncGroupMsgs(
        //   {
        //     'GroupId': this.groupId,
        //     // 'ReqMsgSeq': resp.GroupInfo[0].NextMsgSeq - 1,
        //     'ReqMsgNumber': 10
        //   },
        //   (msgList) => {
        //     // 有新消息就展示
        //       console.log('msgList',msgList)
        //       this.onBigGroupMsgNotify(msgList)
        //   },
        //   (err) => {
        //     console.log(err.ErrorInfo)
        //   }
        // )

      },
      (err) => {
        console.log(err.ErrorInfo)
      }
    )
  }
  //发送消息(普通消息)，参数为（要发送的内容）
  onSendMsg = (msgtosend) => {
    // 敏感词校验
    for(let i of sensitiveWordArr){
      if(msgtosend.includes(i)){
        Toast.info('包含敏感词汇，请重新编辑', 1)
        return false
      }
    }
    // selToID 为全局变量，表示当前正在进行的聊天 ID，当聊天类型为私聊时，该值为好友帐号，否则为群号。
    if (!this.groupId) {
      Toast.info('房间错误，请刷新页面', 1)
      return;
    }
    //获取消息内容
    var msgLen = webim.Tool.getStrBytes(msgtosend);
    if (msgtosend.length < 1) {
      Toast.info('发送的消息不能为空!', 1)
      return;
    }
    var maxLen, errInfo;
    var selType = webim.SESSION_TYPE.GROUP
    if (selType == webim.SESSION_TYPE.GROUP) {
      maxLen = webim.MSG_MAX_LENGTH.GROUP;
      errInfo = "消息长度超出限制(最多" + Math.round(maxLen / 3) + "汉字)";
    } else {
      maxLen = webim.MSG_MAX_LENGTH.C2C;
      errInfo = "消息长度超出限制(最多" + Math.round(maxLen / 3) + "汉字)";
    }
    if (msgLen > maxLen) {
      Toast.info(errInfo, 1)
      return;
    }
    if (!this.selSess) {
      this.selSess = new webim.Session(selType, this.groupId, this.groupId, this.userInfo.headurl, Math.round(new Date().getTime() / 1000));
    }
    var isSend = true;//是否为自己发送
    var seq = -1;//消息序列，-1表示 IM SDK 自动生成，用于去重
    var random = Math.round(Math.random() * 4294967296);//消息随机数，用于去重
    var msgTime = Math.round(new Date().getTime() / 1000);//消息时间戳
    var subType;//消息子类型
    if (selType == webim.SESSION_TYPE.GROUP) {
      //群消息子类型如下：
      //webim.GROUP_MSG_SUB_TYPE.COMMON-普通消息,
      //webim.GROUP_MSG_SUB_TYPE.LOVEMSG-点赞消息，优先级最低
      //webim.GROUP_MSG_SUB_TYPE.TIP-提示消息(不支持发送，用于区分群消息子类型)，
      //webim.GROUP_MSG_SUB_TYPE.REDPACKET-红包消息，优先级最高
      subType = webim.GROUP_MSG_SUB_TYPE.COMMON;
    } else {
      //C2C消息子类型如下：
      //webim.C2C_MSG_SUB_TYPE.COMMON-普通消息,
      subType = webim.C2C_MSG_SUB_TYPE.COMMON;
    }
    // 对应webim.js 1245行
    console.log('this.selSess',this.selSess)
    var msg = new webim.Msg(this.selSess, isSend, seq, random, msgTime, this.userInfo.identifierNick||this.userInfo.identifier, subType, this.userInfo.identifierNick||this.userInfo.identifier, this.userInfo.headurl);
    //解析文本和表情
    var expr = /\[[^[\]]{1,3}\]/mg;
    var emotions = msgtosend.match(expr);
    var text_obj, face_obj, tmsg, emotionIndex, emotion, restMsgIndex;
    if (!emotions || emotions.length < 1) {
      text_obj = new webim.Msg.Elem.Text(msgtosend);
      msg.addText(text_obj);
    } else {//有表情

    }
    webim.sendMsg(msg, (resp) => {
      console.log('发送消息msg',msg)
      console.log('resp发送成功',resp)
      if (this.selType === webim.SESSION_TYPE.C2C) { // 私聊时，在聊天窗口手动添加一条发的消息，群聊时，长轮询接口会返回自己发的消息
        this.onMessage && this.onMessage(this.formatMsg(msg))
      }
      webim.Log.info("发消息成功");
      // 调中台接口
      this.addDiscuss({
        lessonId:this.lessonId,
        userId:this.userInfo.userId,
        content:msgtosend,
      })
    }, (err) => {
      webim.Log.error("发消息失败:", err.ErrorInfo);
      if(err.ErrorCode==80001){
        Toast.info('包含敏感词汇，请重新编辑', 1)
      }
    });
  }
  // 格式化webim格式数据给外部渲染
  formatMsg = (msg) => {
    let html = ''
    switch (msg.getSubType()) {
      case webim.GROUP_MSG_SUB_TYPE.COMMON:// 群普通消息
        html = this.convertMsgtoHtml(msg)
        break
    }

    let _showTime
    let _sendYear = moment(msg.createTime).format("YYYY")
    let _newYear = moment(new Date()).format("YYYY")
    if(_sendYear === _newYear){
      _showTime = moment(msg.createTime).format("MM-DD HH:mm")
    }else{
      _showTime = moment(msg.createTime).format("YYYY-MM-DD HH:mm")
    }

    return {
      content: html,
      userName: msg.fromAccountNick || msg.fromAccount,
      sendTime: _showTime,
      photo: msg.getIsSend() ? this.userInfo.headurl : msg.fromAccountHeadurl,
      isMine: msg.getIsSend(),
      type:'text'
    }


  }
  // 把消息转换成Html
  convertMsgtoHtml = (msg) => {
    const elems = msg.getElems()// 获取消息包含的元素数组
    let html = ''
    for (let i in elems) {
      const elem = elems[i]
      const type = elem.getType()// 获取元素类型
      const content = elem.getContent()// 获取元素对象
      switch (type) {
        case webim.MSG_ELEMENT_TYPE.TEXT:
          html += this.convertTextMsgToHtml(content)
          break
        case webim.MSG_ELEMENT_TYPE.FACE:
          html += this.convertFaceMsgToHtml(content)
          break
        case webim.MSG_ELEMENT_TYPE.CUSTOM:
          html += this.convertCustomMsgToHtml(content, msg)
          break
        default:
          webim.Log.error('未知消息元素类型: elemType=' + type)
          break
      }
    }
    return html
  }
  // 解析文本消息元素 转化a标签
  convertTextMsgToHtml = (content) => {
    let text = content.getText()
    text = text.replace(/(http(?:s)?:\/\/)?((?:\w+\.)+\w+(?::\d+)?(?:(?:\/\w+)+\/?)?(?:\?\w+(?:=\w+)?(?:&\w+(?:=\w+)?)*)?(?:#\w*)?)/g, (m, g1, g2) => {
      return `<a href="${g1 || 'http://'}${g2}">${m}</a>`
    })
    return text
  }
  //解析表情消息元素
  convertFaceMsgToHtml = (content) => {
    var index = content.getIndex();
    var data = content.getData();
    var url = null;
    var emotion = webim.Emotions[index];
    if (emotion && emotion[1]) {
      url = emotion[1];
    }
    if (url) {
      return "<img src='" + url + "'/>";
    } else {
      return data;
    }
  }
  //解析自定义消息元素
  convertCustomMsgToHtml = (content) => {
    var data = content.getData();
    var desc = content.getDesc();
    var ext = content.getExt();
    return "data=" + data + ", desc=" + desc + ", ext=" + ext;
  }
}

export default MySDK