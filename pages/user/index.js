// pages/user/index.js
const api = require('../../helper/apis');
const req = require('../../helper/reqwg');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        isLogin: false,
        user: {}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        api.getSetting()
            /**
             * res.authSetting['scope.userInfo']
             * 判断用户是否授权过   授权过为true,未授权过为false,从来没有选择过为 undefined.
             */
            .then(res => {
                //如果用户授权过，直接调用官方方法 getUserInfo,返回用户信息
                if (res.authSetting['scope.userInfo']) {
                    return api.getUserInfo()
                } else {
                    throw new Error('没有授权用户信息')
                }
            })
            .then(res => {
                let userInfo = wx.getStorageSync('userinfo');
                return userInfo ? userInfo : req.login(res)
            })
            .then(res => {
                this.setData({ isLogin: true, user: res })
            })
            .catch(e => {


            })
    },
    onGetUserInfo({ detail }) {
        // 如果用户授权过则 返回信息 getUserInfo
        if (detail.errMsg === 'getUserInfo:ok') {
            // console.log(detail);

            //进行登录操作
            req.login(detail)
                .then(info => {
                    this.setData({
                        isLogin: true,
                        user: info
                    })

                })
        }
    },
    onGetUserInfoByPhp({ detail }) {
        if (detail.errMsg === 'getUserInfo:ok') {
            req.loginPhp(detail)
                .then(info => {
                    this.setData({
                        isLogin: true,
                        user: info
                    })
                })
        }
    }

})