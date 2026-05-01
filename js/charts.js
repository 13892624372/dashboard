// 图表渲染类
// 使用 ECharts 渲染各种图表

class DashboardCharts {
    constructor() {
        this.charts = {};
        this.data = null;
    }

    // 初始化所有图表
    init() {
        // 核心指标卡片不需要 ECharts

        // Q1+Q3 用户画像 - 组合图表
        this.charts.q1Identity = echarts.init(document.getElementById('q1IdentityChart'));

        // Q2 行业 - 柱状图
        this.charts.q2Industry = echarts.init(document.getElementById('q2IndustryChart'));

        // Q6 满意度 - 折线+柱状混合图
        this.charts.q6Satisfaction = echarts.init(document.getElementById('q6SatisfactionChart'));

        // Q7 五维度评分 - 雷达图
        this.charts.q7Radar = echarts.init(document.getElementById('q7RadarChart'));

        // Q8 NPS - 柱状图
        this.charts.q8Nps = echarts.init(document.getElementById('q8NpsChart'));

        // Q9 做得最好 - 词云
        this.charts.q9Good = echarts.init(document.getElementById('q9GoodChart'));

        // Q10 改进建议 - 词云
        this.charts.q10Improve = echarts.init(document.getElementById('q10ImproveChart'));

        // 响应式处理
        window.addEventListener('resize', () => {
            Object.values(this.charts).forEach(chart => chart.resize());
        });
    }

    // 更新所有图表
    update(data) {
        this.data = data;
        
        // 更新核心指标
        this.updateCoreMetrics();
        
        // 更新各图表
        this.renderQ1Identity();
        this.renderQ2Industry();
        this.renderQ6Satisfaction();
        this.renderQ7Radar();
        this.renderQ8Nps();
        this.renderQ9Good();
        this.renderQ10Improve();
    }

    // 更新核心指标卡片
    updateCoreMetrics() {
        const { userFeedback } = this.data;
        const F = CONFIG.FIELDS;
        
        // 总问卷数
        document.getElementById('totalResponses').textContent = userFeedback.length;
        
        // 平均满意度 (Q4)
        const satisfactionScores = userFeedback
            .filter(f => f[F.Q4_SATISFACTION])
            .map(f => parseInt(f[F.Q4_SATISFACTION]));
        const avgSatisfaction = satisfactionScores.length > 0 
            ? (satisfactionScores.reduce((a, b) => a + b, 0) / satisfactionScores.length).toFixed(1)
            : '0.0';
        document.getElementById('avgSatisfaction').textContent = avgSatisfaction;
        
        // NPS值 (Q10)
        const npsScores = userFeedback
            .filter(f => f[F.Q10_NPS])
            .map(f => parseInt(f[F.Q10_NPS]));
        let npsValue = 0;
        if (npsScores.length > 0) {
            const promoters = npsScores.filter(s => s >= 9).length;
            const detractors = npsScores.filter(s => s <= 6).length;
            npsValue = Math.round(((promoters - detractors) / npsScores.length) * 100);
        }
        document.getElementById('npsValue').textContent = (npsValue > 0 ? '+' : '') + npsValue;
    }

