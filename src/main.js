// alert(1)
import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store/store";
import "./registerServiceWorker";
// element相关
import { Button, Tabs, TabPane, Input, Select, Form, FormItem, Option, OptionGroup, Tree, Slider, InputNumber, Upload, Dialog, Message, Loading } from 'element-ui';
Vue.use(Button)
Vue.use(Tabs)
Vue.use(TabPane)
Vue.use(Input)
Vue.use(Select)
Vue.use(Option)
Vue.use(OptionGroup)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Tree)
Vue.use(Slider)
Vue.use(InputNumber)
Vue.use(Dialog)
Vue.use(Upload)
Vue.use(Loading)
Vue.prototype.$message = window.$message = Message

//不是本地才开eruda
import { env } from '@tools'
import eruda from 'eruda'
// 本地和正式环境没有eruda
if(!document.location.href.includes('9999') && env){
  eruda.init()
}

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
