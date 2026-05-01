// 配置文件
// 注意：实际使用时请替换为真实的 API Key 和 Spreadsheet ID

const CONFIG = {
    // Google Sheets API 配置
    API_KEY: 'AIzaSyCSZrU1OrdEpzrFJ_LTBCf1FiVgECm8uiU',
    
    // Google Sheets ID
    SPREADSHEET_ID: '1-EqgInbe7Wen7yq87uXSC2RuR2uM0hUiOne3pa3Hc4k',
    
    // 工作表名称
    SHEETS: {
        USER_FEEDBACK: 'Form_Responses'   // 用户反馈（Google表单自动创建）
    },
    
    // 表头字段映射（新问卷 Q1-Q12）
    FIELDS: {
        TIMESTAMP: '时间戳记',
        Q1_IDENTITY: '您的身份是？',
        Q2_INDUSTRY: '您所在的行业',
        Q3_USAGE_COUNT: '您之前使用过几次本产品？',
        Q4_SATISFACTION: '整体满意度评分',
        Q5_RELEVANCE: '请对以下方面进行评分 [问题与您的简历/岗位的相关性]',
        Q6_UNDERSTANDING: '请对以下方面进行评分 [AI对您回答的理解准确度]',
        Q7_FLUENCY: '请对以下方面进行评分 [面试过程的流畅度]',
        Q8_FRIENDLINESS: '请对以下方面进行评分 [面试官的友好度和自然度]',
        Q9_REFERENCE: '请对以下方面进行评分 [最终面试评价的参考价值]',
        Q10_NPS: '您向朋友推荐本产品的可能性？',
        Q11_GOOD_ASPECTS: '您觉得AI面试官在哪方面做得好？',
        Q12_IMPROVEMENTS: '您觉得最需要改进的地方是？'
    }
};
