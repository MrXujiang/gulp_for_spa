// 封装ajax
var ajax = {
    init: function(url, cb) {
        this.get(url, {}, cb);
    },
    get_params: function() {
        var url = location.search; //获取url中"?"符后的字串
        var params = {};
        if (url.indexOf("?") !== -1) {
            var str = url.substr(1);
            var strs = str.split("&");
            for (var i = 0; i < strs.length; i++) {
                var query = strs[i].split("=");
                params[query[0]] = unescape(query[1]);
            }
        }
        return params;
    },
    get: function(url, data, cb) {
        var _this = this;
        data.uid = this.get_params().uid;
        data.market = this.get_params().market;
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    var resData;
                    try {
                        resData = JSON.parse(xhr.responseText);
                    } catch (e) {
                        _this.error("数据解析异常");
                    }
                    cb(resData);
                } else {
                    _this.error("网络异常");
                }
            }
        };
        var t = [];
        for (var k in data) t.push(k + "=" + data[k]);
        xhr.open("GET", url + "?" + t.join("&"), true);
        xhr.send();
    },
    error: function(msg) {
        console.log(msg);
    }
};
// vue数据渲染
var vm = new Vue({
    el: '#root',
    data: {
        isPlay: true,
        isRotate: false,
        isFirstClick: true,
        resData: {
            stat_info: {
                share_state: 0,
                praise: 0,
                register_time: "",
                nickname: "xx",
                avatar: "",
                box_id: 0,
                total_len: 0,
                pvp_count: 0,
                max_star: 0,
                honor_title: "",
                friend_num: 0,
                first_friend: {
                    uid: "",
                    nickname: "",
                    avatar: "",
                    box_id: 0
                },
                first_follower: {
                    uid: "",
                    nickname: "",
                    avatar: "",
                    box_id: 0
                }
            }
        },
        endTime: Math.floor(new Date().getTime() / 1000),
        isShowMask: false,
        success: false,
        failTxt: '请求失败'
    },
    filters: {
        formatDate: function(value) {
            var timestamp = parseInt(value * 1000);
            var date = new Date(timestamp);

            function prefix_zero(num) {
                return num >= 10 ? num : "0" + num;
            };
            return date.getFullYear() + "年" +
                prefix_zero(date.getMonth() + 1) + "月" +
                prefix_zero(date.getDate()) + "日 ";
        }
    },
    created: function() {
        // 初始化数据
        this.init();
    },
    computed: {
        playStatus: function() {
            if (this.isPlay) {
                return 'img/ms_on@2x.png'
            } else {
                return 'img/ms_off@2x.png'
            }
        },
        durTime: function() {
            return Math.ceil((this.endTime - this.resData.stat_info.register_time) / 3600 / 24)
        },
        lengthTxt: function() {
            var len = this.resData.stat_info.total_len;
            if (len < 3000) {
                return ['玩蛇也是场修行', '突破自我是终极目标']
            } else if (len > 3000 && len < 40000) {
                return ['累计可往返[北京-上海]', '<span class="big-txt">' + parseInt(len / 3000) + '</span>趟！']
            } else {
                return ['可绕地球', '<span class="big-txt">' + parseInt(len / 40000) + '</span>圈']
            }
        },
        pvpCountTxt: function() {
            var count = this.resData.stat_info.pvp_count;
            if (count < 10) {
                return ['多参与到团战中去吧\n', '享受与队友并肩作战的畅快！'];
            } else {
                return ['<span class="big-txt">' + count + '</span>局团战', '是你奋斗的证明'];
            }
        },
        horonTxt: function() {
            var star_num = this.resData.stat_info.max_star;
            if (star_num > 72) {
                return ['无敌是多么寂寞', '说的就是你吧']
            } else {
                return ['下一个最强王者', '就是你']
            }
        },
        params: function() {
            return ajax.get_params()
        }
    },
    methods: {
        init: function() {
            var _this = this;
            ajax.init("http://devsnakeapi.weapp.me:8020/share/user_stat_2017/", function(res) {
                _this.resData = res.data;
            });
        },
        shareMy2017: function() {
            Tcsdzz.share(JSON.stringify({
                title: "这个游戏居然玩了一整年，完全停不下来！",
                desc: "我的2017贪吃大事记，快进来一较高下！",
                link: window.location.href,
                imgUrl: "http://unsplash.it/300/300",
                successCallback: 'shareSuccess',
                cancelCallback: 'shareFail'
            }));
        },
        download: function() {
            location.href = 'http://tcsdzz.com/auto_redirect.html?market=' + this.params.market;
        },
        showCode: function() {
            var codeImgs = document.getElementsByClassName("code-img");
            for (var i = 0; i < codeImgs.length; i++) {
                new QRCode(codeImgs[i], {
                    text: window.location.href,
                    width: 96,
                    height: 96,
                    colorDark: "#642c91",
                    colorLight: "#ffffff",
                    correctLevel: QRCode.CorrectLevel.L
                });
            }
        },
        toggleMusic: function() {
            if (this.isPlay) {
                this.$refs.BGM.pause();
                this.isPlay = false;
                this.isRotate = false;
            } else {
                this.$refs.BGM.play();
                this.isPlay = true;
                this.isRotate = true;
            }
        },
        initMusic: function() {
            var _this = this;
            document.body.addEventListener("touchstart", function() {
                if (_this.isFirstClick) {
                    _this.$refs.BGM.play();
                    _this.isRotate = true;
                    _this.isFirstClick = false;
                }
            }, false);
        },
        closeMask: function() {
            this.isShowMask = false;
        }
    },
    mounted: function() {
        this.initMusic();
        startH5();
        this.showCode();
    }
});

