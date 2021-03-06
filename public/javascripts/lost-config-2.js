

function init(init_image, init_labels, init_texts, init_logos, init_colors, init_category, init_buildings) {
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
            statusColor: "#d84315",
            loginData:{
            },
            supporter: null,
            oneClick: null,
            dalMessage: null,
            categoryManager: null,
            chatManager: null,
            bottomTab: "lost",
            imgSrc: '',
            domEleArray: null,
            isFile: false,
            isProgress: false,
            locationProgress: false,
            isRecognitionProgress: true,
            recognitionData: null,
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
            // category: null,
            // tempCategory: null,
            // subcategory: null,
            // loadingSubCategory: false,
            categories: [
                '가방', '귀금속'
            ],
            // subcategories: [],
            // categoryData: {
            //
            // },
            hashtags: [],
            suggestTag: [],
            selectedSuggestTag: [],
            description: null,
            labels: [],
            texts: [],
            logos: [],
            colors: [],
            picker: null,
            date: null,
            menu: false,
            isShowMap: false,
            mapUrl: null,
            selectedBuilding: null,
            buildings: [
                '고인돌 잔디밭', '광개토관', '군자관', '다산관', '대양홀', '모짜르트홀', '무방관', '박물관', '세종관',
                '세종이노베이션센터', '아사달 연못', '애지헌', '영실관', '용덕관', '우정당', '율곡관', '이당관', '진관홀',
                '집현관', '충무관', '학생회관', '학술정보원', '행복기숙사'
            ],
            selectedRoom: null,
            rooms: [
                '101', '201', '301', '401'
            ],
            isDirect: false,
            modal: false,
            responseDialog: false,
            resSuccessMsg: "This is temporary message.",
            resSuccessCode: null,
            resSuccessRedirectHref: "/",
            responseErrorDialog: false,
            // categoryDialog: false,
            loginErrorDialog: false,
            detailDialog: false,
            submitDetailSuccessDialog: false,
            requestErrorDialog: false,
            buildingData : null
        },
        methods: {
            onScroll (e) {
                var scroll = window.pageYOffset || document.documentElement.scrollTop;

                this.scrollData.scrollT += (scroll-this.scrollData.offsetTop);
                this.scrollData.offsetTop = scroll;

                if(this.scrollData.scrollT > this.scrollData.delta){
                    this.scrollData.isShowFabTop = true;
                    this.chatManager.hide();
                    this.scrollData.scrollT = 0;
                }else if (this.scrollData.scrollT < -this.scrollData.delta) {
                    this.scrollData.isShowFabTop = false;
                    this.chatManager.show();
                    this.scrollData.scrollT = 0;
                }

                if(scroll === 0){
                    this.scrollData.isShowFabTop = false;
                    this.scrollData.scrollT = 0;
                    this.scrollData.offsetTop = 0;
                }
            },
            browseClick: function () {
                var inputFile = document.getElementById('file')
                inputFile.click()
            },
            removeFile: function () {
                this.domEleArray[1] = this.domEleArray[0].clone(true); // 쌔거(0번) -> 복사(1번)
                $('#file').replaceWith(this.domEleArray[1]);
                $("#file").change(function () {
                    vue.imageChange()
                });
                this.isFile = false
            },
            imageChange: function () {
                var inputFile = document.getElementById('file')

                var reader = new FileReader();
                reader.onload = function () {
                    // $('#uploaded-img').attr('src', reader.result);
                    vue.imgSrc = reader.result;
                }
                reader.readAsDataURL(inputFile.files[0]);
                this.isFile = true
            },
            uploadImage: function (e) {
                vue.isProgress = true;
                var form = document.getElementById('image-form')
                form.submit()
            },
            removeLogo: function (item) {
                this.logos.splice(this.logos.indexOf(item), 1);
            },
            removeHashtag: function(item){
                this.hashtags.splice(this.hashtags(item), 1);
                // this.hashtags = this.hashtags;
            },
            getCurrentLocation: function () {
                if (navigator.geolocation) {
                    this.locationProgress = true;
                    //위치 정보를 얻기
                    navigator.geolocation.getCurrentPosition(function (pos) {
                        var latitude = pos.coords.latitude;   // 적도의 북쪽 기준 각도인 위도
                        var longitude = pos.coords.longitude; // 그리니치 천문대의 동쪽 기준 각도인 경도
                        var accuracy = pos.coords.accuracy;   // 미터 단위의 정확도

                        // console.log(latitude + ", " + longitude);

                        // vue.buildings = null;
                        // var test_2 = [127.074170,37.551589]; //율근처 밖
                        var test = new Get_building_list(vue.buildingData, [longitude, latitude]);
                        // var test = new Get_building_list(vue.buildingData, test_2);
                        // console.log(init_buildings);
                        test.Verify_in_out();
                        // console.log(test.Getnearlist());//값 넘겨놓고 배열 초기화
                        var temp_arr = test.Getnearlist();
                        var new_arr = [];
                        for(temp_ar in temp_arr){
                            new_arr.push(temp_arr[temp_ar].building);
                        }
                        if(new_arr.length > 0)
                            vue.buildings = new_arr;

                        if(vue.buildings.length > 0)
                            vue.selectedBuilding = vue.buildings[0];

                        test.Resetnearlist();
                        vue.isShowMap = true
                        // // initMap(latitude, longitude);
                        //
                        // // 해당 위치의 구글 지도에 대한 정적 이미지 URL을 생성한다.
                        // var map_url = "http://maps.google.com/maps/api/staticmap"
                        //     + "?center=" + latitude + "," + longitude + "&size=640x640&scale=2&sensor=true&&markers=color:red%7Clabel:C%7C" + latitude +"," + longitude;
                        //
                        // // 대략적으로 지도 줌 레벨을 계산하여 설정한다.
                        // var zoomlevel = 17; // 대부분 최대한 확대하여 시작한다.
                        // if (accuracy > 80)  // 위치가 부정확할 경우 축소한다.
                        //     zoomlevel -= Math.round(Math.log(accuracy / 50) / Math.LN2);
                        //
                        // map_url += "&zoom=" + zoomlevel; // 줌 레벨을 URL에 추가한다.
                        //
                        // // API key 추가 ( 키 발급 필요, 키가 없으면 지도 요청시 응답 상태 코드가 403 (Forbidden) 떨어짐.)
                        // map_url += "&key=AIzaSyCEFVgjGWKUi7iA37ful7Fgkle2nGVzfv8";
                        //
                        // // 이제 이미지 객체에 지도를 출력한다.
                        // // image.src = map_url;
                        // vue.mapUrl = map_url;
                        // console.log(map_url);

                        var uluru = {lat: latitude, lng: longitude};
                        var map = new google.maps.Map(document.getElementById('div_map'), {
                            zoom: 17,
                            center: uluru
                        });
                        // console.log(map);
                        var marker = new google.maps.Marker({
                            position: uluru,
                            map: map
                        });

                        // alert(pos.coords.latitude + ", " + pos.coords.longitude);
                        // $('#latitude').html(pos.coords.latitude);     // 위도
                        // $('#longitude').html(pos.coords.longitude); // 경도
                        vue.locationProgress = false;

                        // var divMap = document.getElementById('div_map');
                        // divMap.appendChild("")
                    }, function (error) {
                        switch (error.code) {
                            case error.PERMISSION_DENIED:
                                alert("User denied the request for Geolocation.");
                                break;
                            case error.POSITION_UNAVAILABLE:
                                alert("Location information is unavailable.");
                                break;
                            case error.TIMEOUT:
                                alert("The request to get user location timed out.");
                                break;
                            case error.UNKNOWN_ERROR:
                                alert("An unknown error occurred.");
                                break;
                            default:
                                alert("An unknown error occurred.");
                                break;
                        }
                        vue.locationProgress = false;
                    });
                } else {
                    alert("이 브라우저에서는 Geolocation이 지원되지 않습니다.")
                }
            },
            changeSuggestTag: function(tag){
                if(this.selectedSuggestTag.includes(tag) > 0){
                    this.selectedSuggestTag.splice(this.selectedSuggestTag.indexOf(tag), 1);
                }else{
                    this.selectedSuggestTag.push(tag);
                }
                // console.log(this.selectedSuggestTag);
            },
            submitWithAxios: function () {

                if(this.loginData.user === null){
                    this.loginErrorDialog = true;
                    return;
                }

                var image = init_image;
                image = image.startsWith('/') ? image : '/' + image;

                var data = {
                    photos: image,
                    category: this.categoryManager.category === null ? "" : this.categoryManager.category.name,
                    subcategory: this.categoryManager.subcategory === null ? "" : this.categoryManager.subcategory.name,
                    brand: this.logos.length > 0 ? JSON.stringify(this.logos) : "",
                    building: this.selectedBuilding === null ? "" : this.selectedBuilding,
                    room: this.selectedRoom === null ? "" : this.selectedRoom,
                    tags: this.hashtags.length > 0 ? JSON.stringify(this.hashtags) : "",
                    recognition_tags: this.selectedSuggestTag.length > 0 ? JSON.stringify(this.selectedSuggestTag) : "",
                    description: this.description === null ? "" : this.description,
                    color: this.colors.length > 0 ? JSON.stringify(this.colors) : "",
                    recognition_result: this.recognitionData === null ? "" : JSON.stringify(this.recognitionData),
                    status: this.isDirect ? "P2P" : "WFA",
                    dcv_date: dateToMs(this.date),
                    rgt_date: getTodayMs(),
                    rgt_user: this.loginData.user.id,
                    location_code: "sju"
                };

                axios.post(
                    '/lost/submit',
                    data
                ).then(function (response) {
                    var data = response.data;
                    var insertId = data.insertId;
                    if (insertId != null) {
                        vue.resSuccessMsg = "성공적으로 등록하였습니다. 등록 번호 : ";
                        vue.resSuccessCode = insertId;
                        vue.resSuccessRedirectHref = "/items/" + insertId;
                        vue.responseDialog = true;
                    } else {
                        vue.responseErrorDialog = true;
                    }
                    // console.log(response);
                })
                    .catch(function (error) {
                        alert(error);
                    });
            },
            submitDetailWithAxios: function () {
                if(this.loginData.user === null){
                    this.loginErrorDialog = true;
                    return;
                }

                var data = {
                    lost_id: this.resSuccessCode,
                    brand: this.logos.length > 0 ? JSON.stringify(this.logos) : "",
                    tags: this.hashtags.length > 0 ? JSON.stringify(this.hashtags) : "",
                    description: this.description === null ? "" : this.description
                };

                axios.post(
                    '/lost/submitDetail',
                    data
                ).then(function (response) {
                    var data = response.data;
                    var affectedRows = data.affectedRows;
                    if (affectedRows > 0) {
                        vue.responseDialog = false;
                        vue.detailDialog = false;
                        vue.submitDetailSuccessDialog = true;
                        // vue.requestSuccessDialog = true;
                    } else {
                        vue.requestErrorDialog = true;
                        // vue.requestCancelErrorDialog = true;
                    }

                }).catch(function (error) {
                    alert(error);
                });

            }
        },
        mounted: [
            function () {
                this.domEleArray = [$('#file').clone()];
            },
            function () {

                if(init_image === null || init_image === ''){
                    return;
                }

                var data = {
                    image: init_image
                };

                axios.post(
                    '/lost/recognition',
                    data
                ).then(function (response) {
                    var data = response.data;
                    vue.isRecognitionProgress = false;
                    vue.recognitionData = data;
                    vue.categoryManager.changedCategoryFromResult(data[0]);
                    // console.log("recognitionData: ", vue.recognitionData);
                })
                    .catch(function (error) {
                        vue.isRecognitionProgress = false;
                        alert("이미지 인식에 실패하였습니다. 카테고리를 선택해주세요.");
                    });
            },
            function () {
                var text = init_logos + "," + init_labels + "," + init_texts;
                var tempList = text.split(',');
                var list = [];
                for(var i=0; i<tempList.length; i++){
                    if(tempList[i] !== '' && tempList[i] !== ' '){
                        list.push(tempList[i]);
                    }
                }
                var uniqueList = removeDuplicateUsingFilter(list);
                for(var i=0; i<uniqueList.length; i++){
                    this.suggestTag.push(uniqueList[i]);
                }

            },
            function (){
                var color = init_colors;
                this.colors = JSON.parse(color);
            },
            function () {
                this.buildingData = JSON.parse(init_buildings);
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
                this.date = today;
            }
        ],
        beforeDestroy() {
            this.chatManager.beforeDestroy();
        }
    });
    vue.supporter = new DalSupporter(vue);
    vue.oneClick = new OneClick(vue);
    vue.dalMessage = new DalMessage(vue);
    vue.categoryManager = new CategoryManager(vue, init_category);
    vue.chatManager = new ChatManager(vue);
    return vue;
}