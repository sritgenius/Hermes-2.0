// Менеджер событий для системы ГЕРМЕС
class EventsManager {
    constructor() {
        this.eventsKey = 'hermes_events';
        this.maxEvents = 1000;
    }
    
    // Получение всех событий
    getEvents() {
        try {
            const eventsJson = localStorage.getItem(this.eventsKey);
            return eventsJson ? JSON.parse(eventsJson) : [];
        } catch (error) {
            console.error('Ошибка чтения событий:', error);
            return [];
        }
    }
    
    // Сохранение всех событий
    saveEvents(events) {
        try {
            localStorage.setItem(this.eventsKey, JSON.stringify(events));
            return true;
        } catch (error) {
            console.error('Ошибка сохранения событий:', error);
            return false;
        }
    }
    
    // Добавление нового события
    addEvent(event) {
        const events = this.getEvents();
        events.unshift(event);
        
        if (events.length > this.maxEvents) {
            events.splice(this.maxEvents);
        }
        
        return this.saveEvents(events);
    }
    
    // Очистка всех событий
    clearEvents() {
        localStorage.removeItem(this.eventsKey);
        return true;
    }
    
    // Получение статистики
    getStatistics() {
        const events = this.getEvents();
        
        return {
            total: events.length,
            danger: events.filter(e => e.type === 'danger').length,
            warning: events.filter(e => e.type === 'warning').length,
            normal: events.filter(e => e.type === 'normal').length,
            test: events.filter(e => e.type === 'test' || e.isTest).length,
            lastEvent: events.length > 0 ? events[0].timestamp : null
        };
    }
    
    // Экспорт в CSV
    exportToCSV() {
        const events = this.getEvents();
        if (events.length === 0) return '';
        
        const headers = ['Дата', 'Время', 'Датчик', 'Зона', 'Тип', 'Значение', 'Оператор', 'Описание', 'Подтверждено'];
        
        const rows = events.map(event => {
            const date = new Date(event.timestamp);
            const dateStr = date.toLocaleDateString('ru-RU');
            const timeStr = date.toLocaleTimeString('ru-RU');
            
            return [
                dateStr,
                timeStr,
                event.sensor,
                event.zone,
                this.getEventTypeText(event.type),
                event.value,
                event.operator,
                event.description,
                event.acknowledged ? 'Да' : 'Нет'
            ];
        });
        
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');
        
        return csvContent;
    }
    
    getEventTypeText(type) {
        const typeMap = {
            'danger': 'Авария',
            'warning': 'Предупреждение',
            'normal': 'Норма',
            'test': 'Тест'
        };
        return typeMap[type] || type;
    }
}

// Глобальный экземпляр менеджера событий
let eventsManager = null;

function initEventsManager() {
    if (!eventsManager) {
        eventsManager = new EventsManager();
    }
    return eventsManager;
}

// Глобальные функции для работы с событиями
function getEventStatistics() {
    const manager = initEventsManager();
    return manager.getStatistics();
}

function exportEventsToCSV() {
    const manager = initEventsManager();
    return manager.exportToCSV();
}

function clearAllEvents() {
    const manager = initEventsManager();
    return manager.clearEvents();
}