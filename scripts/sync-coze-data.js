// Coze 数据同步脚本
// 配置
const COZE_API_KEY = 'pat_sDGZGAuu8wJqQUChnsL0z0OyxRkhxIWoeF2ubQmTsz0LBwq9q0dmH58I48ypFr1k';
const COZE_BOT_ID = '7632215391754436660';
const COZE_USER_ID = 'test_user_1777537876034';  // 使用创建会话时的 user_id
const GOOGLE_SHEETS_ID = '1-EqgInbe7Wen7yq87uXSC2RuR2uM0hUiOne3pa3Hc4k';  // 更新为第三个表
const GOOGLE_API_KEY = 'AIzaSyCSZrU1OrdEpzrFJ_LTBCf1FiVgECm8uiU';

// Coze API 基础 URL
const COZE_BASE_URL = 'https://api.coze.cn/v1';

// Google Sheets API 基础 URL
const SHEETS_BASE_URL = 'https://sheets.googleapis.com/v4';

// 已知的会话 ID 列表（从浏览器控制台创建）
const KNOWN_CONVERSATION_IDS = [
    '7634467044218634283'
];

// 获取会话详情
async function getConversationDetail(conversationId) {
    try {
        const url = `${COZE_BASE_URL}/conversations/${conversationId}`;
        console.log('查询会话详情:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${COZE_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error(`获取会话 ${conversationId} 失败:`, response.status);
            return null;
        }

        const data = await response.json();
        console.log(`会话 ${conversationId} 详情:`, data);
        return data.data || null;
    } catch (error) {
        console.error(`获取会话 ${conversationId} 失败:`, error);
        return null;
    }
}

// 获取 Coze 会话列表（直接查询已知会话）
async function getCozeConversations() {
    console.log('直接查询已知会话...');
    
    const conversations = [];
    for (const convId of KNOWN_CONVERSATION_IDS) {
        const detail = await getConversationDetail(convId);
        if (detail) {
            conversations.push(detail);
        }
    }
    
    return conversations;
}

// 获取会话详情
async function getConversationMessages(conversationId) {
    try {
        const response = await fetch(`${COZE_BASE_URL}/conversations/${conversationId}/messages`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${COZE_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Coze API error: ${response.status}`);
        }

        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('获取会话消息失败:', error);
        return [];
    }
}

// 解析会话数据为看板格式
function parseSessionData(conversations) {
    const sessions = [];
    
    conversations.forEach((conv, index) => {
        // 从消息中分析完成状态
        const messageCount = conv.message_count || 0;
        
        // 根据消息数量判断完成进度
        // 假设：开场白(1) + 自我介绍(1) + 5轮问答(10) + 点评(1) + 结束(1) = 约14-16条消息
        let completedIntro = messageCount >= 3;
        let completedQ1 = messageCount >= 5;
        let completedQ2 = messageCount >= 7;
        let completedQ3 = messageCount >= 9;
        let completedQ4 = messageCount >= 11;
        let completedQ5 = messageCount >= 13;
        
        // 判断流失点
        let dropOffPoint = '';
        if (!completedQ5) {
            if (!completedQ4) dropOffPoint = 'q4';
            else if (!completedQ3) dropOffPoint = 'q3';
            else if (!completedQ2) dropOffPoint = 'q2';
            else if (!completedQ1) dropOffPoint = 'q1';
            else if (!completedIntro) dropOffPoint = 'intro';
        }
        
        const session = {
            session_id: conv.id || `session_${String(index + 1).padStart(3, '0')}`,
            has_uploaded_resume: true,  // 使用 Coze 的都上传了
            has_uploaded_jd: true,
            completed_intro: completedIntro,
            completed_q1: completedQ1,
            completed_q2: completedQ2,
            completed_q3: completedQ3,
            completed_q4: completedQ4,
            completed_q5: completedQ5,
            drop_off_point: dropOffPoint,
            total_duration: Math.round((conv.usage?.token_count || 0) / 10)  // 估算时长
        };
        sessions.push(session);
    });
    
    return sessions;
}

// 更新 Google Sheets
async function updateGoogleSheets(sessions) {
    try {
        // 准备数据格式
        const values = sessions.map(s => [
            s.session_id,
            s.has_uploaded_resume,
            s.has_uploaded_jd,
            s.completed_intro,
            s.completed_q1,
            s.completed_q2,
            s.completed_q3,
            s.completed_q4,
            s.completed_q5,
            s.drop_off_point,
            s.total_duration
        ]);

        // 添加表头
        const header = ['session_id', 'has_uploaded_resume', 'has_uploaded_jd', 
                       'completed_intro', 'completed_q1', 'completed_q2', 'completed_q3', 
                       'completed_q4', 'completed_q5', 'drop_off_point', 'total_duration'];
        values.unshift(header);

        // 调用 Google Sheets API
        const url = `${SHEETS_BASE_URL}/spreadsheets/${GOOGLE_SHEETS_ID}/values/mock_data?valueInputOption=RAW&key=${GOOGLE_API_KEY}`;
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                values: values
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Google Sheets API 错误:', errorText);
            throw new Error(`Google Sheets API error: ${response.status}`);
        }

        console.log('数据已同步到 Google Sheets');
        return true;
    } catch (error) {
        console.error('更新 Google Sheets 失败:', error);
        return false;
    }
}

// 主函数
async function main() {
    console.log('开始同步 Coze 数据...');
    console.log('Bot ID:', COZE_BOT_ID);
    
    // 1. 获取 Coze 会话
    const conversations = await getCozeConversations();
    console.log(`获取到 ${conversations.length} 个会话`);
    
    if (conversations.length === 0) {
        console.log('没有会话数据');
        return;
    }
    
    // 2. 解析数据
    const sessions = parseSessionData(conversations);
    console.log('解析后的会话数据:', sessions);
    
    // 3. 更新 Google Sheets
    const success = await updateGoogleSheets(sessions);
    
    if (success) {
        console.log('同步完成！');
    } else {
        console.log('同步失败');
    }
}

// 运行
main().catch(console.error);
