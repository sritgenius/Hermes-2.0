function isEventsManagerAvailable() {
    return typeof addTestEventToLog === 'function';
}
// Усовершенствованный симулятор данных системы ГЕРМЕС
class DataSimulator {
    constructor() {
        this.sensors = [];
        this.events = [];
        this.isSimulating = false;
        this.simulationInterval = null;
        this.manualTestActive = false;
        this.testSensors = new Set(); // Датчики в тестовом режиме
        this.initSensors();
    }
    
    // Инициализация датчиков
    initSensors() {
        this.sensors = [];
        
        // 24 датчика в системе
        for (let i = 1; i <= 24; i++) {
            const zone = this.getZoneForSensor(i);
            const type = this.getRandomType();
            
            this.sensors.push({
                id: i,
                name: `Датчик СОР-${i.toString().padStart(3, '0')}`,
                zone: zone,
                type: type,
                value: this.getInitialValue(type),
                status: 'normal',
                lastUpdate: new Date(),
                thresholds: this.getThresholds(type),
                isTesting: false,
                testEndTime: null
            });
        }
    }
    
    getZoneForSensor(id) {
        const zones = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D1', 'D2'];
        return zones[Math.floor(Math.random() * zones.length)];
    }
    
    getRandomType() {
        const types = ['pressure', 'leak', 'temperature', 'vibration', 'level'];
        return types[Math.floor(Math.random() * types.length)];
    }
    
    getInitialValue(type) {
        const ranges = {
            pressure: { min: 2.5, max: 3.5 },
            leak: { min: 0, max: 0.5 },
            temperature: { min: 20, max: 30 },
            vibration: { min: 0, max: 10 },
            level: { min: 50, max: 100 }
        };
        
        const range = ranges[type] || ranges.pressure;
        return (Math.random() * (range.max - range.min) + range.min).toFixed(2);
    }
    
    getThresholds(type) {
        const thresholds = {
            pressure: { warning: 3.8, danger: 4.5 },
            leak: { warning: 0.8, danger: 1.5 },
            temperature: { warning: 40, danger: 55 },
            vibration: { warning: 15, danger: 25 },
            level: { warning: 30, danger: 20 }
        };
        
        return thresholds[type] || thresholds.pressure;
    }
    
    // Запуск симуляции (только нормальные значения)
    startSimulation() {
        if (this.isSimulating) return;
        
        this.isSimulating = true;
        this.simulationInterval = setInterval(() => {
            this.updateSensors();
            this.checkManualTests(); // Проверяем ручные тесты
            this.updateDashboard();
        }, 2000);
        
        console.log('🔧 Симуляция данных запущена (только нормальный режим)');
    }
    
    // Остановка симуляции
    stopSimulation() {
        if (!this.isSimulating) return;
        
        clearInterval(this.simulationInterval);
        this.isSimulating = false;
        console.log('🛑 Симуляция данных остановлена');
    }
    
    // Обновление значений датчиков (только нормальные значения)
    updateSensors() {
        this.sensors.forEach(sensor => {
            // Пропускаем датчики в тестовом режиме
            if (sensor.isTesting) return;
            
            // Медленные, естественные изменения
            const change = (Math.random() - 0.5) * 0.05;
            let newValue = parseFloat(sensor.value) + change;
            
            // Держим в нормальном диапазоне
            const baseRange = this.getInitialValue(sensor.type);
            const minBase = parseFloat(baseRange) * 0.8;
            const maxBase = parseFloat(baseRange) * 1.2;
            
            newValue = Math.max(minBase, Math.min(maxBase, newValue));
            
            sensor.value = newValue.toFixed(2);
            sensor.lastUpdate = new Date();
            
            // Статус всегда нормальный (если не тестируется)
            if (!sensor.isTesting) {
                sensor.status = 'normal';
            }
        });
    }
    
