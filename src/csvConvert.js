export default function (data) {
    const csvArray = data.split(/\r\n|\n|\r /); // 1行ごとに分割する
    const result = [];

    // 1行目から「項目名」の配列を生成する
    const items = csvArray[0].split(',');

    // CSVデータの配列の各行をループ処理する
    // // 配列の先頭要素(行)は項目名のため処理対象外
    // // 配列の最終要素(行)は空のため処理対象外
    for (let i = 1; i < csvArray.length - 1; i++) {
        const aLine = {};
        // カンマで区切られた各データに分割する
        const csvArrayD = csvArray[i].split(',');
        // // 各データをループ処理する
        for (let j = 0; j < items.length; j++) {
            // 要素名：items[j]
            // データ：csvArrayD[j]
            aLine[items[j]] = csvArrayD[j];
        }
        result.push(aLine);
    }

    return result;
}