    // Q1+Q3 用户画像 - 组合图表（左侧饼图+右侧横向柱状图）
    renderQ1Identity() {
        const { userFeedback } = this.data;
        const F = CONFIG.FIELDS;

        // 统计身份分布
        const identityDist = {};
        userFeedback.forEach(f => {
            const identity = f[F.Q1_IDENTITY] || '未填写';
            identityDist[identity] = (identityDist[identity] || 0) + 1;
        });

        // 统计新老用户
        let newUsers = 0;
        let oldUsers = 0;
        userFeedback.forEach(f => {
            const usage = f[F.Q3_USAGE_COUNT] || '';
            // 第1次使用为新用户，其他为老用户
            if (usage.includes('1') || usage.includes('第1次') || usage.includes('首次')) {
                newUsers++;
            } else {
                oldUsers++;
            }
        });

        const totalUsers = newUsers + oldUsers;
        const newUserPercent = totalUsers > 0 ? Math.round((newUsers / totalUsers) * 100) : 0;
        const oldUserPercent = totalUsers > 0 ? Math.round((oldUsers / totalUsers) * 100) : 0;

        const option = {
            tooltip: { 
                trigger: 'item', 
                formatter: function(params) {
                    if (params.seriesType === 'bar') {
                        const percent = params.name === '新用户' ? newUserPercent : oldUserPercent;
                        return params.name + ': ' + params.value + '人 (' + percent + '%)';
                    }
                    return params.name + ': ' + params.value + ' (' + params.percent + '%)';
                }
            },
            legend: {
                data: ['身份分布', '新用户', '老用户'],
                top: 0,
                textStyle: { fontSize: 10 },
                itemWidth: 12,
                itemHeight: 12
            },
            grid: {
                left: '55%',
                right: '5%',
                top: '15%',
                bottom: '10%'
            },
            series: [
                // 左侧：身份分布饼图
                {
                    name: '身份分布',
                    type: 'pie',
                    radius: ['35%', '55%'],
                    center: ['28%', '55%'],
                    data: Object.entries(identityDist).map(([name, value]) => ({ name, value })),
                    label: { fontSize: 10 },
                    emphasis: {
                        itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' }
                    }
                },
                // 右侧：新老用户横向柱状图
                {
                    name: '用户类型',
                    type: 'bar',
                    barWidth: '50%',
                    data: [
                        { name: '新用户', value: newUsers, itemStyle: { color: '#667eea' } },
                        { name: '老用户', value: oldUsers, itemStyle: { color: '#764ba2' } }
                    ],
                    label: {
                        show: true,
                        position: 'right',
                        formatter: '{c}人',
                        fontSize: 10
                    }
                }
            ],
            xAxis: {
                type: 'value',
                minInterval: 1,
                axisLabel: { fontSize: 9 },
                splitLine: { lineStyle: { type: 'dashed' } }
            },
            yAxis: {
                type: 'category',
                data: ['新用户', '老用户'],
                axisLabel: { fontSize: 10 },
                axisTick: { show: false }
            }
        };

        this.charts.q1Identity.setOption(option);
    }

    // Q2 行业 - 柱状图
    renderQ2Industry() {
        const { userFeedback } = this.data;
        const F = CONFIG.FIELDS;

        // 统计行业分布
        const distribution = {};
        userFeedback.forEach(f => {
            const industry = f[F.Q2_INDUSTRY] || '未填写';
            distribution[industry] = (distribution[industry] || 0) + 1;
        });

        // 将"其他"移到最后
        const sortedEntries = Object.entries(distribution).sort((a, b) => {
            if (a[0] === '其他') return 1;
            if (b[0] === '其他') return -1;
            return b[1] - a[1]; // 按数量降序
        });

        const categories = sortedEntries.map(e => e[0]);
        const values = sortedEntries.map(e => e[1]);

        const option = {
            tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
            grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
            xAxis: { type: 'category', data: categories, axisLabel: { rotate: 30 } },
            yAxis: { type: 'value', minInterval: 1 },
            series: [{
                type: 'bar',
                data: values,
                itemStyle: { color: '#667eea' }
            }]
        };

        this.charts.q2Industry.setOption(option);
    }