    // Запуск ручного теста датчика
    startSensorTest(sensorId, testType, durationSeconds = 30) {
        const sensor = this.sensors.find(s => s.id === parseInt(sensorId));
        if (!sensor) {
            console.error('Датчик не найден:', sensorId);
            return false;
        }
        
        console.log(`🧪 Запуск теста датчика ${sensorId}: ${testType}`);
        
        // Помечаем датчик как тестируемый
        sensor.isTesting = true;
        sensor.testEndTime = new Date(Date.now() + durationSeconds * 1000);
        this.testSensors.add(sensorId);
        
        // Устанавливаем значения в зависимости от типа теста
        let testValue;
        switch(testType) {
            case 'warning':
                testValue = sensor.thresholds.warning * 1.1;
                sensor.status = 'warning';
                break;
            case 'danger':
                testValue = sensor.thresholds.danger * 1.2;
                sensor.status = 'danger';
                break;
            case 'failure':
                testValue = 0;
                sensor.status = 'danger';
                break;
            case 'normal':
            default:
                testValue = this.getInitialValue(sensor.type);
                sensor.status = 'normal';
                break;
        }
        
        sensor.value = testValue.toFixed(2);
        
        // Создаем событие о тесте
        this.createEvent(sensor, testType === 'normal' ? 'info' : testType, true);
        if (isEventsManagerAvailable() && (isTest || level === 'danger' || level === 'warning')) {
    // Создаем событие для журнала
    const journalEvent = {
        id: Date.now(),
        sensorId: sensor.id,
        sensorName: sensor.name,
        zone: sensor.zone,
        level: level,
        value: sensor.value,
        description: event.description,
        isTest: isTest
    };
    
    // Сохраняем через менеджер событий
    addTestEventToLog(sensor.id, level, isTest ? 'Система (тест)' : 'Система');
}
        // Запускаем таймер завершения теста
        setTimeout(() => {
            this.endSensorTest(sensorId);
        }, durationSeconds * 1000);
        
        return true;
    }
    
    // Завершение теста датчика
    endSensorTest(sensorId) {
        const sensor = this.sensors.find(s => s.id === parseInt(sensorId));
        if (!sensor) return;
        
        console.log(`✅ Завершение теста датчика ${sensorId}`);
        
        sensor.isTesting = false;
        sensor.testEndTime = null;
        sensor.status = 'normal';
        sensor.value = this.getInitialValue(sensor.type);
        
        this.testSensors.delete(sensorId);
        
        // Создаем событие о завершении теста
        this.createEvent(sensor, 'success', true);
    }
    
    // Проверка ручных тестов
    checkManualTests() {
        const now = new Date();
        
        this.testSensors.forEach(sensorId => {
            const sensor = this.sensors.find(s => s.id === parseInt(sensorId));
            if (sensor && sensor.testEndTime && now >= sensor.testEndTime) {
                this.endSensorTest(sensorId);
            }
        });
    }
    
    // Создание события
    createEvent(sensor, level, isTest = false) {
        const event = {
            id: Date.now(),
            sensorId: sensor.id,
            sensorName: sensor.name,
            zone: sensor.zone,
            level: level,
            value: sensor.value,
            timestamp: new Date().toLocaleTimeString(),
            description: isTest ? 
                `[ТЕСТ] ${this.getEventDescription(sensor, level)}` :
                this.getEventDescription(sensor, level),
            isTest: isTest,
            acknowledged: false
        };
        
        this.events.unshift(event);
        
        // Ограничиваем историю событий
        if (this.events.length > 100) {
            this.events = this.events.slice(0, 100);
        }
        
        // Показываем уведомление только для реальных событий или тестов опасности
        if (!isTest || level === 'danger') {
            if (typeof showNotification === 'function') {
                showNotification(event.description, level);
            }
        }
        
        // Обновляем счетчик аварий
        this.updateAlarmCounter();
        
        // Обновляем список событий
        this.updateEventsList();
    }
    
    getEventDescription(sensor, level) {
        const levelText = {
            'danger': 'АВАРИЯ',
            'warning': 'ПРЕДУПРЕЖДЕНИЕ',
            'success': 'ВОССТАНОВЛЕНИЕ',
            'info': 'ИНФОРМАЦИЯ'
        }[level] || 'СОБЫТИЕ';
        
        return `${levelText}: ${sensor.name} (${sensor.zone}) - ${sensor.value}`;
    }
    
    // Обновление счетчиков на дашборде
    updateCounter(elementId, count) {
        const element = document.getElementById(elementId);
        if (element) {
            // Анимация изменения числа
            element.style.transform = 'scale(1.2)';
            setTimeout(() => {
                element.textContent = count;
                element.style.transform = 'scale(1)';
            }, 200);
        }
    }
    
