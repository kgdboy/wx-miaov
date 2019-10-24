const api = require('./apis');

const baseUrl = "https://data.miaov.com";

// 封装GET请求

let get =(op={})=>{
    return api.request({
        url:baseUrl+op.path,
        ...op,
        method:'GET'
    })
};

// 封装POST请求

let post = (op={})=>{
    if(!op.header) op.header={};
    return api.request({
        url:baseUrl+op.path,
        ...op,
        method:'POST',
        header:{
            'Content-Type':'application/x-www-form-urlencoded',
            ...op.header
        }
    })
    .then(res=>res.data)
};

// 调用方法 获取所有商品

exports.getShops = (data={},q)=>{
    return post({
        path:`/article/shoplist?page=${q.page}&rows=${q.rows}`,
        data
    })
}

// 获取商铺详情
// 通过传过来的id，向path地址发起请求并将结果return 回去。
exports.getShopDetail =id=>{
  return get({
    path:`/article/detail?id=${id}`,
  })
}

// 获取登录信息
/* 
    接口信息:
    path: https://wx.miaov.com/login
    method: GET
    header: {
        'X-WX-Code': code,
        'X-WX-Encrypted-Data': userInfo.encryptedData,
        'X-WX-IV': userInfo.iv,
    }
*/
/* exports.login = (userInfo)=>{
    return api.login()
    .then(res=>{
      return get({
        url: 'https://wx.miaov.com/login',
        header: {
          'X-WX-Code': res.code,
          'X-WX-Encrypted-Data': userInfo.encryptedData,
          'X-WX-IV': userInfo.iv,
        }
      })
    })
    .then(res=>{
      if(res.code===0){
        wx.setStorageSync('userInfo', res.data.userinfo);
        return res.data.userinfo;
      }else{
        throw res;
      }
    })
  }; */
exports.loginPhp = (userInfo)=>{
  return api.login()
  .then(res=>{
      return post({
          url:"https://phpwg.com/wx-login/wxLogin.php",
          data: {
              'X-WX-Code': res.code,
              'X-WX-Encrypted-Data': userInfo.encryptedData,
              'X-WX-IV': userInfo.iv,
          }
      })
  })
  .then(res=>{

    //拿到结果,如果没有errcode
    if (!res.errcode && res.openid) {
      userInfo.userInfo['openId'] = res.openid
      wx.setStorageSync('userinfo',userInfo.userInfo);
      return userInfo.userInfo;
      
    }else{
      throw new Error(res.errmsg)
    }
  })
  .catch(e=>{
    wx.showModal({title:'请求出错',content:'未获取到openid',showCancel:false})
  })
}
exports.login=(userInfo)=>{
    //先拿到code，它可以通过wx.load返回
    return api.login()
    .then(res=>{
      /* 
        根据后台接口下面的参数是需要我们传递过去的
      */
        return get({
            url:"https://wx.miaov.com/login",
            header: {
                'X-WX-Code': res.code,
                'X-WX-Encrypted-Data': userInfo.encryptedData,
                'X-WX-IV': userInfo.iv,
            }
        })
    })
    .then(res=>{
      /* 
        因为后台接口问题，我们不能正常接收到返回的值，这里做了虚拟
      */
        if(res.data.code==-1){
          //oP2Vr5UGV0sN4hMB9aUqs9bCS5YY
            let openId = 'oP2Vr5UGV0sN4hMB9aUqs9bCS5YY';
            userInfo.userInfo['openId'] = openId
            wx.setStorageSync('userinfo',userInfo.userInfo);
        }
        return userInfo.userInfo;
    })
}
// 检测是否收藏过
exports.isFav=({open_id,article_id}={})=>{
  return post({
    path:'/fav/getfavid',
    data:{
      open_id,
      article_id
    }
    
  })
}

//添加收藏
exports.addFav = ({open_id,article_id}={})=>{
  return post({
    path:'/fav/addfav',
    data:{
      open_id,
      article_id
    }
  })
};

//删除收藏
exports.delFav=({open_id,article_id,fav_id}={})=>{
  return post({
    path:'/fav/delfav',
    data:{
      open_id,article_id,fav_id
    }
  })
}