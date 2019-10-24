// pages/shopdetails/index.js
const api = require('../../helper/apis.js');
const req = require('../../helper/reqwg.js');
const qqmapsdk = new api.createQQMap(); //获得sdk的实例 createQQMap在apis.js里封装了。并且开发者id也写在了这个方法中，所以可以直接new，不用传开发者id了
Page({

    /**
     * 页面的初始数据
     */
    data: {
        id: '', //商铺id
        shopDetails: {}, //商铺详细信息
        fav_id: '', //商铺收藏id
        address: '',
        distance: '',
        status: 0,
        error: '',
        hasGetLocation: true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let id = options.id;
        this.setData({ id: id });
        req.getShopDetail(id)
            .then(res => {
                if (!res.error) { //如果有长度，说明取到了数据
                    this.setData({
                        shopDetails: res.data
                    });
                    // 将经纬度信息获取并return出去
                    return {
                        "latitude": this.data.shopDetails.info.lat,
                        "longitude": this.data.shopDetails.info.lng
                    }
                } else {
                    throw '获取商铺详情失败';
                }
            })
            .then(location => {
                return Promise.all([
                    qqmapsdk.reverseGeocoder({ location }),
                    this._getLocation(location), //封装了一个方法，用于获取位置信息
                    location
                ]);
            })
            .then(([shopAddress, mylocation, tolocation]) => {
                if (shopAddress.status == 0) {
                    this.setData({ "address": shopAddress.result.address });
                }

            })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },
    /* 
      tolocation:目标位置信息
    */
    _getLocation(tolocation) {
        //获取自已当前位置信息的经纬度
        return api.getLocation({ type: 'gcj02' })
            .then(mylocation => {
                this.setData({
                        //将是否获取位置信息的值改成 真
                        hasGetLocation: true
                    })
                    //组装自己位置信息的数据放入from待用
                let from = {
                    latitude: mylocation.latitude,
                    longitude: mylocation.longitude
                };
                //通过方法获取距离
                return qqmapsdk.calculateDistance({
                        mode: 'driving',
                        from: from,
                        to: [{
                            latitude: 41.1 + Math.random() / 10, //41.1+Math.random()/10 tolocation.latitude  应该是通过tolocation.latitude获取，但是因为数据是假的会报错，所以我们这里使用随机数模板
                            longitude: 121.1 + Math.random() / 10 //tolocation.longitude
                        }]

                    })
                    .then(res => {
                        if (res.status == 0) {
                            this.setData({ distance: res.result.elements[0].distance, duration: Math.ceil(res.result.elements[0].duration / 60) });
                        }
                    })
            })
            /* 
              处理所有异常错误信息
            */
            .catch(e => {
                // 当用户未授权位置时，会抛出错误 e.errMsg = getLocation:fail auth deny
                if (e.errMsg == 'getLocation:fail auth deny') {
                    //此时我们将是否获取位置信息的值改为假，前台页面会根据这个值来显示或隐藏 “授权位置” 按钮 
                    this.setData({ hasGetLocation: false })
                }
                switch (e.status) {
                    case 310:
                        this.setData({ error: '请求参数信息有误', status: -1 });
                        break;
                    case 311:
                        this.setData({ error: 'key格式错误', status: -1 });
                        break;
                    case 306:
                        this.setData({ error: '请求有护持信息请检查字符串', status: -1 });
                        break;
                    case 110:
                        this.setData({ error: '请求来源未被授权', status: -1 });
                        break;
                    case 348:
                        this.setData({ error: '参数错误', status: -1 });
                        break;
                    case 373:
                        this.setData({ error: '距离太远', status: -1 });
                        break;
                }

            })
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        /* 
          onshow的执行非常快，当刚进入页面时被请求的商铺详情还没有加载来，onshow已经就执行了，所以获取不到任何信息
          如果点击左上角的返回按钮时，不会加载onload，但是会加载onshow，这里shopDetails就已经有数据了。
          所以我们在这先取出 shopDetails的值，然后用Object.keys(shopDetails)这个方法返回所有的key。如果有长度证明已经有数据了
          这时我们再调用_getLocation()方法
        */
        /**
         * 判断页面返回时有没有收藏过店铺
         */
        let userinfo = wx.getStorageSync('userinfo');
        if (userinfo) {
            //  调用接口判断是否被收藏过，传openId,商铺id，返回的是收藏id号，如果没有则表示未收藏过
            return req.isFav({ open_id: userinfo.openId, article_id: this.data.id })
                .then(res => {
                    //收藏以后的动作
                    if (res.code == 0) {
                        this.setData({ fav_id: res.fav_id })
                    }

                })
        }
        let { shopDetails } = this.data;
        let arr = Object.keys(shopDetails);
        if (arr.length) {
            this._getLocation({
                "latitude": shopDetails.info.lat,
                "longitude": shopDetails.info.lng
            });
        }
    },

    favShop() {
        //收藏店铺  先看是否登录了,判断是否登录的条件是查看 storages里是否有userinfo
        let userInfo = wx.getStorageSync('userinfo');
        if (!userInfo) {
            // 如果没有userinfo则跳转至/login/index页面，让用户进行登录
            wx.navigateTo({
                url: '../login/index',
            })
        }
        if (this.data.fav_id == "") {
            // 调用收藏接口，传openId,商铺id
            req.addFav({

                    open_id: userInfo.openId,
                    article_id: this.data.id
                })
                // 收藏成功与否和openId有关，必须是oP2Vr5UGV0sN4hMB9aUqs9bCS5YY
                .then(res => {
                    // {code: 0, fav_id: 119, msg: "收藏成功"}
                    if (res.code == 0) {
                        // 将收藏id存入data中，以上来判断这个商铺是否被收藏过。
                        this.setData({ fav_id: res.fav_id });
                        wx.showToast({ 'title': res.msg });
                    }
                })
        } else {
            //取消收藏，调用取消收藏接口，传openId,商铺id，收藏id
            req.delFav({
                    open_id: userInfo.openId,
                    article_id: this.data.id,
                    fav_id: this.data.fav_id
                })
                .then(res => {
                    //{user_id: "1", fav_id: "118", code: 0, msg: "取消成功"}{}
                    if (res.code == 0) {
                        this.setData({ fav_id: "" });
                        wx.showToast({ 'title': res.msg });
                    }

                })
        }
    },
})