    // Обновление счетчика аварий
    updateAlarmCounter() {
        const dangerCount = this.sensors.filter(s => s.status === 'danger').length;
        const element = document.getElementById('alarmCount');
        if (element) {
            element.textContent = dangerCount;
            
            // Анимация для аварийного состояния
            const quickAccess = document.querySelector('.access-item.alarm-active');
            if (dangerCount > 0) {
                if (quickAccess) quickAccess.classList.add('alarm-active');
            } else {
                if (quickAccess) quickAccess.classList.remove('alarm-active');
            }
        }
    }
    
    // Обновление списка событий
    updateEventsList() {
        const eventsContainer = document.getElementById('recentEvents');
        if (!eventsContainer) return;
        
        const recentEvents = this.events.slice(0, 5).map(event => {
            const icon = this.getEventIcon(event);
            const typeClass = event.level;
            const testClass = event.isTest ? 'test-event' : '';
            
            return `
                <div class="event-item ${testClass}">
                    <div class="event-icon ${typeClass}">
                        <i class="fas fa-${icon}"></i>
                    </div>
                    <div class="event-info">
                        <div class="event-title">${event.description}</div>
                        <div class="event-description">Зона ${event.zone}</div>
                    </div>
                    <div class="event-time">${event.timestamp}</div>
                </div>
            `;
        }).join('');
        
        eventsContainer.innerHTML = recentEvents;
    }
    
    getEventIcon(event) {
        if (event.isTest) return 'vial';
        
        switch(event.level) {
            case 'danger': return 'fire';
            case 'warning': return 'exclamation-triangle';
            case 'success': return 'check-circle';
            default: return 'info-circle';
        }
    }
    
    // Обновление дашборда
    updateDashboard() {
        // Обновляем датчики на карте
        this.updateMapSensors();
        
        // Обновляем графики
        if (typeof updateCharts === 'function') {
            updateCharts(this.getChartData());
        }
    }
    
    // Обновление датчиков на карте
    updateMapSensors() {
        const sensorElements = document.querySelectorAll('.sensor');
        sensorElements.forEach(element => {
            const sensorId = element.getAttribute('data-sensor');
            const sensor = this.sensors.find(s => s.id === parseInt(sensorId));
            
            if (sensor) {
                // Обновляем класс статуса
                element.className = `sensor ${sensor.status} ${sensor.isTesting ? 'testing' : ''}`;
                
                // Добавляем всплывающую подсказку
                element.title = `${sensor.name}: ${sensor.value}${sensor.isTesting ? ' [ТЕСТ]' : ''}`;
            }
        });
    }
    
    // Получение данных для графиков (только нормальные значения + тесты)
    getChartData() {
        const now = new Date();
        const data = [];
        
        // Генерируем данные за последние 24 часа
        for (let i = 23; i >= 0; i--) {
            const time = new Date(now.getTime() - (i * 60 * 60 * 1000));
            const hour = time.getHours().toString().padStart(2, '0') + ':00';
            
            // Базовое нормальное значение
            const baseValue = 50 + Math.sin(i * 0.5) * 5;
            
            // Добавляем всплески только если есть активные аварии
            const dangerSensors = this.sensors.filter(s => s.status === 'danger');
            let alertValue = baseValue;
            
            if (dangerSensors.length > 0) {
                // Всплеск на графике во время аварии
                alertValue = baseValue + 30 + (Math.random() * 10);
            }
            
            data.push({
                time: hour,
                value: alertValue.toFixed(2),
                alerts: dangerSensors.length,
                isAnomaly: dangerSensors.length > 0
            });
        }
        
        return data;
    }
    
    // Получение списка датчиков для выбора
    getSensorList() {
        return this.sensors.map(sensor => ({
            id: sensor.id,
            name: sensor.name,
            zone: sensor.zone,
            type: sensor.type
        }));
    }
}

// Глобальная инициализация симулятора
let dataSimulator = null;

