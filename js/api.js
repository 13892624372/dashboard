// Google Sheets API 封装
// 提供数据获取接口

class SheetsAPI {
    constructor() {
        this.baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets';
        this.apiKey = CONFIG.API_KEY;
        this.spreadsheetId = CONFIG.SPREADSHEET_ID;
    }

    // 从 Google Sheets 获取数据
    async fetchSheetData(sheetName) {
        if (this.apiKey === 'YOUR_API_KEY_HERE' || this.spreadsheetId === 'YOUR_SPREADSHEET_ID_HERE') {
            throw new Error('请先在 config.js 中配置 API_KEY 和 SPREADSHEET_ID');
        }

        try {
            // 添加时间戳避免缓存
            const timestamp = new Date().getTime();
            const url = `${this.baseUrl}/${this.spreadsheetId}/values/${encodeURIComponent(sheetName)}?key=${this.apiKey}&_=${timestamp}`;
            console.log('请求URL:', url);
            const response = await fetch(url, {
                cache: 'no-store'
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('API 错误详情:', errorData);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error?.message || 'Unknown error'}`);
            }
            
            const data = await response.json();
            console.log('API 返回数据:', sheetName, data);
            return this.parseSheetData(data.values);
        } catch (error) {
            console.error('获取数据失败:', error);
            throw error;
        }
    }

    // 解析 Sheets 数据（将二维数组转换为对象数组）
    parseSheetData(values) {
        if (!values || values.length < 2) return [];
        
        const headers = values[0];
        const rows = values.slice(1);
        
        return rows.map(row => {
            const obj = {};
            headers.forEach((header, index) => {
                let value = row[index] || '';
                
                // 类型转换
                if (value === 'true' || value === 'TRUE') value = true;
                else if (value === 'false' || value === 'FALSE') value = false;
                else if (!isNaN(value) && value !== '') value = Number(value);
                
                obj[header] = value;
            });
            return obj;
        });
    }

    // 获取所有数据
    async getAllData() {
        try {
            const userFeedback = await this.fetchSheetData(CONFIG.SHEETS.USER_FEEDBACK);
            
            return {
                userFeedback,
                totalCount: userFeedback.length
            };
        } catch (error) {
            console.error('获取所有数据失败:', error);
            throw error;
        }
    }
}

// 创建 API 实例
const sheetsAPI = new SheetsAPI();