function startH5() {
    //防止页面之间产生空白间隙
    function fstyle() {
        document.body.style.backgroundColor = window.getComputedStyle(this.data[this.slideIndex].content).backgroundColor;
    }
    var wt = 0;
    var wft = 0;

    function mouseWheelHandle(evt) {
        var type = evt.type;
        // 判断鼠标滚轮的方向
        if (type == 'DOMMouseScroll' || type == 'mousewheel') {
            evt.delta = (evt.wheelDelta) ? evt.wheelDelta / 120 : -(evt.detail || 0) / 3;
        }
        if (evt.timeStamp - wt < 100 && evt.timeStamp - wft < 2000) {
            wt = evt.timeStamp;
            return;
        }

        wt = evt.timeStamp;
        wft = evt.timeStamp;

        if (!this.isSliding) {
            if (evt.delta < 0) {
                this.slideNext();
            } else if (evt.delta > 0) {
                this.slidePrev();
            }
        }
    }
    // 滚动的事件名
    var whellEvt = 'mozHidden' in document ? 'DOMMouseScroll' : 'mousewheel';
    // islider会根据data的内容自动生成ul>li标签，并设置相应类名
    var data = [];
    Array.prototype.slice.call(document.querySelectorAll('.content')).forEach(function(el) {
        data.push({ content: el });
    });

    var ISL = new iSlider(document.getElementById('main'), data, {
        isLooping: false,
        isVertical: 1, // 垂直滚动为1,水平滚动为0
        animateTime: 1000,
        plugins: [
            ['dot', { locate: 'relative' }]
        ],
        oninitialized: function() {
            fstyle.call(this);
            this.wrap.addEventListener(whellEvt, mouseWheelHandle.bind(this), false);
        }
    });

    ISL.bind(iSlider.DEVICE_EVENTS.hasTouch ? 'touchend' : 'click', '.next', function() {
        ISL.slideNext();
    });

    ISL.on('slideStart', function() {
        fstyle.call(this);
    });

    ISL.on('slideChange', function() {
        fstyle.call(this);
    });
}

function shareSuccess() {
    var url = "http://devsnakeapi.weapp.me:8020/share/share_stat_give_reward/";
    vm.isShowMask = true;
    ajax.get(url, {}, function(res) {
        if (res.code === 200) {
            vm.success = true;
        } else {
            vm.success = false;
            vm.failTxt = res.message;
        }
    });
}