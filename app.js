//app.js
App({
 /**
   * 设置小程序APPid
   */
  appid: {
    APP_ID: '111111111111111',
    APPVIP: 0,
    APP_SECRET: '',
    newid:'',
    shopname:'',
    shoptouxiang:'',
   openid:'',
   BJ_image_url: '',
   boxcolor: '',
   session_key :'',//储存获取到session_key
   template_id:'',
   access_token:'',
   avatarUrl:'',
   nickName: '',
   city:'',
   app_group:0,
  },

  /**
   * 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
   */
  onLaunch: function () {

    
  },

  /**
   * 当小程序启动，或从后台进入前台显示，会触发 onShow
   */
  onShow: function (options) {
    
  },

  /**
   * 当小程序从前台进入后台，会触发 onHide
   */
  onHide: function () {
    
  },

  /**
   * 当小程序发生脚本错误，或者 api 调用失败时，会触发 onError 并带上错误信息
   */
  onError: function (msg) {
    
  },



  /**********************
   * 通过商家appid 获取活动内容的   API初始页面的方法
   */
    getbaomingnews:function(cb,cb2){
      var that=this
      //获取，小程序主活动ID
      wx.request({
        url: 'https://api.sds2018.com/bmnews/app', 
        data: {
          'app_id': that.appid.APP_ID
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (res) {
          //************ 获取活动ID 
          that.appid.newid = res.data.newid
          that.appid.APP_SECRET = res.data.app_secret
          that.appid.shopname = res.data.shopname
          that.appid.shoptouxiang = res.data.touxiang 
          that.appid.template_id = res.data.template
          that.appid.APPVIP = res.data.isVIP
          that.appid.app_group = res.data.group
          that.reading(res.data.newid)
          //***********凭活动ID获取 活动API初始值的方法
          wx.request({
            url: 'https://api.sds2018.com/bmnews/index',
            data: {
              newsid: res.data.newid
            },
            header: {
              'content-type': 'application/json' // 默认值
            },
            success: function (res) {
              
              cb(res.data)
              that.getOpenid(cb2)
              that.get_accessToken(that.appid.APP_ID,that.appid.APP_SECRET)

            }
          })


          
        }
      })

    },
    /**********************/


    //获取   access_token
    get_accessToken: function (a, s) {
      var that = this;
      wx.request({
        url: 'https://api.sds2018.com/bmnews/get_accessToken', //仅为示例，并非真实的接口地址
        data: {
          appid: a,
          secret: s,
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (res) {
          that.appid.access_token = res.data
        }
      })

    },


    /**********************
     * 获取用户openid的方法
     */
    getOpenid: function (cb2) {
      var that = this
      wx.login({
        success: function (res) {
         // console.log('login返回值：' + res.code)
          wx.request({
            //获取openid接口  
            url: 'https://api.sds2018.com/bmnews/openid',
            data: {
              appid: that.appid.APP_ID,
              secret: that.appid.APP_SECRET,
              js_code: res.code,
              grant_type: 'authorization_code'
            },
            method: 'GET',
            success: function (res) {
              //console.log('openid返回值：')
              //console.log(res)
              //返回json字符串 转json数组
              //that.appid.UserID = res.data
              var jsonStr = res.data;
              jsonStr = jsonStr.replace(" ", "");
              if (typeof jsonStr != 'object') {
                jsonStr = jsonStr.replace(/\ufeff/g, "");//重点
                var jj = JSON.parse(jsonStr);
              }
             //***********console.log(jj.openid)
              
              that.appid.openid = jj.openid
              that.appid.session_key = jj.session_key
             // that.appid.OPEN_ID = res.data.openid
              //  获取openid后  获取  该用户报名信息 的方法
              that.getbmuser(that.appid.newid, that.appid.openid, cb2)
            }
          })
        }
      })
    },

    /**********************/


    /**********************
     * 获取openid后  获取  该用户报名信息 的方法
     */
    getbmuser: function (newsid, openid, cb2) {
      wx.request({
        url: 'https://api.sds2018.com/bmnews/getBaoming', //仅为示例，并非真实的接口地址
        data: {
          'newsid': newsid,
          'openid': openid
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (res) {
        //  console.log(res.data)
          cb2(res.data)
        }
      })
    },





    /**********************添加阅读量*/
    reading: function (newsid) {
      wx.request({
        url: 'https://api.sds2018.com/bmnews/newsRead', //仅为示例，并非真实的接口地址
        data: {
          'newid': newsid,
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (res) {
        }
      })
    },
    /**********************/

 /**********************再次出发支付*/
    pay_order: function (bmid,cb) {
      var that=this;
      wx.request({
        url: 'https://api.sds2018.com/bmnews/pay_order', //仅为示例，并非真实的接口地址
        data: {
          'bmid': bmid,
          'app_id': that.appid.APP_ID,
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (res) {
          cb(res.data)
        }
      })
    },
    /**********************/





    /**********************
 * 提交表单方法
 */
    setSubmit: function (e, cb) {
      
      var that=this
      
          wx.request({
            url: 'https://api.sds2018.com/bmnews/submit', //仅为示例，并非真实的接口地址
            data: {
              data: e,
              app_id: that.appid.APP_ID,
              newid: that.appid.newid,
              openid: that.appid.openid,
              session_key: that.appid.session_key,
              touxiang: that.appid.avatarUrl,
              username: that.appid.nickName,
              city: that.appid.city,
            },
            
            header: {
              'content-type': 'application/json' // 默认值
            },
            success: function (res) {
              //console.log('提交成功11')
              //console.log(res)
              cb(res.data)
            }
          })
      
      
    },




    /**********************
 * 触发模板消息
 */
    settemplate: function (fId, fObj, title, BMuserid, baoming_type) {
      var that =this;
      var d = {
        token: that.appid.access_token,
        touser: that.appid.openid,
        template_id: that.appid.template_id,//这个是1、申请的模板消息id，  
        page: '/pages/index/index',
        form_id: fId,
        value: {

          "keyword1": {
            "value": title,
            "color": "#4a4a4a"
          },
          "keyword2": {
            "value": fObj.姓名,
            "color": "#9b9b9b"
          },
          "keyword3": {
            "value": fObj.电话,
            "color": "#9b9b9b"
          },
          "keyword4": {
            "value": new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate() + " " + (new Date().getHours() > 9 ? new Date().getHours() : '0' + new Date().getHours()) + ':' + (new Date().getMinutes() > 9 ? new Date().getMinutes() : '0' + new Date().getMinutes()) + ':' + (new Date().getSeconds() > 9 ? new Date().getSeconds() : '0' + new Date().getSeconds()),
            "color": "#9b9b9b"
          },
          "keyword5": {
            "value": baoming_type+'号【'+BMuserid+'】',
            "color": "#ff0000"
          },
        },
        color: '#ccc',
        //emphasis_keyword: 'keyword1.DATA'
      }


      wx.request({
        url: 'https://api.sds2018.com/bmnews/send_msg',
        data: d,
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (res) {
          console.log("push msg");
          console.log(res);
        },
        fail: function (err) {
          // fail  
          console.log("push err")
          console.log(err);
        }
      });
      
    }  ,







    /***************** 验证必填方法******/
    yanzheng: function (name) {
        wx.showModal({
          title: '提示',
          content: name + '未填写',
          showCancel: false,
          success: function (res) {
          }
        })
      } ,

   



    /***************** 提交后提示框方法******/
    modalcnt: function (price,e, cb) {
      var that =this
      if (price){
        var num = e.num ? e.num:1;
        var money = price * num;
        wx.showModal({
          title: '提示',
          content: '您的电话是：' + e.电话 + '\n支付金额：' + money + '元',
          success: function (res) {
            if (res.confirm) {
              wx.showLoading({
              })

              that.setSubmit(e, cb)


            }
          }
        })

      }else{
        wx.showModal({
          title: '提示',
          content: '您的电话是：' + e.电话,
          success: function (res) {
            if (res.confirm) {
              wx.showLoading({
              })
              that.setSubmit(e, cb)
            }
          }
        })

      }
      
    } ,

    /***************** 手机号码错误提示******/
    yanzheng1: function () {
      wx.showModal({
        title: '提示',
        content: '手机格式错误',
        showCancel: false,
        success: function (res) {
        }
      })
    },

    /**********************
        * 未支付删除订单
        */
    delbaomingid: function (baomingid) {
      wx.request({
        url: 'https://api.sds2018.com/bmnews/delbaomingid', //仅为示例，并非真实的接口地址
        data: {
          'baomingid': baomingid,
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (res) {
        // console.log(res)
        }
      })
    },
  



    /***************** 循环倒计时方法******/
    getlasttime: function (e, cb, cb1) {
      var that=this;
      var now_time = Date.parse(new Date()) / 1000;//开始时间转化为时间戳
      var end_time = e; //结束时间转化为时间戳
      var remain_time = end_time - now_time; //剩余的秒数
      if (end_time > now_time){
      setTimeout(function (){
        var time = that.lasttime(remain_time)
           cb(time)
           that.getlasttime(e, cb, cb1);
        }
        , 1000)
      }else{
        cb1()
      }
    },


    /***************** 倒计时取值******/
    lasttime: function (e) {
      var that = this
      var remain_time = e; //剩余的秒数
      var remain_hour = Math.floor(remain_time / (60 * 60)); //剩余的小时
      var remain_minute = Math.floor((remain_time - remain_hour * 60 * 60) / 60); //剩余的分钟数
      var  remain_second = (remain_time - remain_hour * 60 * 60 - remain_minute * 60); //剩余的秒数
      if (remain_hour > 0) {
        return '倒计时: '+remain_hour+' 时 '+remain_minute+' 分 '+remain_second+' 秒';
      } else if (remain_minute > 0) {
        return '倒计时: '+remain_minute+' 分 '+remain_second+' 秒';
      } else {
        return '倒计时: '+remain_second+' 秒';
      }
    } ,

  
})
