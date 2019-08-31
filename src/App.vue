<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
// import webfont from "webfont";
import { env, findQuery } from '@tools'
import storage from 'good-storage'
import { mapMutations, mapGetters } from 'vuex'
export default {
  name: "app",
  data(){
    return {

    }
  },
  computed:{
    ...mapGetters([

    ]),
  },
  mounted(){
    
  },
  components: {
    
  },
  methods:{
    
  }
}

</script>

<style lang="stylus">
@import "~@lib/css/reset.styl"
@import '~@lib/css/common.styl'
#app
  height 100%
  overflow scroll
</style>