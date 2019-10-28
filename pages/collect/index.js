// pages/collect/index.js
const req = require('../../helper/reqwg');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        shoplist: {}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        // 判断storage里面是否有openid
        let { openId } = wx.getStorageSync('userinfo');
        if (!openId) {
            wx.navigateTo({ url: '../login/index' })
        } else {
            //发请求
            req.getFav(openId)
                .then(res => {
                    if (res.code == 0) {
                        this.setData({
                            shoplist: [...res.data.map(item => item.info)]
                        })
                    }
                })
        }
    },
    onShow: function() {
        this.onLoad();
    },
    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {},

})