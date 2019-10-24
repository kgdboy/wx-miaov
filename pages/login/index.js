const req = require('../../helper/reqwg');
// pages/login/index.js

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  /* 
    这个回调返回的参数 detail 里，装载着用户登录后的全部信息
  */
  onGetUserInfo({detail}){
    // detail.errMsg 里是有返回成功的消息
    if(detail.errMsg=="getUserInfo:ok"){
      // 如果有则调用login()方法，这个方法写在了req.js文件里
      req.login(detail)
      .then(res=>{
        wx.navigateBack();
      })
    
    }
    
    
  }

})