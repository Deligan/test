// Количество строк на одной странице
const rowsPerPage = 10;

// Данные о маршрутах
var routesData;

// Текущая страница
var currentPage = 1;

// Сохраняем выбранный гид
var selectedGuideId;

document.addEventListener("DOMContentLoaded", function () {
    // Создаем новый объект XMLHttpRequest
    var xhr = new XMLHttpRequest();

    // Определяем метод запроса и URL
    var method = "GET";
    var url = "https://edu.std-900.ist.mospolytech.ru/api/routes?api_key=b8d20682-3078-4e27-9746-61667622fb44";

    // Открываем новый запрос к API
    xhr.open(method, url, true);

    // Устанавливаем обработчик события изменения состояния запроса
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            // Парсим JSON-ответ
            routesData = JSON.parse(xhr.responseText);

            // Заполняем фильтр основных объектов
            fillMainObjectsFilter();

            // Отображаем первую страницу
            showPage(currentPage, rowsPerPage);
        }
    };

    // Отправляем запрос
    xhr.send();
});

// Функция для отображения данных на странице
function showPage(pageNumber, rowsPerPage) {
    const routesTableBody = document.getElementById("routes-table");
    const paginationContainer = document.getElementById("pagination-container");
    const mainObjectsFilter = document.getElementById("main-objects-filter");
    const searchInput = document.getElementById("search-input");

    // Фильтрация данных по основным объектам
    const filteredData = filterData(routesData, mainObjectsFilter.value, "mainObject");

    // Фильтрация данных по названию маршрута
    const searchData = filterData(filteredData, searchInput.value, "name");

    // Вычисляем индексы начала и конца для текущей страницы
    const startIndex = (pageNumber - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    // Очищаем текущие данные в таблице
    routesTableBody.innerHTML = "";

    // Добавляем строки на страницу
    for (let i = startIndex; i < endIndex && i < searchData.length; i++) {
        const route = searchData[i];

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${route.name}</td>
            <td>${route.description}</td>
            <td>${route.mainObject}</td>
            <td><button class="btn btn-primary" onclick="selectRoute(${route.id}, this)">Выбрать</button></td>
        `;
        routesTableBody.appendChild(row);

        // Если маршрут выбран, выделяем строку
        if (route.selected) {
            row.classList.add("selected-route");
        }
    }

    // Рассчитываем общее количество страниц
    const totalPages = Math.ceil(searchData.length / rowsPerPage);

    // Генерируем элементы пагинации
    paginationContainer.innerHTML = "";
    for (let i = 1; i <= totalPages; i++) {
        const pageItem = document.createElement("li");
        pageItem.classList.add("page-item");
        const pageLink = document.createElement("a");
        pageLink.classList.add("page-link");
        pageLink.href = "#";
        pageLink.textContent = i;
        pageLink.addEventListener("click", function () {
            currentPage = i;
            showPage(currentPage, rowsPerPage);
        });
        pageItem.appendChild(pageLink);
        paginationContainer.appendChild(pageItem);
    }
}

// Функция для обработки выбора маршрута
window.selectRoute = function (routeId, button) {
    // проверка
    alert("Выбран маршрут с ID: " + routeId);

    // Помечаем выбранный маршрут в данных
    const selectedRoute = routesData.find(route => route.id === routeId);
    selectedRoute.selected = true;

    // Выделяем строку
    button.closest("tr").classList.add("selected-route");

    // Отображаем таблицу с гидами для выбранного маршрута
    loadGuides(routeId);
    document.getElementById("guides-table-container").style.display = "block";
};

// Функция для заполнения фильтра основных объектов
function fillMainObjectsFilter() {
    const mainObjectsFilter = document.getElementById("main-objects-filter");

    // Создаем уникальный список основных объектов
    const uniqueMainObjects = [...new Set(routesData.map(route => route.mainObject))];

    // Добавляем пункт "Не выбрано"
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Не выбрано";
    mainObjectsFilter.appendChild(defaultOption);

    // Добавляем основные объекты в фильтр
    uniqueMainObjects.forEach(mainObject => {
        const option = document.createElement("option");
        option.value = mainObject;
        option.textContent = mainObject;
        mainObjectsFilter.appendChild(option);
    });

    // Устанавливаем обработчик события изменения фильтра
    mainObjectsFilter.addEventListener("change", function () {
        // При изменении значения фильтра обновляем таблицу
        showPage(currentPage, rowsPerPage);
    });
}

// Функция для фильтрации данных
function filterData(data, filterValue, property) {
    if (!filterValue) {
        return data;
    }

    return data.filter(item => item[property].toLowerCase().includes(filterValue.toLowerCase()));
}

// Данные о гидах
var guidesData;

// Функция для загрузки данных о гидах по выбранному маршруту
function loadGuides(routeId) {
    // Создаем новый объект XMLHttpRequest
    var xhr = new XMLHttpRequest();

    // Определяем метод запроса и URL
    var method = "GET";
    var url = `https://edu.std-900.ist.mospolytech.ru/api/routes/${routeId}/guides?api_key=b8d20682-3078-4e27-9746-61667622fb44`;

    // Открываем новый запрос к API
    xhr.open(method, url, true);

    // Устанавливаем обработчик события изменения состояния запроса
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            // Парсим JSON-ответ
            guidesData = JSON.parse(xhr.responseText);

            // Заполняем фильтр языков гидов
            fillFilters();

            // Отображаем таблицу гидов
            showGuidesTable();
        }
    };

    // Отправляем запрос
    xhr.send();
    const selectedRoute = routesData.find(route => route.id === routeId);
    document.getElementById("selected-route-name").textContent = `Выбранный маршрут: ${selectedRoute.name}`;
}

