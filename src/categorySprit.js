export default function (rowObj) {
    const splittedDishes = [];
    const categoryArray = [];
    for (let i = 0; i < rowObj.length; i++) {
        const categoryPlace = categoryArray.indexOf(rowObj[i].category);
        if (categoryPlace !== -1) {
            splittedDishes[categoryPlace].data.push(rowObj[i]);
        } else {
            categoryArray.push(rowObj[i].category);
            splittedDishes.push({
                title: rowObj[i].category,
                data: [rowObj[i]],
            });
        }
    }
    return { dishes: splittedDishes, category: categoryArray };
}
