
$(document).ready(function () {
    const api = 'http://opendata2.epa.gov.tw/AQI.json';
    const queryUrl = 'https://cors-anywhere.herokuapp.com/' + api;
    let AQIdata;
    // 使用 jQuery AJAX
    $.ajax({
        url: queryUrl
    }).done(function (msg) {
        AQIdata = msg;
        AQIdatalen = AQIdata.length;
        // 指定DOM
        let main = document.getElementById('main');
        let CountySelect = document.getElementById('CountySelect');
        let pagination = document.querySelector('.pagination');
        let searchPagination = document.querySelector('.searchPagination');
        //撈出AQIdata裡縣市的值
        let County = [];
        for (let i = 0; i < AQIdatalen; i++) {
            County.push(AQIdata[i].County);
        }
        //將AQIdata裡縣市的值，過濾重複的，之後塞進select裡面
        let filterCounty = new Set(County);
        filterCounty.forEach(function (val) {
            let newNode = document.createElement('option');
            let placeText = document.createTextNode(val);
            newNode.appendChild(placeText);
            CountySelect.appendChild(newNode);
        })

        // 目前頁數、總頁數、總資料筆數
        let currentPage, totalPage, totalItem;
        // 一頁6筆資料
        let perPageItem = 6;

        let dataFilter = [];
        // 將查詢縣市的資料放入到新的陣列-第一階段篩選
        function queryCounty(CountyName) {
            // 清空
            dataFilter = [];
            if (CountyName === '全部縣市') {
                dataFilter = AQIdata;
            } else {
                AQIdata.forEach(function (val) {
                    if (val.County === CountyName) {
                        dataFilter.push(val);
                    }
                })
            }
            //總資料筆數
            totalItem = dataFilter.length;
            // 計算總共有幾頁(使用無條件進位)
            totalPage = Math.ceil(totalItem / perPageItem);
        }
        let nameTransformData = [];//轉換屬性名稱，用於第二階段搜索
        function nameTransform(dataFilter) {
            //清空重置
            nameTransformData = []
            for (let i = 0; i < dataFilter.length; i++) {
                nameTransformData[i] = {};
                for (let p in dataFilter[i]) {
                    if (p == 'Status') {
                        nameTransformData[i].空氣品質 = dataFilter[i][p];
                    }
                    if (p == 'WindSpeed') {
                        nameTransformData[i].風速 = (dataFilter[i][p] + ' m/sec');
                    }
                    if (p == 'WindDirec') {
                        nameTransformData[i].風向 = (dataFilter[i][p] + ' °');
                    }
                    if (p == 'PublishTime') {
                        nameTransformData[i].日期 = dataFilter[i][p];
                    }
                    if (p == 'O3_8hr') {
                        nameTransformData[i]['O3_8小時平均'] = (dataFilter[i][p] + ' ppb');
                    }
                    if (p == 'CO_8hr') {
                        nameTransformData[i]['CO_8小時平均'] = (dataFilter[i][p] + ' ppm');
                    }
                    if (p == 'PM2.5_AVG') {
                        nameTransformData[i]['PM2.5平均值'] = (dataFilter[i][p] + ' μg/m³');
                    }
                    if (p == 'PM10_AVG') {
                        nameTransformData[i]['PM10平均值'] = (dataFilter[i][p] + ' μg/m³');
                    }
                    if (p == 'SO2_AVG') {
                        nameTransformData[i]['SO2平均值'] = (dataFilter[i][p] + ' ppb');
                    }
                    if (p == 'Longitude') {
                        nameTransformData[i].測站經度 = dataFilter[i][p] + ' °';
                    }
                    if (p == 'Latitude') {
                        nameTransformData[i].測站緯度 = dataFilter[i][p] + ' °';
                    }
                    if (p !== 'PublishTime' && p !== 'Status' && p !== 'WindSpeed' && p !== 'WindDirec' && p !== 'O3_8hr' && p !== 'CO_8hr' && p !== 'PM2.5_AVG' && p !== 'PM10_AVG' && p !== 'SO2_AVG' && p !== 'SiteName' && p !== 'County' && p !== 'Longitude' && p !== 'Latitude' && p !== 'SiteId') {
                        if (p == 'SO2' || p == 'O3' || p == 'NO2' || p == 'NOx' || p == 'NO') {
                            nameTransformData[i][p] = (dataFilter[i][p] + ' ppb');
                        } else if (p == 'CO') {
                            nameTransformData[i][p] = (dataFilter[i][p] + ' ppm');
                        } else if (p == 'PM10' || p == 'PM2.5') {
                            nameTransformData[i][p] = (dataFilter[i][p] + ' μg/m³');
                        } else {
                            nameTransformData[i][p] = dataFilter[i][p];
                        }
                    }
                }
            }
        }
        let searchFilter = [];//搜索被查詢縣市的資料-第二階段篩選
        let searchTotalItem;
        let perPageSearchItem = 12;
        let currentSearchPage, totalSearchPage;
        function search() {
            nameTransform(dataFilter);
            //取得搜尋內容
            let searchVal = $('.navRight input').val();
            //不分英文大小寫
            let reg = new RegExp(searchVal, "i");
            console.log(reg);
            searchFilter = [] //清空重置
            nameTransformData.forEach(function (val, i) {
                searchFilter[i] = {};
                for (let p in val) {
                    //關鍵字與屬性名稱比對
                    if (reg.test(p)) {
                        //符合即放入searchFilter陣列
                        searchFilter[i][p] = val[p];
                    }
                }
            })
            let checkEmapy = searchFilter[0];
            function isEmptyObject(checkEmapy) {
                for (var key in checkEmapy) { return false; }
                return true;
            }
            searchTotalItem = searchFilter.length;
            console.log(searchTotalItem);
            totalSearchPage = Math.ceil(searchTotalItem / perPageSearchItem);
            if (isEmptyObject(checkEmapy)) { randerEmptySearch(searchVal) } else { randerSearch(1) }
        }

        function randerEmptySearch(searchVal) {
            // 渲染頁面
            let strHtml = '';
            strHtml =
                `<div class="searchEmpty">
                <h3>搜尋不到" ${searchVal} "相關資料</h3>
                </div>`
            // 渲染頁面
            main.innerHTML = strHtml;
            pagination.style.display = 'none';
            searchPagination.style.display = 'none';
        }

        function randerSearchPage(totalSearchPage) {
            pagination.style.display = 'none';
            // console.log(searchTotalItem);
            if (searchTotalItem < perPageSearchItem) {
                searchPagination.style.display = 'none';
            } else {
                searchPagination.style.display = 'block';
                // 模板
                let prevPage = ` <li><a href="#" class='prevPage' data-num='-1'>《</a></li>`;
                let nextPage = `<li><a href="#" class='nextPage' data-num='1'>》</a></li>`;
                if (totalSearchPage > 0) {
                    let nbrHtml = '';
                    for (let i = 0; i < totalSearchPage; i++) {
                        let tempNbr = `<li><a href="#" class='pages search' data-page='${(i + 1)}'>${(i + 1)}</a></li>`
                        nbrHtml += tempNbr;
                    }
                    searchPagination.innerHTML = prevPage + nbrHtml + nextPage;
                }
            }
            //目前所在頁碼背景綠色
            let pages = document.querySelectorAll('.pages.search');
            let page;
            for (let i = 0; i < pages.length; i++) {
                page = pages[i];
                if (currentSearchPage == page.dataset.page) {
                    page.style.backgroundColor = 'green';
                    return;
                }
            }
        }

        function randerSearch(goPage) {
            // 起始資料變數,結束資料變數
            let startItem, endItem;
            //要前往的頁數是最後一頁
            console.log(totalSearchPage);
            if (goPage == totalSearchPage) {
                startItem = ((totalSearchPage - 1) * perPageSearchItem)
                endItem = searchTotalItem;
            } else {
                startItem = perPageSearchItem * (goPage - 1);
                endItem = (goPage * perPageSearchItem);
            }
            // 渲染頁面
            let totalStrHtml = '';
            for (let i = startItem; i < endItem; i++) {
                let SiteName = dataFilter[i].SiteName;
                let County = dataFilter[i].County;
                let headerHtml =
                    `<table >
                        <thead>
                        <tr>
                            <th colspan="2">
                                <h4>${County}-${SiteName}測站</h4>
                            </th>
                        </tr>
                        </thead>
                        <tbody>`
                let bodyHtml = '';
                let tempHtml = '';
                for (let p in searchFilter[i]) {
                    tempHtml =
                        `
                        <tr>
                            <td>${p}</td>
                            <td>${searchFilter[i][p]}</td>
                        </tr>
                        `
                    bodyHtml += tempHtml;
                }
                let footerHtml =
                    `</tbody>
                    </table>`;
                let strHtml = headerHtml + bodyHtml + footerHtml;
                totalStrHtml += strHtml;
            }
            // console.log(totalStrHtml);
            // 渲染Search頁面
            main.innerHTML = totalStrHtml;
            // 紀錄目前頁數用來點選上下頁用
            currentSearchPage = goPage;
            // 渲染頁碼
            randerSearchPage(totalSearchPage);
        }

        // 渲染有幾頁用
        function randerPage(totalPage) {
            //不顯示搜索功能頁數
            searchPagination.style.display = 'none';
            // 沒有資料或資料小於perPageItem筆數的時候，不顯示頁數
            if (totalItem < perPageItem) {
                pagination.style.display = 'none';
            } else {
                pagination.style.display = 'block';
                // 模板
                let prevPage = ` <li><a href="#" class='prevPage' data-num='-1'>《</a></li>`;
                let nextPage = `<li><a href="#" class='nextPage' data-num='1'>》</a></li>`;
                if (totalPage > 0) {
                    let nbrHtml = '';
                    for (let i = 0; i < totalPage; i++) {
                        let tempNbr = `<li><a href="#" class='pages' data-page='${(i + 1)}'>${(i + 1)}</a></li>`
                        nbrHtml += tempNbr;
                    }
                    pagination.innerHTML = prevPage + nbrHtml + nextPage;
                }
            }
            //目前所在頁碼背景綠色
            let pages = document.querySelectorAll('.pages');
            let page;
            for (let i = 0; i < pages.length; i++) {
                page = pages[i];
                if (currentPage == page.dataset.page) {
                    page.style.backgroundColor = 'green';
                    return;
                }
            }
        }

        // 渲染頁面
        function randerContent(goPage) {
            // 起始資料變數,結束資料變數
            let startItem, endItem;
            //要前往的頁數是最後一頁
            if (goPage === totalPage) {
                startItem = ((totalPage - 1) * perPageItem)
                endItem = totalItem;
            } else {
                startItem = perPageItem * (goPage - 1);
                endItem = (goPage * perPageItem);
            }
            // 渲染頁面
            let strHtml = '';
            for (let i = startItem; i < endItem; i++) {
                let SiteName = dataFilter[i].SiteName;
                let County = dataFilter[i].County;
                let AQI = dataFilter[i].AQI;
                let Pollutant = dataFilter[i].Pollutant;
                let 空氣品質 = dataFilter[i].Status;
                let SO2 = dataFilter[i].SO2;
                let CO = dataFilter[i].CO;
                let CO_8hr = dataFilter[i].CO_8hr;
                let O3 = dataFilter[i].O3;
                let O3_8hr = dataFilter[i].O3_8hr;
                let PM10 = dataFilter[i].PM10;
                let PM2_5 = dataFilter[i]['PM2.5'];
                let NO2 = dataFilter[i].NO2;
                let NOx = dataFilter[i].NOx;
                let NO = dataFilter[i].NO;
                let WindSpeed = dataFilter[i].WindSpeed;
                let WindDirec = dataFilter[i].WindDirec;
                let PublishTime = dataFilter[i].PublishTime;
                let PM2_5_AVG = dataFilter[i]['PM2.5_AVG'];
                let PM10_AVG = dataFilter[i].PM10_AVG;
                let SO2_AVG = dataFilter[i].SO2_AVG;
                let Longitude = dataFilter[i].Longitude;
                let Latitude = dataFilter[i].Latitude;
                //空氣品質背景色
                let statusColor;
                switch (空氣品質) {
                    case '良好': statusColor = 'status-aqi1';
                        break
                    case '普通': statusColor = 'status-aqi2';
                        break
                    case '對敏感族群不健康': statusColor = 'status-aqi3';
                        break
                    case '對所有族群不健康': statusColor = 'status-aqi4';
                        break
                    case '非常不健康': statusColor = 'status-aqi5';
                        break
                    case '危害': statusColor = 'status-aqi6';
                        break
                    default: statusColor = 'status';
                }
                let tempHtml = `<table class='${statusColor}'>
                <thead>
                <tr>
                    <th colspan="2">
                        <h4>${County}-${SiteName}測站</h4>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td>AQI</td>
                    <td>${AQI}</td>
                </tr>
                <tr>
                    <td>空氣品質</td>
                    <td>${空氣品質}</td>
                </tr>
                <tr>
                    <td>SO2</td>
                    <td>${SO2} ppb</td>
                </tr>
                <tr>
                    <td>CO</td>
                    <td>${CO} ppm</td>
                </tr>
                <tr>
                    <td>CO-8小時平均值</td>
                    <td>${CO_8hr} ppm</td>
                </tr>
                <tr>
                    <td>O3</td>
                    <td>${O3} ppb</td>
                </tr>
                <tr>
                    <td>O3-8小時平均值</td>
                    <td>${O3_8hr} ppb</td>
                </tr>
                <tr>
                    <td>PM2.5</td>
                    <td>${PM2_5} μg/m³</td>
                </tr>
                <tr>
                    <td>PM10</td>
                    <td>${PM10} μg/m³</td>
                </tr>
                <tr>
                    <td>NO2</td>
                    <td>${NO2} ppb</td>
                </tr>
                <tr>
                    <td>NOx</td>
                    <td>${NOx} ppb</td>
                </tr>
                <tr>
                    <td>NO</td>
                    <td>${NO} ppb</td>
                </tr>
                <tr>
                    <td>風速</td>
                    <td>${WindSpeed} m/sec</td>
                </tr>
                <tr>
                    <td>風向</td>
                    <td>${WindDirec}°</td>
                </tr>
                <tr>
                    <td>日期</td>
                    <td>${PublishTime}</td>
                </tr>
                <tr>
                    <td>PM2.5平均值</td>
                    <td>${PM2_5_AVG} μg/m³</td>
                </tr>
                <tr>
                    <td>PM10平均值</td>
                    <td>${PM10_AVG} μg/m³</td>
                </tr>
                <tr>
                    <td>SO2平均值</td>
                    <td>${SO2_AVG} ppb</td>
                </tr>
                <tr>
                    <td>測站經度</td>
                    <td>${Longitude}°</td>
                </tr>
                <tr>
                    <td>測站緯度</td>
                    <td>${Latitude}°</td>
                </tr>
                </tbody>
            </table>
                `
                strHtml += tempHtml;
            }
            // 渲染頁面
            main.innerHTML = strHtml;
            // 紀錄目前頁數用來點選上下頁用
            currentPage = goPage;
            // 渲染頁碼
            randerPage(totalPage)
        }
        function paginationClick(e) {
            if (e.target.nodeName === 'A') {
                if (e.currentTarget.className == 'pagination') {
                    // 要前往哪一頁的變數
                    let goPage
                    // 當上一頁或下一頁的變數
                    let perNext = Number(e.target.dataset.num);
                    // console.log(perNext);
                    // 當點選//上一頁
                    if (perNext === -1) {
                        if (currentPage + perNext < 1) {
                            return false;
                        }
                        goPage = currentPage - 1;
                        //下一頁
                    } else if (perNext === 1) {
                        if (currentPage + perNext > totalPage) {
                            return false;
                        }
                        goPage = currentPage + 1;
                    } else {
                        //直接點選分頁頁數
                        goPage = Number(e.target.dataset.page);
                        // console.log(goPage);
                        if (goPage === currentPage) {
                            return false;
                        }
                    }
                    randerContent(goPage)
                } else {
                    // 要前往哪一頁的變數
                    let goPage
                    // 當上一頁或下一頁的變數
                    let perNext = Number(e.target.dataset.num);
                    // console.log(perNext);
                    // 當點選//上一頁
                    if (perNext === -1) {
                        if (currentSearchPage + perNext < 1) {
                            return false;
                        }
                        goPage = currentSearchPage - 1;
                        //下一頁
                    } else if (perNext === 1) {
                        if (currentSearchPage + perNext > totalSearchPage) {
                            return false;
                        }
                        goPage = currentSearchPage + 1;
                    } else {
                        //直接點選分頁頁數
                        goPage = Number(e.target.dataset.page);
                        // console.log(goPage);
                        if (goPage === currentSearchPage) {
                            return false;
                        }
                    }
                    randerSearch(goPage)
                }
            }
        }
        //"縣市"選單
        $('#CountySelect').change(function (e) {
            e.preventDefault();
            let CountyName = e.target.value;
            queryCounty(CountyName);
            randerContent(1)
        });
        //"分頁"點擊
        $('.pagination,.searchPagination').click(function (e) {
            e.preventDefault();
            paginationClick(e)
        });
        // "搜索"點擊按鈕功能
        $('.searchBtn').click(function (e) {
            e.preventDefault();
            search();
            //清空搜尋欄
            $('.navRight input').val('');
        });
        //"搜索"按下Enter功能
        $('#search').keyup(function (e) {
            // alert(event.which);
            // if (event.which == 13) {
            //     alert("按下Enter了");
            //     // search();
            //     //清空搜尋欄
            //     // $('.navRight input').val('');
            // }
        });
    });
    //選單active功能
    $('header>ul>li').click(function () {
        $(this).toggleClass('active').siblings("li").removeClass("active");
    })
})
