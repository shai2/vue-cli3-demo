<template>
  <div class="home">
    <div class="chat-container flex-column-center">
      <div class="top full flex">
        <!-- 这个是聊天室啊 -->
        <div class="chat-area">
          这里是聊天内容
          <div class="chat-item" v-for="(e,i) in chatHistory" :key="i">
            <img class="avatar" :src="e.photo" alt="">
            <p class="name">{{e.userName}}</p>
            <div v-html="e.content" />
          </div>
        </div>
      </div>
      <div class="bottom flex-row-center w100">
        <div class="send-input flex">
          <el-input class="w100" type="text" v-model="chatVal" />
        </div>
        <div class="send-botton" @click="send">
          发送
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: "home",
  data(){
    return {
      chatVal: '你瞅啥',
      chatHistory: [{
        isMine: false,
        userName: '别人说的',
        photo:"http://static.yimifudao.com/static-files/user_pics/stu_head_pic/male.png",
        sendTime: new Date(),
        type: 'text',
        content: "这是第1条",
      },{
        isMine: false,
        userName: '别人说的',
        photo:"http://static.yimifudao.com/static-files/user_pics/stu_head_pic/male.png",
        sendTime: new Date(),
        type: 'text',
        content: "这是第2条",
      },{
        isMine: true,
        userName: '几几个',
        photo:"http://static.yimifudao.com/static-files/user_pics/stu_head_pic/male.png",
        sendTime: new Date(),
        type: 'text',
        content: "这是第3条",
      },{
        isMine: false,
        userName: '别人说的',
        photo:"http://static.yimifudao.com/static-files/user_pics/stu_head_pic/male.png",
        sendTime: new Date(),
        type: 'text',
        content: "这是第4条",
      }],
    }
  },
  components: {
    
  },
  methods: {
    // 发送消息
    send(){
      this.chatHistory.push({
        isMine: true,
        userName: '几几个',
        photo:"http://static.yimifudao.com/static-files/user_pics/stu_head_pic/male.png",
        sendTime: new Date(),
        type: 'text',
        content: this.chatVal,
      })
      this.goBottom()
    },
    // 滚到底部
    goBottom(){
      // document.querySelector('.chat-area').scrollTo(0, 99999999)
      document.querySelector('.chat-area').scrollTop = 99999999
    }
  }
};
</script>
<style lang="stylus" scoped>
.home
  height 100%
.chat-container
  background #eee
  height 100%
.top
  border 1px solid red
  // background yellow
.bottom
  background pink
.send-input >>> input
  width 100%
.send-botton
  padding 0 20px
.chat-area
  min-height 100%
.chat-item
  .avatar
    width 100px
    height 100px
</style>
