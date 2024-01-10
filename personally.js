document.addEventListener("DOMContentLoaded", function () {
    // 

    // Обработчик события для кнопки "Оформить заявку"
    document.getElementById("orderButton").addEventListener("click", function () {
        // Получаем выбранный гид
        const selectedGuide = guidesData.find(guide => guide.selected);

        // Проверяем, что гид выбран
        if (!selectedGuide) {
            alert("Выберите гида перед оформлением заявки.");
            return;
        }

        // Получаем выбранный маршрут
        const selectedRoute = routesData.find(route => route.selected);

        // Заполняем модальное окно данными о маршруте и гиде
        document.getElementById("routeNameModal").value = selectedRoute.name;
        document.getElementById("guideNameModal").value = selectedGuide.name;

        // Открываем модальное окно
        const modal = new bootstrap.Modal(document.getElementById("orderModal"));
        modal.show();
    });

    // Обработчик события отправки формы
    document.getElementById("orderForm").addEventListener("submit", function (event) {
        event.preventDefault();

        // Получаем значения из формы для отправки на сервер
        const excursionDate = document.getElementById("excursionDate").value;
        const startTime = document.getElementById("startTime").value;
        const duration = document.getElementById("duration").value;
        const groupSize = document.getElementById("groupSize").value;
        const fastExit = document.getElementById("fastExitCheckbox").checked;
        const souvenirs = document.getElementById("souvenirsCheckbox").checked;

        // Отправляем данные на сервер
        sendOrderToServer(excursionDate, startTime, duration, groupSize, fastExit, souvenirs);
    });

// Функция для отправки заказа на сервер
function sendOrderToServer(excursionDate, startTime, duration, groupSize, fastExit, souvenirs) {
    // Создаем объект с данными заказа
    const orderData = {
        date: excursionDate,
        time: startTime,
        duration: duration,
        guide_id: selectedGuide.id,
        route_id: selectedRoute.id,
        persons: groupSize,
        optionFirst: fastExit,
        optionSecond: souvenirs,
         // Добавьте другие обязательные поля, если они есть в вашем запросе
    };

    // Отправляем запрос на сервер
    fetch("http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/orders?api_key=b8d20682-3078-4e27-9746-61667622fb44", {
         method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
    })
        .then(response => response.json())
        .then(data => {
            // Обработка успешного ответа от сервера
            console.log("Заказ успешно отправлен:", data);
            // Закрываем модальное окно
            const modal = new bootstrap.Modal(document.getElementById("orderModal"));
            modal.hide();
        })
        .catch(error => {
            // Обработка ошибки
            console.error("Ошибка при отправке заказа:", error);
        });
}

    // 
});