function startDataSimulation() {
    if (!dataSimulator) {
        dataSimulator = new DataSimulator();
    }
    dataSimulator.startSimulation();
	
	// ========== ДОБАВЛЯЕМ В КОНЕЦ КЛАССА DataSimulator (перед закрывающей фигурной скобкой) ==========

    // Сохранение события в журнал
    saveEventToJournal(simEvent) {
        try {
            // Проверяем, доступен ли localStorage
            if (typeof(Storage) === "undefined") {
                console.warn('localStorage не поддерживается');
                return;
            }
            
            // Получаем текущие события из localStorage
            let journalEvents = JSON.parse(localStorage.getItem('hermes_events')) || [];
            
            // Определяем тип события для журнала
            let eventType;
            if (simEvent.isTest) {
                eventType = 'test';
            } else if (simEvent.level === 'success') {
                eventType = 'normal';
            } else {
                eventType = simEvent.level; // danger, warning, info
            }
            
            // Получаем оператора из localStorage
            const user = JSON.parse(localStorage.getItem('hermes_user')) || { name: 'Система' };
            
            const journalEvent = {
                id: simEvent.id,
                timestamp: new Date(),
                sensor: simEvent.sensorName,
                zone: simEvent.zone,
                type: eventType,
                value: simEvent.value,
                operator: user.name || 'Система',
                description: simEvent.description,
                acknowledged: false,
                isTest: simEvent.isTest || false
            };
            
            // Добавляем в начало массива
            journalEvents.unshift(journalEvent);
            
            // Ограничиваем количество событий
            if (journalEvents.length > 1000) {
                journalEvents = journalEvents.slice(0, 1000);
            }
            
            // Сохраняем обратно в localStorage
            localStorage.setItem('hermes_events', JSON.stringify(journalEvents));
            
            console.log('📝 Событие сохранено в журнал:', journalEvent.description);
            
            // Обновляем журнал событий, если он открыт
            if (typeof window.refreshEventLog === 'function') {
                window.refreshEventLog();
            }
            
        } catch (error) {
            console.error('Ошибка при сохранении события в журнал:', error);
        }
    }
    
    // Обновленная функция createEvent с сохранением в журнал
    createEvent(sensor, level, isTest = false) {
        const event = {
            id: Date.now(),
            sensorId: sensor.id,
            sensorName: sensor.name,
            zone: sensor.zone,
            level: level,
            value: sensor.value,
            timestamp: new Date().toLocaleTimeString(),
            description: isTest ? 
                `[ТЕСТ] ${this.getEventDescription(sensor, level)}` :
                this.getEventDescription(sensor, level),
            isTest: isTest,
            acknowledged: false
        };
        
        this.events.unshift(event);
        
        // Ограничиваем историю событий
        if (this.events.length > 100) {
            this.events = this.events.slice(0, 100);
        }
        
        // СОХРАНЯЕМ В ЖУРНАЛ
        this.saveEventToJournal(event);
        
        // Показываем уведомление только для реальных событий или тестов опасности
        if (!isTest || level === 'danger') {
            if (typeof showNotification === 'function') {
                showNotification(event.description, level);
            }
        }
        
        // Обновляем счетчик аварий
        this.updateAlarmCounter();
        
        // Обновляем список событий
        this.updateEventsList();
    }
}

// ========== ДОБАВЛЯЕМ ПОСЛЕ КЛАССА DataSimulator ==========

// Глобальная функция для обновления журнала событий
window.refreshEventLog = function() {
    // Если открыта страница журнала событий, обновляем ее
    if (window.location.pathname.includes('event-log.html')) {
        if (typeof loadEvents === 'function') {
            loadEvents();
        }
    }
};

// Инициализация симулятора
let dataSimulator = null;

function startDataSimulation() {
    if (!dataSimulator) {
        dataSimulator = new DataSimulator();
    }
    dataSimulator.startSimulation();
}

function stopDataSimulation() {
    if (dataSimulator) {
        dataSimulator.stopSimulation();
    }
}

// Функция для запуска теста датчика
function runSensorTest(sensorId, testType, duration) {
    if (dataSimulator) {
        return dataSimulator.startSensorTest(sensorId, testType, duration);
    }
    return false;
}
}

function stopDataSimulation() {
    if (dataSimulator) {
        dataSimulator.stopSimulation();
    }
}

// Функция для запуска теста датчика (будет вызвана из main.js)
function runSensorTest(sensorId, testType, duration) {
    if (dataSimulator) {
        return dataSimulator.startSensorTest(sensorId, testType, duration);
    }
    return false;
}