// pages/shoplist/index.js
const req = require('../../helper/reqwg');
Page({
    rows: 6,
    data: {
        category_id: '',
        shopList: {},
        page: 2,
        isLoading: false,
        isLoadAll: false,
        isRange: '',
        type: '',
        isSort: '',
        distance: '500',
        sort: 'score'
    },
    onLoad: function(query) {
        this.setData({ category_id: query.id })
        req.getShops({ category_id: query.id, distance: this.data.distance, sort: this.data.sort }, {
                page: 1,
                rows: this.rows
            })
            .then(res => {
                if (!res.error) {
                    //加载成功
                    this.setData({
                        shopList: [...res]
                    })
                }
            })
    },
    // 触底刷新
    onReachBottom: function() {

        let { page, shopList, isLoading, isLoadAll, distance, sort } = this.data;
        // 如果正在加载中 或 已全部加载完毕  直接返回 不往下走
        if (isLoading || isLoadAll) return;
        // 如果不是正在加载中，则改变它的状态为：加载中，防止重复加载
        this.setData({ isLoading: true });
        // 发起请求向后端取数据，page默认为2，因为onload时是1，成功后要进行page+1
        req.getShops({ category_id: this.data.category_id, distance, sort }, {
                page: page,
                rows: this.rows
            })
            .then(res => {
                if (!res.error) { //如果有长度，说明取到了数据
                    this.setData({
                        shopList: [...shopList, ...res], //res中是新请求来的数据，guessLike是onload时请求来的数据，所以要先将guessLike数据放在前面。
                        page: page + 1, //为下一次请求做准备
                        isLoading: false //请求成功后，要将正在加载改变为假
                    });
                }
                // 如果无数据返回时，后端会返回一个error，我们判断是否有这个error，如果有，说明没有数据了。这时我们将isLoading变为假，isLoadAll变为真
                if (res.error) {
                    this.setData({ isLoading: false, isLoadAll: true })
                }
            })
    },
    // 点击遮罩时
    onmask() {
        this.setData({ type: null, isRange: '', isSort: '' })
    },
    //点时分类时
    onSelectTap(ev) {
        let { type } = ev.target.dataset;
        //如果两次点击的相等就取消所有，在这里不生效，不知道为什么
        if (type == this.data.type) {
            this.setData({ type: null, isRange: false, isSort: false })

        } else {
            this.setData({ type: type });
        }

        //如果点击的是rang，那么就显示距离多少米，把排序隐藏
        if (type == 'range') {
            this.setData({ isRange: true, isSort: false })

        } else if (type == 'sort') {
            this.setData({ isSort: true, isRange: false })
        }
    },

    //点击分类的具体值时
    onValueTap(ev) {
        //按哪个分类
        let { type } = ev.currentTarget.dataset; //distance 500
        // 该分类中的哪个值
        let { value } = ev.target.dataset; // sort distance
        //如果选择了智能排序，就把按什么排序的值赋给sort
        if (type == 'sort') {
            this.setData({ sort: value });
        }
        // 如果选择了附近，就把附近的值赋给 distance
        if (type == 'distance') {
            this.setData({ distance: value });
        }
        //初始化各菜单 
        this.setData({ type: '', isRange: '', isSort: '' })
            // 发起请求，商铺id，距离值，排序值
        req.getShops({
                category_id: this.data.category_id,
                distance: this.data.distance,
                sort: this.data.sort
            }, {
                page: 1,
                rows: this.rows
            })
            .then(res => {
                if (res.length) {
                    //加载成功，新的结果在res中，应该覆盖所有数据,page应该从第2页开始
                    this.setData({
                        shopList: [...res],
                        page: 2,
                        isLoadAll: false,
                    })
                }
            })
    },
})