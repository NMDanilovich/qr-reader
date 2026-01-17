// DOM элементы
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const scanButton = document.getElementById('scan-button');
const stopButton = document.getElementById('stop-button');
const resultDiv = document.getElementById('result');
const statusDiv = document.getElementById('status');


// Переменные состояния
let mediaStream = null;
let scanningActive = false;
let animationId = null;

// Переменная сокета
let socket;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {

    // Автоматически запускаем камеру
    startCamera();
    
    // Обработчики событий кнопок
    scanButton.addEventListener('click', toggleScanning);
    stopButton.addEventListener('click', stopCamera);
});

// Функция запуска камеры
async function startCamera() {
    try {
        // Проверяем поддержку API камеры
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Ваш браузер не поддерживает доступ к камере');
        }
        
        // Запрашиваем доступ к камере
        // Используем ideal параметры для лучшей совместимости
        mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment', // Предпочитаем заднюю камеру
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        });
        
        // Назначаем поток видео элементу
        video.srcObject = mediaStream;
        
        // Ждем загрузки метаданных видео
        await new Promise((resolve) => {
            video.onloadedmetadata = () => {
                video.play().then(resolve);
            };
        });
        
        // Включаем кнопки
        stopButton.disabled = false;
        
        // Обновляем статус
        updateStatus('active', 'Камера активна');
        
    } catch (error) {
        console.error('Ошибка доступа к камере:', error);
        resultDiv.innerHTML = `<p style="color: #c62828;">Ошибка: ${error.message}</p>`;
        updateStatus('inactive', 'Ошибка доступа к камере');
        scanButton.disabled = true;
    }
}

// Функция переключения режима сканирования
function toggleScanning() {
    if (scanningActive) {
        stopScanning();
        scanButton.textContent = '🔍 Начать сканирование';
    } else {
        startScanning();
        scanButton.textContent = '⏸️ Остановить сканирование';
    }
}

// Функция запуска сканирования
function startScanning() {
    scanningActive = true;
    
    // Устанавливаем размер canvas равным размеру видео
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Запускаем цикл сканирования
    scanFrame();
}

// Функция остановки сканирования
function stopScanning() {
    scanningActive = false;
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
}

// Отправить запрос на увеличение счётчика
async function incrementQRCount(id) {
    const formData = new FormData();
    formData.append('message', id);
    res = await fetch('/send', {
        method: 'POST',
        body: formData
    });
        if (res.ok) {
        alert('QR код отсканирован!');
    }
  // Обновление произойдёт через WebSocket
}

// Функция сканирования кадра
function scanFrame() {
    if (!scanningActive) return;
    
    const context = canvas.getContext('2d');
    
    // Рисуем текущий кадр с видео на canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Получаем данные изображения с canvas
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    
    // Пытаемся распознать QR-код
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    
    // Если QR-код найден
    if (code) {
        // Отображаем результат
        displayResult(code.data);
        
        // Временно останавливаем сканирование
        stopScanning();
        scanButton.textContent = '🔍 Начать сканирование';
        
        // Показываем уведомление
        showNotification('QR-код успешно распознан!');
        
        // Отправляем  
        incrementQRCount(code.data)

        // Через 3 секунды снова включаем сканирование
        setTimeout(() => {
            if (!scanningActive && mediaStream) {
                startScanning();
                scanButton.textContent = '⏸️ Остановить сканирование';
            }
        }, 3000);
    }
    
    // Продолжаем сканирование
    animationId = requestAnimationFrame(scanFrame);
}

// Функция отображения результата
function displayResult(data) {
    // Если это текст, отображаем как есть
    resultDiv.innerHTML = `
        <p><strong>Найден текст:</strong></p>
        <p>${data}</p>
    `;
}

// Функция остановки камеры
function stopCamera() {
    // Останавливаем сканирование
    stopScanning();
    
    // Останавливаем поток камеры
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
    }
    
    // Сбрасываем видео элемент
    video.srcObject = null;
    
    // Сбрасываем кнопки
    scanButton.disabled = true;
    scanButton.textContent = '🔍 Начать сканирование';
    stopButton.disabled = true;
    
    // Обновляем статус
    updateStatus('inactive', 'Камера отключена');
    
    // Очищаем результат
    resultDiv.innerHTML = '<p class="empty-result">Камера остановлена. Перезагрузите страницу для повторного использования.</p>';
}

// Функция обновления статуса
function updateStatus(type, message) {
    statusDiv.className = `status status-${type}`;
    statusDiv.textContent = message;
}

// Функция показа уведомления
function showNotification(message) {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #4CAF50;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        font-weight: bold;
    `;
    
    // Добавляем уведомление на страницу
    document.body.appendChild(notification);
    
    // Удаляем уведомление через 2 секунды
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 2000);
}