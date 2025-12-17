// Логика для страницы отчетов
document.addEventListener('DOMContentLoaded', function() {
    // Элементы страницы
    const loadingScreen = document.getElementById('loadingScreen');
    const mainContainer = document.getElementById('mainContainer');
    const currentTime = document.getElementById('currentTime');
    const currentDate = document.getElementById('currentDate');
    const userName = document.getElementById('userName');
    const userRole = document.getElementById('userRole');
    const totalReports = document.getElementById('totalReports');
    const readyReports = document.getElementById('readyReports');
    const pendingReports = document.getElementById('pendingReports');
    const failedReports = document.getElementById('failedReports');
    const createReportBtn = document.getElementById('createReport');
    const refreshReportsBtn = document.getElementById('refreshReports');
    const createFirstReportBtn = document.getElementById('createFirstReport');
    const clearAllReportsBtn = document.getElementById('clearAllReports');
    const emptyReportsMessage = document.getElementById('emptyReportsMessage');
    const reportsList = document.getElementById('reportsList');
    const createReportModal = document.getElementById('createReportModal');
    const closeCreateModal = document.getElementById('closeCreateModal');
    const cancelCreateReport = document.getElementById('cancelCreateReport');
    const confirmCreateReport = document.getElementById('confirmCreateReport');
    
    // Данные отчетов
    let reports = [];
    
    // Инициализация
    initReportsPage();
    
    // Инициализация страницы отчетов
    function initReportsPage() {
        // Скрываем загрузку
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                mainContainer.style.display = 'flex';
                loadReports();
            }, 500);
        }, 1000);
        
        // Обновление времени
        updateDateTime();
        setInterval(updateDateTime, 1000);
        
        // Устанавливаем даты по умолчанию
        setupDefaultDates();
        
        // Инициализация обработчиков
        initEventHandlers();
        
        // Загружаем информацию о пользователе
        loadUserInfo();
    }
    
    // Обновление времени
    function updateDateTime() {
        const now = new Date();
        currentTime.textContent = now.toLocaleTimeString('ru-RU');
        currentDate.textContent = now.toLocaleDateString('ru-RU');
        
        // Обновление времени в футере
        const lastUpdate = document.getElementById('lastUpdate');
        if (lastUpdate) {
            lastUpdate.textContent = now.toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'});
        }
    }
    
    // Загрузка информации о пользователе
    function loadUserInfo() {
        const user = JSON.parse(localStorage.getItem('hermes_user'));
        if (user) {
            if (userName) userName.textContent = user.name;
            if (userRole) {
                const roleMap = {
                    'operator': 'Оператор',
                    'engineer': 'Инженер',
                    'admin': 'Администратор'
                };
                userRole.textContent = roleMap[user.role] || 'Оператор';
            }
        }
    }
    
    // Установка дат по умолчанию
    function setupDefaultDates() {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const startDate = document.getElementById('startDate');
        const endDate = document.getElementById('endDate');
        
        if (startDate) {
            startDate.value = yesterday.toISOString().split('T')[0];
        }
        if (endDate) {
            endDate.value = today.toISOString().split('T')[0];
        }
        
        // Устанавливаем название отчета с датой
        const reportTitle = document.getElementById('reportTitle');
        if (reportTitle) {
            const dateStr = today.toLocaleDateString('ru-RU');
            reportTitle.value = `Отчет по системе за ${dateStr}`;
        }
    }
    
    // Загрузка отчетов
    function loadReports() {
        // Пытаемся загрузить из localStorage
        const savedReports = localStorage.getItem('hermes_reports');
        
        if (savedReports) {
            reports = JSON.parse(savedReports);
            if (reports.length > 0) {
                emptyReportsMessage.style.display = 'none';
                reportsList.style.display = 'block';
                renderReports();
            } else {
                emptyReportsMessage.style.display = 'block';
                reportsList.style.display = 'none';
            }
        } else {
            // Нет отчетов
            emptyReportsMessage.style.display = 'block';
            reportsList.style.display = 'none';
        }
        
        // Обновляем статистику
        updateStatistics();
    }
    
    // Отрисовка отчетов
    function renderReports() {
        if (!reportsList) return;
        
        reportsList.innerHTML = reports.map(report => {
            const createdDate = new Date(report.created);
            const createdStr = createdDate.toLocaleDateString('ru-RU') + ' ' + 
                              createdDate.toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'});
            
            let statusClass = '';
            let statusIcon = '';
            let statusText = '';
            
            switch(report.status) {
                case 'ready':
                    statusClass = 'success';
                    statusIcon = 'check-circle';
                    statusText = 'Готов';
                    break;
                case 'processing':
                    statusClass = 'warning';
                    statusIcon = 'spinner';
                    statusText = 'В обработке';
                    break;
                case 'failed':
                    statusClass = 'danger';
                    statusIcon = 'exclamation-circle';
                    statusText = 'Ошибка';
                    break;
                default:
                    statusClass = 'info';
                    statusIcon = 'clock';
                    statusText = 'Ожидание';
            }
            
            return `
                <div class="report-item">
                    <div class="report-icon">
                        <i class="fas fa-file-${report.format === 'pdf' ? 'pdf' : report.format === 'excel' ? 'excel' : 'alt'}"></i>
                    </div>
                    <div class="report-info">
                        <div class="report-title">${report.title}</div>
                        <div class="report-details">
                            <span class="detail-item">
                                <i class="fas fa-calendar"></i>
                                ${report.period}
                            </span>
                            <span class="detail-item">
                                <i class="fas fa-file-signature"></i>
                                ${report.type}
                            </span>
                            <span class="detail-item">
                                <i class="fas fa-user"></i>
                                ${report.author}
                            </span>
                        </div>
                    </div>
                    <div class="report-status">
                        <span class="status-badge ${statusClass}">
                            <i class="fas fa-${statusIcon} ${report.status === 'processing' ? 'fa-spin' : ''}"></i>
                            ${statusText}
                        </span>
                    </div>
                    <div class="report-actions">
                        ${report.status === 'ready' ? `
                        <button class="btn-action small success" onclick="downloadReport('${report.id}')">
                            <i class="fas fa-download"></i> Скачать
                        </button>
                        <button class="btn-action small info" onclick="viewReport('${report.id}')">
                            <i class="fas fa-eye"></i> Просмотр
                        </button>
                        ` : ''}
                        <button class="btn-action small danger" onclick="deleteReport('${report.id}')">
                            <i class="fas fa-trash"></i> Удалить
                        </button>
                    </div>
                    <div class="report-time">
                        ${createdStr}
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Обновление статистики
    function updateStatistics() {
        const total = reports.length;
        const ready = reports.filter(r => r.status === 'ready').length;
        const pending = reports.filter(r => r.status === 'processing').length;
        const failed = reports.filter(r => r.status === 'failed').length;
        
        if (totalReports) totalReports.textContent = total;
        if (readyReports) readyReports.textContent = ready;
        if (pendingReports) pendingReports.textContent = pending;
        if (failedReports) failedReports.textContent = failed;
    }
    
    // Инициализация обработчиков событий
    function initEventHandlers() {
        // Создание отчета
        if (createReportBtn) {
            createReportBtn.addEventListener('click', openCreateReportModal);
        }
        
        if (createFirstReportBtn) {
            createFirstReportBtn.addEventListener('click', openCreateReportModal);
        }
        
        // Обновление отчетов
        if (refreshReportsBtn) {
            refreshReportsBtn.addEventListener('click', function() {
                this.querySelector('i').classList.add('fa-spin');
                setTimeout(() => {
                    loadReports();
                    this.querySelector('i').classList.remove('fa-spin');
                    showNotification('Список отчетов обновлен', 'success');
                }, 500);
            });
        }
        
        // Очистка всех отчетов
        if (clearAllReportsBtn) {
            clearAllReportsBtn.addEventListener('click', clearAllReports);
        }
        
        // Модальное окно создания отчета
        if (closeCreateModal) {
            closeCreateModal.addEventListener('click', closeModal);
        }
        
        if (cancelCreateReport) {
            cancelCreateReport.addEventListener('click', closeModal);
        }
        
        if (confirmCreateReport) {
            confirmCreateReport.addEventListener('click', generateReport);
        }
        
        // Закрытие модальных окон при клике вне
        window.addEventListener('click', function(e) {
            if (e.target === createReportModal) {
                closeModal();
            }
        });
    }
    
    // Открытие модального окна создания отчета
    function openCreateReportModal() {
        setupDefaultDates();
        createReportModal.style.display = 'flex';
    }
    
    // Закрытие модального окна
    function closeModal() {
        createReportModal.style.display = 'none';
    }
    
    // Генерация отчета
    function generateReport() {
        const title = document.getElementById('reportTitle').value;
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const period = document.getElementById('reportPeriod').value;
        const type = document.getElementById('reportType').value;
        const format = document.getElementById('reportFormat').value;
        const notes = document.getElementById('reportNotes').value;
        
        if (!title.trim()) {
            showNotification('Введите название отчета', 'warning');
            return;
        }
        
        if (!startDate || !endDate) {
            showNotification('Укажите период отчета', 'warning');
            return;
        }
        
        // Получаем информацию о пользователе
        const user = JSON.parse(localStorage.getItem('hermes_user')) || { name: 'Оператор' };
        
        // Создаем новый отчет
        const newReport = {
            id: 'report_' + Date.now(),
            title: title,
            period: getPeriodText(period, startDate, endDate),
            type: getTypeText(type),
            format: format,
            author: user.name,
            status: 'processing',
            created: new Date().toISOString(),
            startDate: startDate,
            endDate: endDate,
            notes: notes,
            size: '0 KB',
            progress: 0
        };
        
        // Добавляем в начало массива
        reports.unshift(newReport);
        
        // Сохраняем в localStorage
        localStorage.setItem('hermes_reports', JSON.stringify(reports));
        
        // Закрываем модальное окно
        closeModal();
        
        // Показываем уведомление
        showNotification('Отчет поставлен в очередь на генерацию', 'info');
        
        // Обновляем список
        emptyReportsMessage.style.display = 'none';
        reportsList.style.display = 'block';
        renderReports();
        updateStatistics();
        
        // Имитируем процесс генерации
        simulateReportGeneration(newReport.id);
    }
    
    // Имитация генерации отчета
    function simulateReportGeneration(reportId) {
        const reportIndex = reports.findIndex(r => r.id === reportId);
        if (reportIndex === -1) return;
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            reports[reportIndex].progress = progress;
            
            if (progress >= 100) {
                clearInterval(interval);
                reports[reportIndex].status = 'ready';
                reports[reportIndex].size = (Math.random() * 5 + 1).toFixed(1) + ' MB';
                reports[reportIndex].progress = 100;
                
                // Сохраняем обновленный отчет
                localStorage.setItem('hermes_reports', JSON.stringify(reports));
                
                // Обновляем отображение
                renderReports();
                updateStatistics();
                
                // Показываем уведомление
                showNotification('Отчет успешно сгенерирован', 'success');
            } else {
                // Обновляем прогресс
                localStorage.setItem('hermes_reports', JSON.stringify(reports));
                renderReports();
            }
        }, 500);
    }
    
    // Очистка всех отчетов
    function clearAllReports() {
        if (reports.length === 0) {
            showNotification('Нет отчетов для удаления', 'info');
            return;
        }
        
        if (confirm('Вы уверены, что хотите удалить все отчеты? Это действие нельзя отменить.')) {
            reports = [];
            localStorage.removeItem('hermes_reports');
            
            emptyReportsMessage.style.display = 'block';
            reportsList.style.display = 'none';
            updateStatistics();
            
            showNotification('Все отчеты удалены', 'warning');
        }
    }
    
    // Вспомогательные функции
    function getPeriodText(period, startDate, endDate) {
        const periodMap = {
            'today': 'Сегодня',
            'yesterday': 'Вчера',
            'week': 'Неделя',
            'month': 'Месяц',
            'quarter': 'Квартал',
            'year': 'Год',
            'custom': `${formatDate(startDate)} - ${formatDate(endDate)}`
        };
        
        return periodMap[period] || 'Произвольный период';
    }
    
    function getTypeText(type) {
        const typeMap = {
            'daily': 'Ежедневный',
            'weekly': 'Еженедельный',
            'monthly': 'Ежемесячный',
            'incident': 'По инцидентам',
            'sensor': 'По датчикам',
            'performance': 'Производительность'
        };
        
        return typeMap[type] || 'Общий';
    }
    
    function formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('ru-RU');
    }
    
    // Показать уведомление
    function showNotification(message, type = 'info') {
        if (typeof Toastify === 'function') {
            const backgroundColor = {
                'success': '#10B981',
                'warning': '#F59E0B',
                'danger': '#EF4444',
                'info': '#3B82F6'
            }[type] || '#3B82F6';
            
            Toastify({
                text: message,
                duration: 3000,
                gravity: "top",
                position: "right",
                backgroundColor: backgroundColor,
                stopOnFocus: true,
            }).showToast();
        }
    }
});

// Глобальные функции для работы с отчетами
function downloadReport(reportId) {
    const reports = JSON.parse(localStorage.getItem('hermes_reports') || '[]');
    const report = reports.find(r => r.id === reportId);
    
    if (!report) {
        alert('Отчет не найден');
        return;
    }
    
    // Имитируем скачивание
    const blob = new Blob([`Отчет: ${report.title}\nПериод: ${report.period}\nТип: ${report.type}\nАвтор: ${report.author}\nДата создания: ${new Date(report.created).toLocaleString('ru-RU')}\n\nЭто тестовый отчет. В реальной системе здесь были бы данные системы.`], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.title.replace(/\s+/g, '_')}_${reportId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    if (typeof showNotification === 'function') {
        showNotification('Отчет скачивается', 'success');
    }
}

function viewReport(reportId) {
    const reports = JSON.parse(localStorage.getItem('hermes_reports') || '[]');
    const report = reports.find(r => r.id === reportId);
    
    if (!report) {
        alert('Отчет не найден');
        return;
    }
    
    // Открываем модальное окно с деталями отчета
    alert(`Просмотр отчета:\n\nНазвание: ${report.title}\nПериод: ${report.period}\nТип: ${report.type}\nФормат: ${report.format}\nАвтор: ${report.author}\nДата создания: ${new Date(report.created).toLocaleString('ru-RU')}\nРазмер: ${report.size}\n\nПримечания: ${report.notes || 'Нет'}`);
}

function deleteReport(reportId) {
    if (!confirm('Вы уверены, что хотите удалить этот отчет?')) return;
    
    let reports = JSON.parse(localStorage.getItem('hermes_reports') || '[]');
    reports = reports.filter(r => r.id !== reportId);
    localStorage.setItem('hermes_reports', JSON.stringify(reports));
    
    // Перезагружаем страницу или обновляем список
    if (typeof loadReports === 'function') {
        loadReports();
    }
    
    if (typeof showNotification === 'function') {
        showNotification('Отчет удален', 'warning');
    }
}