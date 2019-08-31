/**
 * 判断环境
 */
export const env = (window.location.host.match(/\w+(?:-)/) || [])[0] || ""
console.log('环境：',env)
/**
 * 判断平台
 */
const is_iPd = navigator.userAgent.match(/(iPad)/i) != null
const is_mobi = navigator.userAgent.toLowerCase().match(/(ipod|iphone|android|coolpad|mmp|smartphone|midp|wap|xoom|symbian|j2me|blackberry|win ce)/i) != null

export const platform = is_iPd ? 'pad' : (is_mobi ? 'mob' : 'pc')
console.log('平台：',platform)

// rem自适应尺寸
export function fontSizeAuto(){
  var viewportWidth = document.documentElement.clientWidth;
  //屏幕大于750像素宽 不能再大了
  if(viewportWidth > 750) viewportWidth = 750
  document.documentElement.style.fontSize = viewportWidth/750*100+'px';
  console.log(document.documentElement.style.fontSize)
}

/**
 * 从url query中找某值
 * @param {*} arg 目标key
 * @param {*} defaultValue 默认值
 */
export function findQuery(arg, defaultValue) {
  if (defaultValue === 0) {
    defaultValue = 0;
  } else if (!defaultValue) {
    defaultValue = "";
  }
  var _reg = new RegExp(`${arg}=(.*?)(#|$|&)`);
  let _arg = window.location.href.match(_reg);
  if (_arg && _arg[1]) {
    return _arg[1] === "0" ? 0 : _arg[1];
  } else {
    return defaultValue;
  }
}

// 节流
export function throttle(fn,delay){
  var last = 0
  return function(){ //这里不可以用箭头写法，因为下边的this就需要用这个func作用域的参数
    var curr = new Date()
    if (curr - last > delay){
      fn.apply(null, arguments) //arguments为this的function作用域的
      last = curr
    }
  }
}

// 去抖
export function debounce(fn,delay){
  let timer
  return function(){
    clearTimeout(timer)
    timer = setTimeout(()=>{
      fn.apply(null, arguments)
    },delay)
  }
}

// 在光标处回车输入<br>
export function insertHtml(html) {
  var sel, range;
  if (window.getSelection) {
      // IE9 或 非IE浏览器
      sel = window.getSelection();
      if (sel.getRangeAt && sel.rangeCount) {
          range = sel.getRangeAt(0);
          range.deleteContents();
          // Range.createContextualFragment() would be useful here but is non-standard and not supported in all browsers (IE9, for one)
          var el = document.createElement("div");
          el.innerHTML = html;
          var frag = document.createDocumentFragment(),
              node, lastNode;
          while ((node = el.firstChild)) {
              lastNode = frag.appendChild(node);
          }
          range.insertNode(frag);
          // Preserve the selection
          if (lastNode) {
              range = range.cloneRange();
              range.setStartAfter(lastNode);
              range.collapse(true);
              sel.removeAllRanges();
              sel.addRange(range);
          }
      }
  } else if (document.selection && document.selection.type != "Control") {
      // IE < 9
      document.selection.createRange().pasteHTML(html);
  }
}

//全屏
export function fullScreen(){
  var el = document.documentElement;
  var rfs = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullscreen;      
  if(typeof rfs != "undefined" && rfs) {
      rfs.call(el);
  };
  return;
}

 //退出全屏
export function exitScreen(){
  if (document.exitFullscreen) {  
      document.exitFullscreen();  
  }  
  else if (document.mozCancelFullScreen) {  
      document.mozCancelFullScreen();  
  }  
  else if (document.webkitCancelFullScreen) {  
      document.webkitCancelFullScreen();  
  }  
  else if (document.msExitFullscreen) {  
      document.msExitFullscreen();  
  } 
  if(typeof cfs != "undefined" && cfs) {
      cfs.call(el);
  }
}