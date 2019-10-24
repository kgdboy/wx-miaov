//index.js
const api = require('../../helper/apis.js');
const req = require('../../helper/reqwg.js');
//获取应用实例
const app = getApp();
Page({

  data: {
    // 定义猜你喜欢的数组
    guessLike:{},
    page:2,
    isLoading:false,
    isLoadAll:false
  },
  onLoad: function (options) {
    // 利用封装好的req和apis发起请求，第一个参数是对象类型的data，如果没有留空，第二个参数是对象类型的页数和条数
    req.getShops({
      //40 美食类，45 KTV
      // category_id:40
    },{
      page:1, //页数
      rows:10 //条数
    })
    .then(res=>{  
      if(res.length){ //如果有长度，说明取到了数据
        this.setData({  
          guessLike:[...res]  //利用参数展开语法将res的值一次性赋给guessLike
        });
      }
    })
  },
  // 触底刷新
  onReachBottom:function(){
    /* 
      一次性提取data中的各变量
      page : 用于分页
      guessLike : onload时返回的猜你喜欢数据1页10条
      isLoading : 是否正在加载中
      isLoadAll : 是否全部加载完毕
    */
    let {page,guessLike,isLoading,isLoadAll} = this.data;
    // 如果正在加载中 或 已全部加载完毕  直接返回 不往下走
    if (isLoading || isLoadAll) return;
    // 如果不是正在加载中，则改变它的状态为：加载中，防止重复加载
    this.setData({isLoading:true});
    // 发起请求向后端取数据，page默认为2，因为onload时是1，成功后要进行page+1
    req.getShops({}, {
        page: page, //页数
        rows: 10 //条数
      })
      .then(res => {
        if (res.length) { //如果有长度，说明取到了数据
          this.setData({
            guessLike: [...guessLike, ...res],//res中是新请求来的数据，guessLike是onload时请求来的数据，所以要先将guessLike数据放在前面。
            page: page + 1, //为下一次请求做准备
            isLoading: false //请求成功后，要将正在加载改变为假
          });
        }
        // 如果无数据返回时，后端会返回一个error，我们判断是否有这个error，如果有，说明没有数据了。这时我们将isLoading变为假，isLoadAll变为真
        if(res.error){
          this.setData({ isLoading: false,isLoadAll:true})
        }
      })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },



  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
})