// Функция для отображения таблицы гидов
function showGuidesTable(filteredData) {
    const guidesTableBody = document.getElementById("guides-table");

    // Очищаем текущие данные в таблице
    guidesTableBody.innerHTML = "";

    // Используем фильтрованные данные, если они переданы, иначе используем все данные
    const dataToDisplay = filteredData || guidesData;

    // Добавляем строки на страницу
    for (let i = 0; i < dataToDisplay.length; i++) {
        const guide = dataToDisplay[i];

        const row = document.createElement("tr");
        row.innerHTML = `
            <td><img src="C:\Users\Диана\Desktop\Вуз\текущее\web\exam\img ex\гид 2.png" alt="Картинка профиля" class="img-fluid mb-2"></td>
            <td>${guide.name}</td>
            <td>${guide.language}</td>
            <td>${guide.workExperience}</td>
            <td>${guide.pricePerHour}</td>
            <td><button class="btn btn-primary" onclick="selectGuide(${guide.id}, this)">Выбрать</button></td>
        `;
        guidesTableBody.appendChild(row);

        // Если гид выбран, выделяем строку
        if (guide.selected) {
            row.classList.add("selected-guide");
        }
    }
}

// Функция для выбора гида и открытия модального окна
function selectGuide(guideId) {
  // Сохраняем выбранный гид в переменной
  selectedGuideId = guideId;

  // Выделяем строку с выбранным гидом
  const guidesTable = document.getElementById("guides-table");
  const rows = guidesTable.getElementsByTagName("tr");
  for (let i = 0; i < rows.length; i++) {
      rows[i].classList.remove("selected-guide");
      if (rows[i].dataset.id === guideId.toString()) {
          rows[i].classList.add("selected-guide");
      }
  }

  // Открываем модальное окно
  openOrderForm(guideId);
}

// Функция для открытия модального окна при выборе гида
function openOrderForm(guideId) {
  // Получаем информацию о выбранном гиде
  const selectedGuide = guidesData.find(guide => guide.id === guideId);
  const selectedRoute = routesData.find(route => route.selected);

  // Заполняем модальное окно данными о гиде
  document.getElementById("routeName").value = selectedRoute.name;
  document.getElementById("guideName").value = selectedGuide.name;

  // Открываем модальное окно
  const modal = new bootstrap.Modal(document.getElementById("orderModal"));
  modal.show();
}

// Функция для заполнения фильтров
function fillFilters() {
    // Заполняем фильтр языков гидов
    const languageFilter = document.getElementById("language-filter");
    const uniqueLanguages = [...new Set(guidesData.map(guide => guide.language))];
    languageFilter.innerHTML = '<option value="" selected>Не выбрано</option>';
    uniqueLanguages.forEach(language => {
        const option = document.createElement("option");
        option.value = language;
        option.textContent = language;
        languageFilter.appendChild(option);
    });
}

// Функция для применения фильтров
function applyFilters() {
    const languageFilterValue = document.getElementById("language-filter").value;
    const experienceFilterFrom = document.getElementById("experience-filter-from").value;
    const experienceFilterTo = document.getElementById("experience-filter-to").value;

    // Фильтрация данных
    const filteredGuides = guidesData.filter(guide => {
        const languageMatch = !languageFilterValue || guide.language === languageFilterValue;
        const experienceMatch =
            (!experienceFilterFrom || guide.workExperience >= parseInt(experienceFilterFrom)) &&
            (!experienceFilterTo || guide.workExperience <= parseInt(experienceFilterTo));

        return languageMatch && experienceMatch;
    });

    // Обновляем таблицу с учетом выбранных фильтров
    showGuidesTable(filteredGuides);
}