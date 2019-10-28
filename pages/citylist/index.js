const cityData = require('./cityData.js');
// pages/citylist/index.js
Page({
    posArr: [],

    currentId: '',
    /**
     * 页面的初始数据
     */
    data: {
        cityData,
        selectCity: '',
        active: false
    },
    onReady: function() {
        wx.createSelectorQuery()
            .selectAll('.sel-list')
            .boundingClientRect(rect => {
                this.posArr = rect.map(elt => {
                    return {
                        top: elt.top,
                        bottom: elt.bottom,
                        id: elt.dataset.id
                    }
                })

            }).exec();
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {

    },

    selectCity(ev) {
        let { id } = ev.target.dataset;
        if (id) {
            this.setData({
                selectCity: id
            })
            this.currentId = id;

        }
    },
    slideSelect(ev) {

        // 滑动选择
        //获取快速搜索字母的坐标,获取当前滑动的节点坐标
        let { clientY } = ev.touches[0];
        // 获取页面节点信息
        let letter = this.posArr.find(elt => {
            return clientY > elt.top && clientY < elt.bottom;
        })
        this.setData({ active: false })
        if (letter && this.currentId != letter.id) {
            this.currentId = letter.id
            this.setData({ selectCity: letter.id });
            this.setData({ active: true })
        }
    },
})