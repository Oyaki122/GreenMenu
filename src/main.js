import Vue from "vue";
import "@babel/polyfill";

let articleArray, specialArray;

let vue = new Vue({
  el: "#list",
  data: function() {
    return {
      cats: [
        {
          message: "日替わり"
        }
      ],
      dishes: [],
      sp: {
        day: [1, 2, 3, 4, 5],
        dishes: {}
      },
      special_show: false,
      menu_show: true,
      isActive: 0,
      calendarActive: 0
    };
  },
  methods: {
    select: function(index) {
      vueSet.article(index);
      this.isActive = index;
      console.log(index);
    },
    dayclick: function(day_index) {
      vueSet.special(day_index);
    }
  },

  updated: function() {
    this.$nextTick(function() {
      // ビュー全体が再レンダリングされた後にのみ実行されるコード
      font_adjust();
    });
  }
});

const csvConvert = function(data) {
  const csvArray = data.split(/\r\n|\n|\r /); // 1行ごとに分割する
  let result = [];

  // 1行目から「項目名」の配列を生成する
  const items = csvArray[0].split(",");

  // CSVデータの配列の各行をループ処理する
  //// 配列の先頭要素(行)は項目名のため処理対象外
  //// 配列の最終要素(行)は空のため処理対象外
  for (var i = 1; i < csvArray.length - 1; i++) {
    let a_line = {};
    // カンマで区切られた各データに分割する
    const csvArrayD = csvArray[i].split(",");
    //// 各データをループ処理する
    for (var j = 0; j < items.length; j++) {
      // 要素名：items[j]
      // データ：csvArrayD[j]
      a_line[items[j]] = csvArrayD[j];
    }
    result.push(a_line);
  }
  //console.debug(jsonArray);
  return result;
};

const categorySprit = function(rowObj) {
  let splittedDishes = [];
  let categoryArray = [];
  for (var i = 0; i < rowObj.length; i++) {
    var categoryPlace = 0;
    if (-1 != (categoryPlace = categoryArray.indexOf(rowObj[i].category))) {
      splittedDishes[categoryPlace].data.push(rowObj[i]);
    } else {
      categoryArray.push(rowObj[i].category);
      splittedDishes.push({
        title: rowObj[i].category,
        data: [rowObj[i]]
      });
    }
  }

  return { dishes: splittedDishes, category: categoryArray };
};

const specialSprit = function(rowJSON) {
  const monday = rowJSON[5].day;
  const result = {
    data: rowJSON,
    monday: monday
  };
  return result;
};

const vueSet = {
  article: function(index) {
    if (index == 0) {
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
    } else {
      vue.special_show = false;
      vue.menu_show = true;
    }
    index--;
    vue.dishes.splice(0, vue.dishes.length);
    vue.dishes = vue.dishes.concat(articleArray[index].data);
    console.log(vue.dishes);
  },

  category: function(categoryArray) {
    vue.cats.splice(1, vue.cats.length - 1);
    for (var i = 0; i < categoryArray.length; i++) {
      vue.cats.push({
        message: categoryArray[i]
      });
    }
  },

  special: function(day) {
    if (!specialArray) return;
    if (arguments.length === 0) {
      day = date.getDay();
      day--;
    }

    if (day < 0 || day >= 5) {
      console.log("Holiday");
      day = 0;
    }
    vue.sp.dishes = specialArray.data[day];
    vue.calendarActive = day;
    console.log(vue.sp.dishes);
  },

  calendar: function(monday) {
    var baseDay = new Date(monday);
    for (var i = 0; i < 5; i++) {
      const dayText = baseDay.getMonth() + 1 + "/" + (baseDay.getDate() + i);
      vue.sp.day.splice(i, 1, dayText);
    }
  }
};

const font_adjust = function() {
  const titles = document.getElementsByClassName("title");
  let textLength;
  for (var i = 0; i < titles.length; i++) {
    textLength = titles[i].innerText.length;
    if (textLength > 9) {
      titles[i].style.fontSize = (1.8 * 9) / textLength + "em";
    }
  }
};

let storageSet = function(stindex, array) {
  if (!localStorage) return;
  localStorage.setItem(stindex, JSON.stringify(array));
};

let storageLoad = function() {
  if (!localStorage) return;
  if ("menu" in localStorage) {
    articleArray = JSON.parse(localStorage.getItem("menu"));
    if ("category" in localStorage) {
      const categoryArray = localStorage.getItem("category");
      vueSet.category(JSON.parse(categoryArray));

      if ("special" in localStorage) {
        specialArray = JSON.parse(localStorage.getItem("special"));

        vueSet.article(0);
        vueSet.calendar(specialArray.monday);
      }
    }
  }
};

const getCSV = function(csv) {
  const p = new Promise(function(resolve, reject) {
    var xhr;
    try {
      xhr = new ActiveXObject("Microsoft.XMLHTTP");
    } catch (e) {
      xhr = new XMLHttpRequest();
    }
    xhr.open("GET", csv + "?" + parseInt(new Date() / 1000), true);
    xhr.onreadystatechange = function() {
      // 本番用
      if (xhr.readyState === 4 && xhr.status < 305) {
        console.log("transport succeed");
        resolve(csvConvert(xhr.responseText));
      } else if (xhr.readyState === 4) {
        console.log("error");
        reject();
      }
    };
    xhr.send(null);
  });
  return p;
};

const date = new Date();
const menuGet = getCSV("menu.csv");
const specialGet = getCSV("special.csv");

Promise.all([menuGet, specialGet])
  .then(function(csv) {
    if (csv[0] !== null || csv[0] !== undefined) {
      const splittedCSV = categorySprit(csv[0]);
      articleArray = splittedCSV.dishes;
      const categoryArray = splittedCSV.category;
      storageSet("menu", articleArray);
      vueSet.category(categoryArray);
      storageSet("category", categoryArray);
    }
    if (csv[1] !== null || csv[1] !== undefined) {
      specialArray = specialSprit(csv[1]);
      storageSet("special", specialArray);
      vueSet.calendar(specialArray.monday);
    }
    vueSet.article(0);
  })
  .catch(function(error) {
    console.error(error);
  });

storageLoad();
// navigator.serviceWorker.getRegistrations().then(function (registrations) {
// 	// 登録されているworkerを全て削除する
// 	for (var registration of registrations) {
// 		registration.unregister();
// 	}
// });
// caches.keys().then(function (keys) {
// 	var promises = [];
// 	// キャッシュストレージを全て削除する
// 	keys.forEach(function (cacheName) {
// 		if (cacheName) {
// 			promises.push(caches.delete(cacheName));
// 		}
// 	});
// });