    // Q6 满意度 - 折线+柱状混合图（按天统计）
    renderQ6Satisfaction() {
        const { userFeedback } = this.data;
        const F = CONFIG.FIELDS;

        // 按日期分组统计
        const dailyStats = {};
        userFeedback.forEach(f => {
            const timestamp = f[F.TIMESTAMP];
            const satisfaction = parseInt(f[F.Q4_SATISFACTION]);
            if (timestamp && !isNaN(satisfaction)) {
                // 提取日期部分（假设格式是 "2025/5/1 14:30:00" 或类似）
                const date = timestamp.split(' ')[0].split('/').slice(0, 2).join('/');
                if (!dailyStats[date]) {
                    dailyStats[date] = { scores: [], count: 0 };
                }
                dailyStats[date].scores.push(satisfaction);
                dailyStats[date].count++;
            }
        });

        // 按日期排序
        const sortedDates = Object.keys(dailyStats).sort();
        const dates = sortedDates.map(date => {
            // 简化日期显示，如 "5/1"
            const parts = date.split('/');
            return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : date;
        });
        const avgScores = sortedDates.map(date => {
            const scores = dailyStats[date].scores;
            return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2);
        });
        const counts = sortedDates.map(date => dailyStats[date].count);

        // 如果没有数据，显示提示
        if (dates.length === 0) {
            this.charts.q6Satisfaction.setOption({
                title: {
                    text: '暂无数据',
                    left: 'center',
                    top: 'center',
                    textStyle: { color: '#999', fontSize: 14 }
                }
            });
            return;
        }

