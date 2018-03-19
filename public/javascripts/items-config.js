

function init(init_data, init_category) {
    var vue = new Vue({
        el: '#app',
        data: {
            title: 'D&L',
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
            todayDate: null,
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
            requestCancelErrorDialog: false
        },
        methods: {
            getCurrentUrl: function () {
                return window.location.href;
            },
            getHastTags: function () {
                var list = [];
                for(var i=0; i<this.itemData.tags.length; i++){
                    list.push(this.itemData.tags[i]);
                }
                for(var i=0; i<this.itemData.recognition_tags.length; i++){
                    list.push(this.itemData.recognition_tags[i]);
                }
                return list;
            },
            vueMsToDate: function (date) {
                return msToDate(date);
            },
            vueMsToDateKo: function (date) {
                return msToDateKo(date);
            },
            convertStatus: function (status) {
                if(status === "WFA"){
                    return "수거전"
                }
                return ""
            },
            getCategoryBreadcrumbs : function () {

                var list = [];
                if(this.itemData.subcategory !== null){
                    var title = this.itemData.subcategory;
                    title = title.replace(" ", "_");
                    var keys = Object.keys(this.categoryData);
                    for(var i=0; i<keys.length; i++){
                        var key = keys[i];
                        var subcategories = this.categoryData[key]['subcategory'];
                        for(var j=0; j<subcategories.length; j++){
                            var subcategory = subcategories[j];
                            if(subcategory.name === title){
                                // this.category = this.categoryData[key];
                                // this.subcategory = subcategory;
                                list.push(this.categoryData[key].ko);
                                list.push(subcategory.ko);
                                return list;
                            }
                        }
                    }
                }
                return list;
            },
            getCategoryStringFromResult: function (title) {
                title = title.replace(" ", "_");
                var keys = Object.keys(this.categoryData);
                for(var i=0; i<keys.length; i++){
                    var key = keys[i];
                    var subcategories = this.categoryData[key]['subcategory'];
                    for(var j=0; j<subcategories.length; j++){
                        var subcategory = subcategories[j];
                        if(subcategory.name === title){
                            return this.categoryData[key].ko + " > " + subcategory.ko;
                            // this.subcategory = subcategory;
                            // this.subcategories = subcategories;
                            // this.category = this.categoryData[key];
                            // return;
                        }
                    }
                }
                return title;
            },
            shareTo: function (title) {
                var url = window.location.href;
                var origin = window.location.origin;

                var shareItem = this.itemData;
                if(title === "Kakao"){

                    var tags = "";
                    var tagList = this.getHastTags();
                    for(var i=0; i<Math.min(tagList.length, 5); i++){
                        var tag = tagList[i];
                        if(tag !== ""){
                            tags += "#" + tag + " ";
                        }
                    }
                    if(tagList.length > 5)
                        tags += "...";

                    Kakao.Link.sendDefault({
                        objectType: 'feed',
                        content: {
                            title: 'D&L 유실물' + " - " + shareItem.id + "(" + vue.getCategoryStringFromResult(vue.itemData.subcategory) + ")",
                            description: tags,
                            imageUrl: origin + "/" + shareItem.photos,
                            link: {
                                mobileWebUrl: url,
                                webUrl: url
                            }
                        },
                        buttons: [
                            {
                                title: '확인하기',
                                link: {
                                    mobileWebUrl: url,
                                    webUrl: url
                                }
                            }
                        ]
                    });
                }
                this.sheet = false;

            },
            sendRequest: function () {
                if(this.loginData.user === null){
                    this.loginErrorDialog = true;
                    return;
                }

                var data = {
                    lost_id: this.itemData.id,
                    user_id: this.loginData.user.id,
                    rgt_date: getTodayMs()
                };

                axios.post(
                    '/items/request',
                    data
                ).then(function (response) {
                    var data = response.data;
                    var insertId = data.insertId;
                    if (insertId != null) {
                        vue.requestSuccessDialog = true;
                        vue.getRequestUser();
                    } else {
                        vue.requestErrorDialog = true;
                    }
                    // console.log(response);
                })
                    .catch(function (error) {
                        alert(error);
                    });
            },
            getRequestUser: function () {
                var data = {
                    lost_id: this.itemData.id
                };

                axios.post(
                    '/items/requestList',
                    data
                ).then(function (response) {
                    var data = response.data;
                    console.log("requestList: ", data);
                    vue.requestList = data;
                    // var insertId = data.insertId;
                    // if (insertId != null) {
                    //     vue.requestSuccessDialog = true;
                    // } else {
                    //     vue.requestErrorDialog = true;
                    // }
                    // console.log(response);
                })
                    .catch(function (error) {
                        alert(error);
                    });
            },
            isAlreadyRequest: function () {
                if(this.loginData.user === null)
                    return false;

                for(var i=0; i<this.requestList.length; i++){
                    if(this.requestList[i].user.id === this.loginData.user.id)
                        return true;
                }
                return false;
            },
            isMyRequest: function () {
                if(this.loginData.user === null)
                    return false;

                return this.loginData.user.id === this.itemData.rgt_user.id;
            },
            removeRequest: function (request_id) {

                var chk = confirm("요청을 취소하시겠습니까?");
                if(!chk)
                    return;

                var data = {
                    request_id: request_id
                };

                axios.post(
                    '/items/removeRequest',
                    data
                ).then(function (response) {
                    var data = response.data;
                    console.log("data: ", data);
                    var affectedRows = data.affectedRows;
                    if (affectedRows > 0) {
                        // vue.requestSuccessDialog = true;
                        vue.getRequestUser();
                        vue.requestCancelDialog = true;
                    } else {
                        vue.requestCancelErrorDialog = true;
                    }
                })
                    .catch(function (error) {
                        alert(error);
                        vue.requestCancelErrorDialog = true;
                    });
            }
        },
        mounted: [
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
            function () {
                var json = init_data;
                this.itemData = JSON.parse(json);
                console.log(this.itemData);
            },
            function () {
                this.categoryData = JSON.parse(init_category);
                console.log("category: ", this.categoryData);
            },
            function () {
                var title = document.createElement('meta');
                title.name = "og:title";
                title.content = this.itemData.id;
                document.getElementsByTagName('head')[0].appendChild(title);

                var origin = window.location.origin;
                var image = document.createElement('meta');
                image.name = "og:image";
                image.content = origin + "/" + this.itemData.photos;
                document.getElementsByTagName('head')[0].appendChild(image);

                console.log(document.getElementsByTagName('head')[0]);
            },
            function () {
                this.getRequestUser();
            }
        ]
    });
    return vue;
}