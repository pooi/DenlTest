function init(chatData) {
    Vue.use(VueObserveVisibility);
    Vue.directive('observe-visibility', VueObserveVisibility.ObserveVisibility);
    console.log(chatData);
    var vue = new Vue({
        el: '#app',
        data: {
            title_login: 'Login',
            dialog: false,
            title: 'D&L chat',
            scrollData: {
                fab: false,
                offsetTop: 0,
                scrollT: 0,
                delta: 100,
                isShowFabTop: true,
                transition: 'slide-y-reverse-transition'
            },
            loginData:{
            },
            oneClick: null,
            dalMessage: null,
            itemData: null,
            requestList: [],
            recognitionDataHeaders: [
                {
                    text: '카테고리',
                    value: 'title'
                },
                {
                    text: '정확도 (%)',
                    align: 'right',
                    value: 'accuracy'
                }
            ],
            categoryData: null,
            shareSheet: false,
            shares: [
                { img: 'kakao.png', title: 'Kakao' },
                { img: 'facebook.png', title: 'Facebook' },
            ],
            loginErrorDialog: false,
            requestCheckDialog: false,
            requestSuccessDialog: false,
            requestErrorDialog: false,
            requestCancelDialog: false,
            requestCancelErrorDialog: false,
            msgData:{},
            todayDate: null,
            dialog: false,
            message: "",
            sender: "", //check 나중에 로그인 정보 이름으로 수정
            roomnum: "",
            // chat_lists: [
            //     {
            //         name : "유태우",
            //         msg : [
            //             { sentence: "연락드립니다", stamp: "유태우"},
            //             { sentence: "연락드", stamp: "정하민"},
            //             { sentence: "연락드립니", stamp: "유태우"}
            //         ],
            //         avatar : "/images/person.png"
            //     },
            //     {
            //         name: "유현수",
            //         msg: [
            //             { sentence: "연락드립니다", stamp: "유현수"},
            //             { sentence: "연락드", stamp: "정하민"},
            //             { sentence: "연락드립니", stamp: "유현수"}
            //         ],
            //         avatar : "/images/person.png"
            //     }
            // ],
            chat_lists : null,
            /*대화 창에서 상대방 메시지 데이터*/
            chat_clicked : null,
            my_name : ""
        },
        created() {
            // chat.on("disconnect", function (data) {
            //     alert(data.name);
            // });
            chat.on("chat message", function (data) {
                console.log(data);
                var obj = {};
                obj.sentence = data.msg;
                obj.stamp = data.name;
                var server_obj = {};
                var json = "";
                for(item in vue.chat_lists){
                    if(vue.chat_lists[item].roomport == data.room){
                        vue.chat_lists[item].msg.push(obj);
                        json = JSON.stringify(vue.chat_lists[item].msg);
                    }
                }
                server_obj.roomport = data.room;
                server_obj.json = json;
                axios({
                    method: 'post',
                    url: '/chat/send',
                    data: server_obj
                }).then(function (response){
                    var result_data = response.data;
                    console.log(result_data);
                }).catch(function (err){
                    if(err.response){
                        console.log(err.response);
                    }
                    else if(err.request){
                        console.log(err.request);
                    }
                    else{
                        console.log(err.message);
                    }
                })
            });

            chat.on("chat connect", function (data) {
                console.log(data);
                var server_obj = {};
                server_obj.roomport = data.room;
                axios({
                    method: 'post',
                    url: '/chat/update',
                    data: server_obj
                }).then(function (response){
                    var result_data = response.data;
                    for(var item in vue.chat_lists){
                        if(vue.chat_lists[item].roomport == result_data.roomport){
                            vue.chat_lists[item].msg = JSON.parse(result_data.message);
                        }else{
                            continue;
                        }
                    }
                }).catch(function (err){
                    if(err.response){
                        console.log(err.response);
                    }
                    else if(err.request){
                        console.log(err.request);
                    }
                    else{
                        console.log(err.message);
                    }
                })
            });

        },
        methods: {
            //현수 파트
            loginSejong: function () {
                var id = document.getElementsByName('loginId');
                var pw = document.getElementsByName('loginPw');
                loginSejong(id, pw);
            },
            ChatSelect: function (item) {
                this.chat_clicked = item.roomport;
                this.roomnum = item.roomport;
                if(this.sender == item.name2){
                    this.name = item.name1;
                }
                else{
                    this.name = item.name2;
                }
            },
            connect: function() {
                this.sender = this.loginData.user.id;
                chat.emit("chat connect", {
                    name: this.sender,
                    room: this.roomnum
                });
            },
            send: function () {
                if(this.message == ""){
                    alert("empty messaege");
                }
                else {
                    chat.emit("chat message", {
                        name: this.sender,
                        room: this.roomnum,
                        msg: this.message
                    });
                    this.message = "";
                }
            },
            // disconnect: function () {
            //     chat.emit("disconnect", {
            //         room: this.roomnum
            //     });
            // },
            onScroll (e) {
                var scroll = window.pageYOffset || document.documentElement.scrollTop;
                this.scrollData.offsetTop = scroll;

                this.scrollData.scrollT += (scroll-this.scrollData.offsetTop);

                if(this.scrollData.scrollT > this.scrollData.delta){
                    this.scrollData.isShowFabTop = true;
                    this.scrollData.scrollT = 0;
                }else if (this.scrollData.scrollT < -this.scrollData.delta) {
                    this.scrollData.isShowFabTop = false;
                    this.scrollData.scrollT = 0;
                }

                if(scroll === 0){
                    this.scrollData.isShowFabTop = false;
                    this.scrollData.scrollT = 0;
                    this.scrollData.offsetTop = 0;
                }
            },
            getMsg:function () {
                getMsg();
            },
            setMsgRead: function (msg) {
                setMsgRead(msg);
            },
            splitArray: function (array) {
                var chunk = 1;
                var breakpoint = this.__proto__.$vuetify.breakpoint;
                if(breakpoint.xs || breakpoint.xl)
                    chunk = 1;
                else if(breakpoint.sm)
                    chunk = 2;
                else if(breakpoint.md)
                    chunk = 3;
                else
                    chunk = 4;
                // console.log(this.__proto__.$vuetify.breakpoint);
                // console.log("chunk", chunk);

                var i,j,temparray;
                var newArray = [];
                for (i=0,j=array.length; i<j; i+=chunk) {
                    temparray = array.slice(i,i+chunk);

                    while(temparray.length < chunk){
                        temparray.push(null);
                    }
                    newArray.push(temparray);
                }
                return newArray;
            }
        },
        mounted: [
            function () {
                console.log(JSON.parse(chatData));
                this.chat_lists = JSON.parse(chatData);
            },
            function () {
                var today = new Date();
                var dd = today.getDate();
                var mm = today.getMonth() + 1; //January is 0!

                var yyyy = today.getFullYear();
                if (dd < 10) {
                    dd = '0' + dd;
                }
                if (mm < 10) {
                    mm = '0' + mm;
                }
                var today = yyyy + "-" + mm + "-" + dd; //dd + '/' + mm + '/' + yyyy;
                this.todayDate = today;
            },
            //송신자 이름 설정
            function() {
                this.my_name = this.loginData.user.name
            }
        ]
    });
    vue.oneClick = new OneClick(vue);
    vue.dalMessage = new DalMessage(vue);
    return vue;
}