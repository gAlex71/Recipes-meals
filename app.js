const mealsEl = document.getElementById('meals')
const favoriteContainer = document.getElementById('fav-meals')
const searchTerm = document.getElementById('search-term')
const searchBtn = document.getElementById('search')

const mealPopup = document.getElementById('meal-popup')
const mealInfoEl = document.getElementById('meal-info')
const popupCloseBtn = document.getElementById('close-popup')

getRandomMeal()
fetchFavMeals()

//Вывод рандомного рецепта
async function getRandomMeal(){
    const responce = await fetch('https://www.themealdb.com/api/json/v1/1/random.php')
    const responceData = await responce.json()
    const randomMeal = responceData.meals[0]

    addMeal(randomMeal, true)
}

// Получение id рецепта
async function getMealId(id){
    const responce = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i='+id)
    const responceData = await responce.json()
    const meal = responceData.meals[0]

    return meal
}

// Поиск рецепта
async function getMealsBySearch(term){
    const responce = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s='+term)
    const responceData = await responce.json()
    const meals = responceData.meals

    return meals
}

//Получение рецепта
function addMeal(mealData, random = false) {
    const meal = document.createElement('div')
    meal.classList.add('meal')

    meal.innerHTML = `
        <div class="meal-header">
            ${
                random ? 
                `<span class="random">
                    Random Recipe
                </span>` : ''
            } 
            <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}"/>
        </div>
        <div class="meal-body">
            <h4>${mealData.strMeal}</h4>
            <button class="fan-btn">
                <i class="fas fa-heart"></i>
            </button>
        </div>
    `

    const btn = meal.querySelector('.meal-body .fan-btn')
    btn.addEventListener("click", () => {
        if(btn.classList.contains('active')){
            removeMealLS(mealData.idMeal)
            btn.classList.remove('active')
        }else{
            addMealLS(mealData.idMeal)
            btn.classList.add('active')
        }

        fetchFavMeals()
    })

    //Показываем инфорацию по отдельному рецепту
    meal.addEventListener('click', () => {
        showMealInfo(mealData)
    })

    mealsEl.appendChild(meal)
}

//Помещаем в локальное хранилище избранный рецепт
function addMealLS(mealId){
    const mealIds = getMealsLS()
    localStorage.setItem('mealIds', JSON.stringify([...mealIds, mealId]))
}

//Удаление
function removeMealLS(mealId){
    const mealIds = getMealsLS()
    localStorage.setItem('mealIds', JSON.stringify(mealIds.filter(id => id !==mealId)))
}

// Получаем рецепты из хранилища
function getMealsLS(){
    const mealIds = JSON.parse(localStorage.getItem('mealIds'))
    //Если в избранное ничего не добавлено - []
    return mealIds === null ? [] : mealIds
}

//Получение избранных рецептов
async function fetchFavMeals(){
    //Очищаем контейнер и заново загружаем избранные рецепты
    favoriteContainer.innerHTML = ''

    const mealIds = getMealsLS()

    for(let i = 0; i < mealIds.length; i++){
        const mealId = mealIds[i]
        let meal = await getMealId(mealId)

        addMealFav(meal)
    }
}


function addMealFav(mealData) {
    const favMeal = document.createElement('li')

    favMeal.innerHTML = `
            <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
            <span>${mealData.strMeal}</span>
            <button class="clear"><i class="fas fa-window-close"></i></button>
    `

    const btn = favMeal.querySelector('.clear')
    btn.addEventListener('click', () => {
        removeMealLS(mealData.idMeal)
        //Загружаем избранные рецепты
        fetchFavMeals()
    })
    //Показываем инфорацию по отдельному рецепту
    favMeal.addEventListener('click', () => {
        showMealInfo(mealData)
    })

    favoriteContainer.appendChild(favMeal)
}

function showMealInfo(mealData){
    mealInfoEl.innerHTML = ''

    const mealEl = document.createElement("div")

    const ingredients = []
    //Ингредиенты
    for(let i = 1; i <= 20; i++){
        if(mealData['strIngredient' + i]){
            ingredients.push(
                `${mealData['strIngredient' + i]}
                - ${mealData['strMeasure'+i]}`)
        }else{
            break
        }
    }

    mealEl.innerHTML = `
        <h1>${mealData.strMeal}</h1>
        <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}"/>
        <p>${mealData.strInstructions}</p>
        <h3>Ingredients:</h3>
        <ul>
            ${ingredients.map((ing) => `<li>${ing}</li>`).join("")}
        </ul>
    `

    mealInfoEl.appendChild(mealEl)

    mealPopup.classList.remove('hidden')
}

//Данные берутся с сервера, поэтому запрос асинхронный
searchBtn.addEventListener('click', async () => {
    //Очищаем контейнер перед загрузкой результатов поиска
    mealsEl.innerHTML = ''

    const search = searchTerm.value
    //Получаем рецепты, которые удовлетворяют условию поиска
    const meals = await getMealsBySearch(search) 

    if(meals){
        meals.forEach(meal => {
            addMeal(meal)
        })
    }
})

//При клике на крестик скрываем окно рецепта
popupCloseBtn.addEventListener('click', () => {
    mealPopup.classList.add('hidden')
})