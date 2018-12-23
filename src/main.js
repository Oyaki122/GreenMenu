import Vue from 'vue';

import '@babel/polyfill';
import csvConvert from './csvConvert';
import categorySprit from './categorySprit';

let articleArray;
let specialArray;
const date = new Date();

const vue = new Vue({
    el: '#list',
    data() {
        return {
            cats: [
                {
                    message: '日替わり',
                },
            ],
            dishes: [],
            sp: {
                day: [1, 2, 3, 4, 5],
                dishes: {},
            },
            special_show: false,
            menu_show: true,
            isActive: 0,
            calendarActive: 0,
        };
    },
    methods: {
        select(index) {
            vueSet.article(index);
            this.isActive = index;
        },
        dayclick(dayIndex) {
            vueSet.special(dayIndex);
        },
    },

    updated() {
        this.$nextTick(() => {
            // ビュー全体が再レンダリングされた後にのみ実行されるコード
            fontAdjust();
        });
    },
});
// const csvConvert = (data) => {
//     const csvArray = data.split(/\r\n|\n|\r /); // 1行ごとに分割する
//     const result = [];

//     // 1行目から「項目名」の配列を生成する
//     const items = csvArray[0].split(',');

//     // CSVデータの配列の各行をループ処理する
//     // // 配列の先頭要素(行)は項目名のため処理対象外
//     // // 配列の最終要素(行)は空のため処理対象外
//     for (let i = 1; i < csvArray.length - 1; i++) {
//         const aLine = {};
//         // カンマで区切られた各データに分割する
//         const csvArrayD = csvArray[i].split(',');
//         // // 各データをループ処理する
//         for (let j = 0; j < items.length; j++) {
//             // 要素名：items[j]
//             // データ：csvArrayD[j]
//             aLine[items[j]] = csvArrayD[j];
//         }
//         result.push(aLine);
//     }

//     return result;
// };

// const categorySprit = (rowObj) => {
//     const splittedDishes = [];
//     const categoryArray = [];
//     for (let i = 0; i < rowObj.length; i++) {
//         const categoryPlace = categoryArray.indexOf(rowObj[i].category);
//         if (categoryPlace !== -1) {
//             splittedDishes[categoryPlace].data.push(rowObj[i]);
//         } else {
//             categoryArray.push(rowObj[i].category);
//             splittedDishes.push({
//                 title: rowObj[i].category,
//                 data: [rowObj[i]],
//             });
//         }
//     }

//     return { dishes: splittedDishes, category: categoryArray };
// };

const specialSprit = (rowJSON) => {
    const monday = rowJSON[5].day;
    const result = {
        data: rowJSON,
        monday,
    };
    return result;
};

const vueSet = {
    article(index) {
        if (index === 0) {
            vue.special_show = true;
            vue.menu_show = false;

            const csvDay = new Date(specialArray.monday);
            const nextweek = new Date(specialArray.monday);
            nextweek.setDate(nextweek.getDate() + 7);

            if (!(csvDay < date && date < nextweek)) {
                vueSet.special(0);
            } else {
                vueSet.special();
            }
            return;
        }
        vue.special_show = false;
        vue.menu_show = true;

        index--;
        vue.dishes.splice(0, vue.dishes.length);
        vue.dishes = vue.dishes.concat(articleArray[index].data);
    },

    category(categoryArray) {
        vue.cats.splice(1, vue.cats.length - 1);
        for (let i = 0; i < categoryArray.length; i++) {
            vue.cats.push({
                message: categoryArray[i],
            });
        }
    },

    special(day) {
        if (!specialArray) return;
        if (arguments.length === 0) {
            day = date.getDay();
            day--;
        }

        if (day < 0 || day >= 5) {
            day = 0;
        }
        vue.sp.dishes = specialArray.data[day];
        vue.calendarActive = day;
    },

    calendar(monday) {
        const baseDay = new Date(monday);
        for (let i = 0; i < 5; i++) {
            const dayText = `${baseDay.getMonth() + 1}/${baseDay.getDate() + i}`;
            vue.sp.day.splice(i, 1, dayText);
        }
    },
};

const fontAdjust = () => {
    const titles = document.getElementsByClassName('title');
    let textLength;
    for (let i = 0; i < titles.length; i++) {
        textLength = titles[i].innerText.length;
        if (textLength > 9) {
            titles[i].style.fontSize = `${(1.8 * 9) / textLength}em`;
        }
    }
};

const storageSet = (stindex, array) => {
    if (!localStorage) return;
    localStorage.setItem(stindex, JSON.stringify(array));
};

const storageLoad = () => {
    if (!localStorage) return;
    if ('menu' in localStorage) {
        articleArray = JSON.parse(localStorage.getItem('menu'));
        if ('category' in localStorage) {
            const categoryArray = localStorage.getItem('category');
            vueSet.category(JSON.parse(categoryArray));

            if ('special' in localStorage) {
                specialArray = JSON.parse(localStorage.getItem('special'));

                vueSet.article(0);
                vueSet.calendar(specialArray.monday);
            }
        }
    }
};

const getCSV = (csv) => {
    const p = new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `${csv}?${parseInt(new Date() / 1000, 10)}`, true);
        xhr.onreadystatechange = () => {
            // 本番用
            if (xhr.readyState === 4 && xhr.status < 305) {
                resolve(csvConvert(xhr.responseText));
            } else if (xhr.readyState === 4) {
                reject();
            }
        };
        xhr.send(null);
    });
    return p;
};

const menuGet = getCSV('menu.csv');
const specialGet = getCSV('special.csv');

Promise.all([menuGet, specialGet])
    .then((csv) => {
        if (csv[0] !== null || csv[0] !== undefined) {
            const splittedCSV = categorySprit(csv[0]);
            articleArray = splittedCSV.dishes;
            const categoryArray = splittedCSV.category;
            storageSet('menu', articleArray);
            vueSet.category(categoryArray);
            storageSet('category', categoryArray);
        }
        if (csv[1] !== null || csv[1] !== undefined) {
            specialArray = specialSprit(csv[1]);
            storageSet('special', specialArray);
            vueSet.calendar(specialArray.monday);
        }
        vueSet.article(0);
    })
    .catch((error) => {
        console.error(error);
    });

storageLoad();

// navigator.serviceWorker.getRegistrations().then(function (registrations) {
//     // 登録されているworkerを全て削除する
//     for (var registration of registrations) {
//         registration.unregister();
//     }
// });
// caches.keys().then(function (keys) {
//     var promises = [];
//     // キャッシュストレージを全て削除する
//     keys.forEach(function (cacheName) {
//         if (cacheName) {
//             promises.push(caches.delete(cacheName));
//         }
//     });
// });
navigator.serviceWorker.register('./service-worker.js').catch(console.error.bind(console));
