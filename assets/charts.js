(function() {
  function getCssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }
  var accent = getCssVar('--accent');
  var accent2 = getCssVar('--accent2');
  var ink = getCssVar('--ink');
  var muted = getCssVar('--muted');
  var rule = getCssVar('--rule');
  var bg2 = getCssVar('--bg2');

  var isMobile = window.innerWidth <= 768;

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

  var tooltipBase = {
    appendToBody: true,
    backgroundColor: hexToRgba(bg2, 0.98),
    borderColor: rule,
    borderWidth: 1,
    textStyle: { color: ink, fontFamily: 'InstrumentSans, Noto Sans SC, sans-serif', fontSize: 13 },
    confine: true,
    extraCssText: 'box-shadow: 0 4px 18px rgba(0,0,0,0.08); border-radius: 6px;'
  };

  var animBase = {
    animation: true,
    animationDuration: 800,
    animationEasing: 'cubicOut'
  };

  /**
   * 核心修复：图表必须在容器可见且尺寸稳定后初始化。
   * 主因：section 初始 opacity:0（reveal 动画），echarts.init 在不可见元素上
   * 会拿到 width/height = 0 或错误值，导致 canvas 坐标系全部错位。
   */
  function initChartWhenVisible(id, getOption) {
    var el = document.getElementById(id);
    if (!el) {
      console.warn('[echarts] element not found:', id);
      return;
    }

    function doInit() {
      var rect = el.getBoundingClientRect();
      console.log('[echarts] ' + id + ' container rect:', rect.width, 'x', rect.height);

      if (rect.width === 0 || rect.height === 0) {
        console.warn('[echarts] ' + id + ' container has zero size, retry in 100ms');
        setTimeout(doInit, 100);
        return;
      }

      // 清理旧实例（避免重复 init 产生多个 canvas）
      var old = echarts.getInstanceByDom(el);
      if (old) old.dispose();

      var chart = echarts.init(el, null, {
        renderer: 'canvas',
        devicePixelRatio: window.devicePixelRatio || 1
      });
      chart.setOption(getOption());

      console.log('[echarts] ' + id + ' init getWidth/getHeight:', chart.getWidth(), chart.getHeight());
      console.log('[echarts] ' + id + ' option grid:', JSON.stringify(chart.getOption().grid));

      // 再强制 resize 一次，确保 canvas 与容器完全对齐
      requestAnimationFrame(function() {
        chart.resize();
        console.log('[echarts] ' + id + ' after resize:', chart.getWidth(), chart.getHeight());
      });
    }

    // 用 IntersectionObserver 确保容器进入视口、浏览器已 paint 后再 init
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          observer.unobserve(el);
          // 留一帧给浏览器完成 paint / 计算 layout
          requestAnimationFrame(function() {
            doInit();
          });
        }
      });
    }, { threshold: 0.05, rootMargin: '50px' });

    observer.observe(el);
  }

  // ==============================
  // Chart 1: Henan Agenda Ladder
  // ==============================
  initChartWhenVisible('chart-henan-ladder', function() {
    return Object.assign({}, animBase, {
      tooltip: Object.assign({}, tooltipBase, {
        trigger: 'item',
        formatter: function(params) {
          var descs = {
            '议程升级': '从网络迷因 → 中国网络媒体论坛标杆案例。',
            '概念升级': '从"胡辣汤" → "我是那座山"（精神象征）。',
            '内容升级': '从"酱板鸭" → "胡辣汤"（地域标签置换）。'
          };
          var d = descs[params.name] || '';
          return '<strong style="color:' + accent + '">' + params.name + '</strong><br/>' + d;
        }
      }),
      grid: isMobile
        ? { top: 5, bottom: 5, left: 60, right: 5, containLabel: false }
        : { top: 20, bottom: 20, left: 90, right: 180 },
      xAxis: { type: 'value', show: false, max: 100 },
      yAxis: {
        type: 'category',
        data: ['议程升级', '概念升级', '内容升级'],
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: ink,
          fontSize: isMobile ? 11 : 13,
          fontWeight: 700,
          fontFamily: 'InstrumentSans, Noto Sans SC, sans-serif'
        }
      },
      series: [{
        type: 'bar',
        data: [
          { value: 95, name: '议程升级', itemStyle: { color: accent, borderRadius: [0, 4, 4, 0] } },
          { value: 80, name: '概念升级', itemStyle: { color: hexToRgba(accent, 0.85), borderRadius: [0, 4, 4, 0] } },
          { value: 60, name: '内容升级', itemStyle: { color: hexToRgba(accent, 0.6), borderRadius: [0, 4, 4, 0] } }
        ],
        barWidth: isMobile ? 20 : 28,
        label: {
          show: !isMobile,
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
      }]
    });
  });

  // ==============================
  // Chart 2: Labor Day Comparison
  // ==============================
  initChartWhenVisible('chart-labor-day', function() {
    return Object.assign({}, animBase, {
      tooltip: Object.assign({}, tooltipBase, {
        trigger: 'axis',
        axisPointer: { type: 'shadow', shadowStyle: { color: hexToRgba(rule, 0.25) } },
        formatter: function(params) {
          var idx = params[0].dataIndex;
          var category = idx === 0 ? '游客人次' : '旅游收入';
          var henanVal = idx === 0 ? '6611.7万' : '381.1亿';
          var guizhouVal = idx === 0 ? '4706.9万' : '297.7亿';
          var diff = idx === 0 ? '多1904.8万' : '多83.4亿';
          var html = '<strong style="color:' + accent + '">' + category + '</strong><br/>';
          params.forEach(function(p) {
            if (p.seriesName === '差额') return;
            var val = p.seriesName === '河南' ? henanVal : guizhouVal;
            var dot = p.seriesName === '河南' ? accent : muted;
            html += '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + dot + ';margin-right:6px;"></span>'
              + p.seriesName + '：' + val + '<br/>';
          });
          html += '<span style="color:' + accent + ';font-size:12px;">河南比贵州' + diff + '</span>';
          return html;
        }
      }),
      legend: {
        data: ['河南', '贵州'],
        top: 5,
        textStyle: { color: muted, fontFamily: 'InstrumentSans, Noto Sans SC, sans-serif', fontSize: isMobile ? 11 : 12 },
        itemWidth: 14,
        itemHeight: 14,
        itemGap: isMobile ? 12 : 20
      },
      grid: isMobile
        ? { top: 35, bottom: 5, left: 5, right: '18%', containLabel: true }
        : { top: 55, bottom: 35, left: 80, right: 140 },
      xAxis: { type: 'value', show: false, max: 80 },
      yAxis: {
        type: 'category',
        data: ['旅游收入', '游客人次'],
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: ink,
          fontSize: isMobile ? 11 : 13,
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
          barWidth: isMobile ? 16 : 26,
          barGap: '30%',
          label: {
            show: true,
            position: isMobile ? 'insideRight' : 'right',
            distance: isMobile ? 4 : 8,
            formatter: function(p) {
              return p.dataIndex === 0 ? '381.1亿' : '6611.7万';
            },
            color: '#fff',
            fontWeight: 700,
            fontFamily: 'InstrumentSans, Noto Sans SC, sans-serif',
            fontSize: isMobile ? 10 : 12,
            textShadowColor: 'rgba(0,0,0,0.2)',
            textShadowBlur: 2
          }
        },
        {
          name: '贵州',
          type: 'bar',
          data: [29.8, 47.1],
          itemStyle: { color: muted, borderRadius: [0, 4, 4, 0] },
          barWidth: isMobile ? 16 : 26,
          label: {
            show: true,
            // Stagger: 贵州 label 外侧偏下，避免与河南 label 重叠
            position: isMobile ? ['102%', '70%'] : 'right',
            distance: isMobile ? 0 : 8,
            offset: isMobile ? [0, 8] : [0, 10],
            formatter: function(p) {
              return p.dataIndex === 0 ? '297.7亿' : '4706.9万';
            },
            color: muted,
            fontWeight: 700,
            fontFamily: 'InstrumentSans, Noto Sans SC, sans-serif',
            fontSize: isMobile ? 10 : 12
          }
        }
      ]
    });
  });

  // ==============================
  // Chart 3: Topic Heat Trend
  // ==============================
  var heatDates = ['2.27', '3.5', '3.12', '3.18', '3.24', '3.27', '4.3'];
  initChartWhenVisible('chart-heat-trend', function() {
    return Object.assign({}, animBase, {
      tooltip: Object.assign({}, tooltipBase, {
        trigger: 'axis',
        formatter: function(params) {
          var date = params[0].axisValue;
          var html = '<strong style="color:' + accent + '">' + date + '</strong><br/>';
          params.forEach(function(p) {
            var dot = p.color && p.color.colorStops ? p.color.colorStops[0].color : (p.color || muted);
            html += '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + dot + ';margin-right:6px;"></span>'
              + p.seriesName + '：' + p.value + '亿<br/>';
          });
          return html;
        }
      }),
      legend: {
        data: ['#酱板鸭话题', '#雪山救狐狸话题', '微信指数'],
        top: 5,
        textStyle: { color: muted, fontFamily: 'InstrumentSans, Noto Sans SC, sans-serif', fontSize: isMobile ? 10 : 11 },
        itemWidth: isMobile ? 14 : 18,
        itemHeight: isMobile ? 8 : 10,
        itemGap: isMobile ? 10 : 16
      },
      grid: isMobile
        ? { top: 35, bottom: 25, left: 5, right: 5, containLabel: true }
        : { top: 55, bottom: 70, left: 65, right: 30 },
      dataZoom: isMobile ? [] : [
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
        { type: 'inside', xAxisIndex: 0 }
      ],
      xAxis: {
        type: 'category',
        data: heatDates,
        axisLine: { lineStyle: { color: rule } },
        axisLabel: { color: muted, fontFamily: 'InstrumentSans, Noto Sans SC, sans-serif', fontSize: isMobile ? 10 : 11 },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        name: isMobile ? '' : '播放量/指数 (亿)',
        nameTextStyle: { color: muted, fontFamily: 'InstrumentSans, Noto Sans SC, sans-serif', fontSize: 11, padding: [0, 0, 0, -10] },
        axisLine: { show: false },
        splitLine: { lineStyle: { color: rule, type: [4, 4] } },
        axisLabel: { color: muted, fontFamily: 'InstrumentSans, Noto Sans SC, sans-serif', fontSize: isMobile ? 10 : 11 }
      },
      series: [
        {
          name: '#酱板鸭话题',
          type: 'line',
          data: [0.1, 5, 20, 35, 45, 50, 52],
          smooth: 0.4,
          symbol: 'circle',
          symbolSize: isMobile ? 4 : 6,
          itemStyle: { color: accent },
          lineStyle: { width: 2.5 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: hexToRgba(accent, 0.2) },
              { offset: 1, color: hexToRgba(accent, 0.02) }
            ])
          },
          markPoint: isMobile ? { data: [] } : {
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
          symbolSize: isMobile ? 4 : 6,
          itemStyle: { color: muted },
          lineStyle: { width: 2.5 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: hexToRgba(muted, 0.18) },
              { offset: 1, color: hexToRgba(muted, 0.02) }
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
          lineStyle: { width: 1.5, type: [6, 4] }
        }
      ]
    });
  });

  // 全局 resize：通过 echarts.getInstanceByDom 获取实例，不依赖全局变量
  function resizeAllCharts() {
    ['chart-heat-trend', 'chart-henan-ladder', 'chart-labor-day'].forEach(function(id) {
      var el = document.getElementById(id);
      if (!el) return;
      var chart = echarts.getInstanceByDom(el);
      if (chart) {
        chart.resize();
        console.log('[echarts] ' + id + ' resized:', chart.getWidth(), chart.getHeight());
      }
    });
  }

  window.addEventListener('resize', function() {
    var newIsMobile = window.innerWidth <= 768;
    if (newIsMobile !== isMobile) {
      location.reload();
      return;
    }
    resizeAllCharts();
  });

  window.addEventListener('load', resizeAllCharts);

  // 对图表容器本身做 ResizeObserver（比 window resize 更可靠）
  if (typeof ResizeObserver !== 'undefined') {
    ['chart-heat-trend', 'chart-henan-ladder', 'chart-labor-day'].forEach(function(id) {
      var el = document.getElementById(id);
      if (!el) return;
      var ro = new ResizeObserver(function(entries) {
        var chart = echarts.getInstanceByDom(el);
        if (chart) chart.resize();
      });
      ro.observe(el);
    });
  }

})();
