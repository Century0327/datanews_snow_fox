(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  function hexToRgba(hex, alpha) {
    if (!hex || hex.charAt(0) !== '#') return hex;
    var r, g, b;
    if (hex.length === 4) {
      r = parseInt(hex.charAt(1) + hex.charAt(1), 16);
      g = parseInt(hex.charAt(2) + hex.charAt(2), 16);
      b = parseInt(hex.charAt(3) + hex.charAt(3), 16);
    } else if (hex.length === 7) {
      r = parseInt(hex.slice(1, 3), 16);
      g = parseInt(hex.slice(3, 5), 16);
      b = parseInt(hex.slice(5, 7), 16);
    } else {
      return hex;
    }
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }

  // Common tooltip base config
  var tooltipBase = {
    appendToBody: true,
    backgroundColor: hexToRgba(bg2, 0.98),
    borderColor: rule,
    borderWidth: 1,
    textStyle: { color: ink, fontFamily: 'InstrumentSans, Noto Sans SC, sans-serif', fontSize: 13 },
    confine: true,
    extraCssText: 'box-shadow: 0 4px 18px rgba(0,0,0,0.08); border-radius: 6px;'
  };

  // Common animation config
  var animBase = {
    animation: true,
    animationDuration: 800,
    animationEasing: 'cubicOut'
  };

  // Mobile media query reused across charts
  var mobileQuery = { maxWidth: 768 };

  // ==============================
  // Chart 1: Henan Agenda Ladder
  // ==============================
  var chartLadder = echarts.init(document.getElementById('chart-henan-ladder'), null, { renderer: 'canvas' });
  chartLadder.setOption(Object.assign({}, animBase, {
    tooltip: Object.assign({}, tooltipBase, {
      trigger: 'item',
      formatter: function(params) {
        var descs = {
          '议程升级': '从网络迷因 → 中国网络媒体论坛标杆案例。通过官方话语体系的重新编码，将草根话题提升为国家叙事样本。',
          '概念升级': '从"胡辣汤" → "我是那座山"（精神象征）。用情感共鸣替代地域标签，构建跨圈层传播的符号体系。',
          '内容升级': '从"酱板鸭" → "胡辣汤"（地域标签置换）。借势已有热度话题，完成注意力资源的精准转移。'
        };
        var d = descs[params.name] || params.data.desc || '';
        return '<strong style="color:' + accent + ';font-size:14px;">' + params.name + '</strong><br/><br/>'
          + '<span style="color:' + ink + ';font-size:12px;line-height:1.6;">' + d + '</span>';
      }
    }),
    grid: { top: 30, bottom: 30, left: 90, right: 180 },
    xAxis: {
      type: 'value',
      show: false,
      max: 100
    },
    yAxis: {
      type: 'category',
      data: ['议程升级', '概念升级', '内容升级'],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: ink,
        fontSize: 13,
        fontWeight: 700,
        fontFamily: 'InstrumentSans, Noto Sans SC, sans-serif'
      }
    },
    series: [{
      type: 'bar',
      data: [
        {
          value: 95,
          name: '议程升级',
          desc: '从网络迷因 → 中国网络媒体论坛标杆案例',
          itemStyle: { color: accent, borderRadius: [0, 4, 4, 0] }
        },
        {
          value: 80,
          name: '概念升级',
          desc: '从"胡辣汤" → "我是那座山"（精神象征）',
          itemStyle: { color: hexToRgba(accent, 0.85), borderRadius: [0, 4, 4, 0] }
        },
        {
          value: 60,
          name: '内容升级',
          desc: '从"酱板鸭" → "胡辣汤"（地域标签置换）',
          itemStyle: { color: hexToRgba(accent, 0.6), borderRadius: [0, 4, 4, 0] }
        }
      ],
      barWidth: 28,
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: hexToRgba(accent, 0.25)
        }
      },
      label: {
        show: true,
        position: 'right',
        formatter: function(p) {
          var descLabels = {
            '议程升级': '网络迷因 → 媒体论坛标杆',
            '概念升级': '胡辣汤 → 精神象征',
            '内容升级': '酱板鸭 → 地域标签置换'
          };
          return descLabels[p.name] || p.name;
        },
        color: muted,
        fontSize: 11,
        fontFamily: 'InstrumentSans, Noto Sans SC, sans-serif',
        distance: 8
      }
    }],
    media: [{
      query: mobileQuery,
      option: {
        grid: { top: 20, bottom: 20, left: 70, right: 95 },
        yAxis: { axisLabel: { fontSize: 11 } },
        series: [{
          barWidth: 22,
          label: { fontSize: 10, distance: 6 }
        }]
      }
    }]
  }));
  window.addEventListener('resize', function() { chartLadder.resize(); });

  // ==============================
  // Chart 2: Labor Day Comparison (Horizontal Grouped)
  // ==============================
  var chartLabor = echarts.init(document.getElementById('chart-labor-day'), null, { renderer: 'canvas' });
  chartLabor.setOption(Object.assign({}, animBase, {
    tooltip: Object.assign({}, tooltipBase, {
      trigger: 'axis',
      axisPointer: { type: 'shadow', shadowStyle: { color: hexToRgba(rule, 0.25) } },
      formatter: function(params) {
        var idx = params[0].dataIndex;
        var category = idx === 0 ? '游客人次' : '旅游收入';
        var henanVal = idx === 0 ? '6611.7万' : '381.1亿';
        var guizhouVal = idx === 0 ? '4706.9万' : '297.7亿';
        var diff = idx === 0 ? '多1904.8万' : '多83.4亿';
        var html = '<strong style="color:' + accent + ';font-size:14px;">' + category + '</strong><br/><br/>';
        params.forEach(function(p) {
          if (p.seriesName === '差额') return;
          var val = p.seriesName === '河南' ? henanVal : guizhouVal;
          var dot = p.seriesName === '河南' ? accent : accent2;
          html += '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + dot + ';margin-right:6px;"></span>'
            + '<strong>' + p.seriesName + '：</strong>' + val + '<br/>';
        });
        html += '<br/><span style="color:' + accent + ';font-size:12px;">河南比贵州' + diff + '</span>';
        return html;
      }
    }),
    legend: {
      data: ['河南', '贵州'],
      top: 10,
      textStyle: { color: muted, fontFamily: 'InstrumentSans, Noto Sans SC, sans-serif', fontSize: 12 },
      itemWidth: 14,
      itemHeight: 14,
      itemGap: 20
    },
    grid: { top: 55, bottom: 35, left: 80, right: 140 },
    xAxis: {
      type: 'value',
      show: false,
      max: 80
    },
    yAxis: {
      type: 'category',
      data: ['旅游收入', '游客人次'],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: ink,
        fontSize: 13,
        fontWeight: 700,
        fontFamily: 'InstrumentSans, Noto Sans SC, sans-serif'
      }
    },
    series: [
      {
        name: '河南',
        type: 'bar',
        data: [38.1, 66.1],
        itemStyle: { color: accent, borderRadius: [0, 4, 4, 0] },
        barWidth: 28,
        barGap: '30%',
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: hexToRgba(accent, 0.25)
          }
        },
        label: {
          show: true,
          position: 'inside',
          formatter: function(p) {
            return p.dataIndex === 0 ? '381.1亿' : '6611.7万';
          },
          color: '#fff',
          fontWeight: 700,
          fontFamily: 'IBMPlexMono, monospace',
          fontSize: 12
        }
      },
      {
        name: '贵州',
        type: 'bar',
        data: [29.8, 47.1],
        itemStyle: { color: accent2, borderRadius: [0, 4, 4, 0] },
        barWidth: 28,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: hexToRgba(accent2, 0.25)
          }
        },
        label: {
          show: true,
          position: 'inside',
          formatter: function(p) {
            return p.dataIndex === 0 ? '297.7亿' : '4706.9万';
          },
          color: '#fff',
          fontWeight: 700,
          fontFamily: 'IBMPlexMono, monospace',
          fontSize: 12
        }
      },
      // Difference annotation series
      {
        name: '差额',
        type: 'bar',
        data: [8.3, 19.0],
        barWidth: 2,
        barGap: '-100%',
        itemStyle: { color: 'transparent' },
        label: {
          show: true,
          position: 'right',
          formatter: function(p) {
            return p.dataIndex === 0 ? '+83.4亿' : '+1904.8万';
          },
          color: accent,
          fontWeight: 700,
          fontFamily: 'IBMPlexMono, monospace',
          fontSize: 11,
          distance: 8
        },
        tooltip: { show: false },
        silent: true
      }
    ],
    media: [{
      query: mobileQuery,
      option: {
        legend: { top: 5, itemGap: 12, textStyle: { fontSize: 11 } },
        grid: { top: 45, bottom: 25, left: 60, right: 75 },
        yAxis: { axisLabel: { fontSize: 11 } },
        series: [
          { barWidth: 20, label: { fontSize: 10 } },
          { barWidth: 20, label: { fontSize: 10 } },
          { label: { fontSize: 10, distance: 5 } }
        ]
      }
    }]
  }));
  window.addEventListener('resize', function() { chartLabor.resize(); });

  // ==============================
  // Chart 3: Topic Heat Trend
  // ==============================
  var heatDates = ['2.27', '3.5', '3.12', '3.18', '3.24', '3.27', '4.3'];
  var chartHeat = echarts.init(document.getElementById('chart-heat-trend'), null, { renderer: 'canvas' });
  chartHeat.setOption(Object.assign({}, animBase, {
    tooltip: Object.assign({}, tooltipBase, {
      trigger: 'axis',
      formatter: function(params) {
        var date = params[0].axisValue;
        var html = '<strong style="color:' + accent + ';font-size:14px;">' + date + '</strong><br/><br/>';
        params.forEach(function(p) {
          var dot = p.color && p.color.colorStops ? p.color.colorStops[0].color : (p.color || muted);
          html += '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + dot + ';margin-right:6px;"></span>'
            + '<strong>' + p.seriesName + '：</strong>'
            + '<span style="font-family:IBMPlexMono,monospace;">' + p.value + '亿</span><br/>';
        });
        return html;
      }
    }),
    legend: {
      data: ['#酱板鸭话题', '#雪山救狐狸话题', '微信指数'],
      top: 10,
      textStyle: { color: muted, fontFamily: 'InstrumentSans, Noto Sans SC, sans-serif', fontSize: 11 },
      itemWidth: 18,
      itemHeight: 10,
      itemGap: 16
    },
    grid: { top: 55, bottom: 70, left: 65, right: 30 },
    dataZoom: [
      {
        type: 'slider',
        xAxisIndex: 0,
        bottom: 10,
        height: 20,
        borderColor: 'transparent',
        backgroundColor: bg2,
        fillerColor: hexToRgba(accent, 0.2),
        handleStyle: { color: accent, borderColor: accent },
        textStyle: { color: muted, fontFamily: 'InstrumentSans, Noto Sans SC, sans-serif', fontSize: 10 },
        dataBackground: {
          lineStyle: { color: rule },
          areaStyle: { color: hexToRgba(accent, 0.06) }
        },
        selectedDataBackground: {
          lineStyle: { color: accent },
          areaStyle: { color: hexToRgba(accent, 0.2) }
        }
      },
      {
        type: 'inside',
        xAxisIndex: 0
      }
    ],
    xAxis: {
      type: 'category',
      data: heatDates,
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontFamily: 'InstrumentSans, Noto Sans SC, sans-serif', fontSize: 11 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      name: '播放量/指数 (亿)',
      nameTextStyle: { color: muted, fontFamily: 'InstrumentSans, Noto Sans SC, sans-serif', fontSize: 11, padding: [0, 0, 0, -10] },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: rule, type: [4, 4] } },
      axisLabel: { color: muted, fontFamily: 'InstrumentSans, Noto Sans SC, sans-serif', fontSize: 11 }
    },
    series: [
      {
        name: '#酱板鸭话题',
        type: 'line',
        data: [0.1, 5, 20, 35, 45, 50, 52],
        smooth: 0.4,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: { color: accent },
        lineStyle: { width: 2.5 },
        emphasis: {
          lineStyle: { width: 4 },
          itemStyle: { borderWidth: 3, borderColor: accent }
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: hexToRgba(accent, 0.2) },
            { offset: 1, color: hexToRgba(accent, 0.02) }
          ])
        },
        markPoint: {
          symbol: 'pin',
          symbolSize: 50,
          itemStyle: { color: accent },
          label: {
            show: true,
            color: '#fff',
            fontSize: 9,
            fontFamily: 'InstrumentSans, Noto Sans SC, sans-serif',
            lineHeight: 12,
            formatter: function(p) {
              if (p.dataIndex === 3) return '南部空军\n3.18';
              if (p.dataIndex === 4) return '人民网\n3.24';
              if (p.dataIndex === 5) return '央视新闻\n3.27';
              return '';
            }
          },
          data: [
            { type: 'max', name: '南部空军' },
            { xAxis: '3.24', yAxis: 45, name: '人民网' },
            { xAxis: '3.27', yAxis: 50, name: '央视新闻' }
          ]
        }
      },
      {
        name: '#雪山救狐狸话题',
        type: 'line',
        data: [0, 0.5, 1, 1.2, 1.8, 2.0, 2.1],
        smooth: 0.4,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: { color: accent2 },
        lineStyle: { width: 2.5 },
        emphasis: {
          lineStyle: { width: 4 },
          itemStyle: { borderWidth: 3, borderColor: accent2 }
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: hexToRgba(accent2, 0.2) },
            { offset: 1, color: hexToRgba(accent2, 0.02) }
          ])
        }
      },
      {
        name: '微信指数',
        type: 'line',
        data: [0, 0.02, 0.05, 0.08, 0.1, 0.11, 0.12],
        smooth: 0.4,
        symbol: 'none',
        itemStyle: { color: muted },
        lineStyle: { width: 1.5, type: [6, 4] },
        emphasis: {
          lineStyle: { width: 3 }
        }
      }
    ],
    media: [{
      query: mobileQuery,
      option: {
        legend: { top: 5, itemWidth: 14, itemHeight: 8, itemGap: 10, textStyle: { fontSize: 10 } },
        grid: { top: 45, bottom: 55, left: 45, right: 15 },
        xAxis: { axisLabel: { rotate: 45, fontSize: 10 } },
        yAxis: { nameTextStyle: { fontSize: 10 }, axisLabel: { fontSize: 10 } },
        dataZoom: [{ height: 14, bottom: 6 }],
        series: [
          { symbolSize: 4, markPoint: { symbolSize: 40, label: { fontSize: 8 } } },
          { symbolSize: 4 },
          {}
        ]
      }
    }]
  }));
  window.addEventListener('resize', function() { chartHeat.resize(); });

})();
