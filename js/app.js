// 主应用逻辑
// 负责数据加载、图表初始化和交互处理

// 初始化
let isLoading = false;

document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
});

async function initDashboard() {
    // 初始化图表
    dashboardCharts.init();
    
    // 加载数据
    await loadData();
}

// 加载数据
async function loadData() {
    if (isLoading) return;
    
    isLoading = true;
    showLoading();
    
    try {
        const data = await sheetsAPI.getAllData();
        dashboardCharts.update(data);
        updateLastUpdateTime();
    } catch (error) {
        console.error('加载数据失败:', error);
        showError(error.message);
    } finally {
        isLoading = false;
        hideLoading();
    }
}

// 刷新数据
async function refreshData() {
    const btn = document.querySelector('.refresh-btn');
    btn.disabled = true;
    btn.textContent = '刷新中...';
    
    await loadData();
    
    btn.disabled = false;
    btn.textContent = '刷新数据';
}

// 显示加载状态
function showLoading() {
    document.querySelectorAll('.chart').forEach(chart => {
        chart.classList.add('loading');
    });
}

// 隐藏加载状态
function hideLoading() {
    document.querySelectorAll('.chart').forEach(chart => {
        chart.classList.remove('loading');
    });
}

// 显示错误信息
function showError(message) {
    document.querySelectorAll('.chart').forEach(chart => {
        chart.innerHTML = `
            <div class="error-message">
                <h3>数据加载失败</h3>
                <p>${message}</p>
            </div>
        `;
    });
}

// 更新最后更新时间
function updateLastUpdateTime() {
    const now = new Date();
    const timeString = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('lastUpdate').textContent = timeString;
}