        const option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'cross' }
            },
            legend: {
                data: ['平均满意度', '问卷数量'],
                top: 0,
                textStyle: { fontSize: 10 }
            },
            grid: {
                left: '5%',
                right: '5%',
                bottom: '10%',
                top: '12%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: dates,
                axisLabel: { fontSize: 11, rotate: 0 }
            },
            yAxis: [
                {
                    type: 'value',
                    name: '满意度',
                    min: 0,
                    max: 5,
                    nameTextStyle: { fontSize: 10 },
                    axisLabel: { fontSize: 10 }
                },
                {
                    type: 'value',
                    name: '数量',
                    min: 0,
                    nameTextStyle: { fontSize: 10 },
                    axisLabel: { fontSize: 10 }
                }
            ],
            series: [
                {
                    name: '平均满意度',
                    type: 'line',
                    data: avgScores,
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 6,
                    lineStyle: { color: '#667eea', width: 2 },
                    itemStyle: { color: '#667eea' },
                    yAxisIndex: 0
                },
                {
                    name: '问卷数量',
                    type: 'bar',
                    data: counts,
                    barWidth: '40%',
                    itemStyle: {
                        color: 'rgba(102, 126, 234, 0.3)',
                        borderColor: '#667eea',
                        borderWidth: 1
                    },
                    yAxisIndex: 1
                }
            ]
        };

        this.charts.q6Satisfaction.setOption(option);
    }

    // Q7 五维度评分 - 雷达图
    renderQ7Radar() {
        const { userFeedback } = this.data;
        const F = CONFIG.FIELDS;
        
        // 计算五个维度的平均分
        const dimensions = [
            { field: F.Q5_RELEVANCE, name: '问题相关性' },
            { field: F.Q6_UNDERSTANDING, name: 'AI理解准确度' },
            { field: F.Q7_FLUENCY, name: '面试流畅度' },
            { field: F.Q8_FRIENDLINESS, name: '面试官友好度' },
            { field: F.Q9_REFERENCE, name: '评价参考价值' }
        ];
        
        const averages = dimensions.map(dim => {
            const scores = userFeedback
                .filter(f => f[dim.field])
                .map(f => parseInt(f[dim.field]));
            return scores.length > 0 
                ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
                : 0;
        });
        
        const option = {
            tooltip: { trigger: 'item' },
            radar: {
                indicator: dimensions.map(dim => ({ name: dim.name, max: 5 })),
                center: ['50%', '55%'],
                radius: '55%',
                axisName: {
                    fontSize: 11,
                    color: '#666'
                }
            },
            series: [{
                type: 'radar',
                data: [{
                    value: averages,
                    name: '平均分',
                    areaStyle: { color: 'rgba(102, 126, 234, 0.3)' },
                    lineStyle: { color: '#667eea', width: 2 },
                    itemStyle: { color: '#667eea' }
                }]
            }]
        };

        this.charts.q7Radar.setOption(option);
    }

    // Q8 NPS - 柱状图
    renderQ8Nps() {
        const { userFeedback } = this.data;
        const F = CONFIG.FIELDS;
        
        // 统计 NPS 分布
        const npsScores = userFeedback
            .filter(f => f[F.Q10_NPS])
            .map(f => parseInt(f[F.Q10_NPS]));
        
        const distribution = { '贬损者(0-6)': 0, '被动者(7-8)': 0, '推荐者(9-10)': 0 };
        npsScores.forEach(score => {
            if (score <= 6) distribution['贬损者(0-6)']++;
            else if (score <= 8) distribution['被动者(7-8)']++;
            else distribution['推荐者(9-10)']++;
        });
        
        const option = {
            tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
            grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
            xAxis: { 
                type: 'category', 
                data: Object.keys(distribution),
                axisLabel: { interval: 0, fontSize: 10 }
            },
            yAxis: { type: 'value', minInterval: 1 },
            series: [{
                type: 'bar',
                data: Object.values(distribution),
                itemStyle: {
                    color: (params) => {
                        const colors = ['#ff6b6b', '#ffd93d', '#51cf66'];
                        return colors[params.dataIndex];
                    }
                }
            }]
        };
        
        this.charts.q8Nps.setOption(option);
    }

    // Q9 做得最好 - 词云
    renderQ9Good() {
        const { userFeedback } = this.data;
        const F = CONFIG.FIELDS;

        const texts = userFeedback
            .filter(f => f[F.Q11_GOOD_ASPECTS])
            .map(f => f[F.Q11_GOOD_ASPECTS]);

        const words = this.extractKeywords(texts.join(' '), 'good');

        // 如果没有数据，显示提示
        if (words.length === 0) {
            this.charts.q9Good.setOption({
                title: {
                    text: '暂无数据',
                    left: 'center',
                    top: 'center',
                    textStyle: { color: '#999', fontSize: 14 }
                }
            });
            return;
        }

        const option = {
            tooltip: {
                show: true,
                formatter: '{b}: {c}次'
            },
            series: [{
                type: 'wordCloud',
                shape: 'diamond',
                left: 'center',
                top: 'center',
                width: '95%',
                height: '95%',
                sizeRange: [14, 50],
                rotationRange: [-30, 30],
                rotationStep: 15,
                gridSize: 12,
                drawOutOfBound: false,
                layoutAnimation: true,
                textStyle: {
                    fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
                    fontWeight: 'bold',
                    color: (params) => {
                        const colors = [
                            '#667eea', '#764ba2', '#5a67d8', '#4c51bf',
                            '#805ad5', '#6b46c1', '#553c9a', '#44337a'
                        ];
                        return colors[params.dataIndex % colors.length];
                    }
                },
                emphasis: {
                    focus: 'self',
                    textStyle: {
                        shadowBlur: 10,
                        shadowColor: 'rgba(102, 126, 234, 0.5)'
                    }
                },
                data: words
            }]
        };

        this.charts.q9Good.setOption(option);
    }

    // Q10 改进建议 - 词云
    renderQ10Improve() {
        const { userFeedback } = this.data;
        const F = CONFIG.FIELDS;

        const texts = userFeedback
            .filter(f => f[F.Q12_IMPROVEMENTS])
            .map(f => f[F.Q12_IMPROVEMENTS]);

        const words = this.extractKeywords(texts.join(' '), 'improve');

        // 如果没有数据，显示提示
        if (words.length === 0) {
            this.charts.q10Improve.setOption({
                title: {
                    text: '暂无数据',
                    left: 'center',
                    top: 'center',
                    textStyle: { color: '#999', fontSize: 14 }
                }
            });
            return;
        }

        const option = {
            tooltip: {
                show: true,
                formatter: '{b}: {c}次'
            },
            series: [{
                type: 'wordCloud',
                shape: 'diamond',
                left: 'center',
                top: 'center',
                width: '95%',
                height: '95%',
                sizeRange: [14, 50],
                rotationRange: [-30, 30],
                rotationStep: 15,
                gridSize: 12,
                drawOutOfBound: false,
                layoutAnimation: true,
                textStyle: {
                    fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
                    fontWeight: 'bold',
                    color: (params) => {
                        const colors = [
                            '#e53e3e', '#dd6b20', '#d69e2e', '#38a169',
                            '#319795', '#3182ce', '#5a67d8', '#805ad5'
                        ];
                        return colors[params.dataIndex % colors.length];
                    }
                },
                emphasis: {
                    focus: 'self',
                    textStyle: {
                        shadowBlur: 10,
                        shadowColor: 'rgba(229, 62, 62, 0.5)'
                    }
                },
                data: words
            }]
        };

        this.charts.q10Improve.setOption(option);
    }

    // 提取关键词（改进版分词）
    extractKeywords(text, type) {
        if (!text) return [];

        // 停用词（需要过滤掉的常见词）
        const stopWords = new Set([
            '的', '了', '是', '在', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这', '那', '这些', '那些', '这个', '那个', '之', '与', '及', '等', '或', '但', '而', '因为', '所以', '如果', '虽然', '可以', '应该', '需要', '感觉', '觉得', '认为', '方面', '地方', '时候', '时间', '一下', '一些', '一点', '比较', '非常', '挺', '还', '更', '最', '太', '真的', '比较', '总体', '整体', '基本', '大概', '可能', '应该', '希望', '建议', '能够', '得到', '获得', '进行', '完成', '实现', '提供', '使用', '体验', '服务', '产品', '功能', '系统', '平台', 'AI', '面试', '模拟器', '面试官'
        ]);

        // 根据类型定义特定停用词
        const typeStopWords = type === 'good' ?
            new Set(['不错', '很好', '挺好的', '还可以', '行', '可以', '满意', '喜欢', '支持', '感谢', '谢谢']) :
            new Set(['问题', '缺点', '不足', '不好', '差', '麻烦', '困难', '建议', '改进', '优化', '完善']);

        // 合并停用词
        const allStopWords = new Set([...stopWords, ...typeStopWords]);

        // 清洗文本
        let cleanedText = text
            .replace(/[\s,，.。!！?？;；:：""''（）()\[\]【】]+/g, ' ')
            .replace(/\d+/g, ' ')
            .trim();

        // 使用更智能的分词策略
        const wordCount = {};

        // 方法1：按空格分割（处理已分词的文本）
        const spaceWords = cleanedText.split(/\s+/).filter(w => w.length >= 2);
        spaceWords.forEach(word => {
            if (!allStopWords.has(word)) {
                wordCount[word] = (wordCount[word] || 0) + 1;
            }
        });

        // 方法2：提取2-6字的关键词（滑动窗口）
        const pureText = cleanedText.replace(/\s/g, '');
        for (let len = 2; len <= 6; len++) {
            for (let i = 0; i <= pureText.length - len; i++) {
                const word = pureText.substring(i, i + len);
                // 过滤纯数字、纯英文、停用词
                if (/^[\u4e00-\u9fa5]+$/.test(word) && !allStopWords.has(word)) {
                    wordCount[word] = (wordCount[word] || 0) + 1;
                }
            }
        }

        // 转换为数组并排序
        let result = Object.entries(wordCount)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        // 去重：如果短词被长词包含，优先保留长词（更具体）
        const finalWords = [];
        const usedWords = new Set();

        for (const item of result) {
            const word = item.name;
            // 检查是否已被更长的词包含
            let isContained = false;
            for (const used of usedWords) {
                if (used.includes(word) && used !== word) {
                    isContained = true;
                    break;
                }
            }
            if (!isContained) {
                finalWords.push(item);
                usedWords.add(word);
            }
            if (finalWords.length >= 25) break;
        }

        return finalWords;
    }
}

// 创建图表实例
const dashboardCharts = new DashboardCharts();
