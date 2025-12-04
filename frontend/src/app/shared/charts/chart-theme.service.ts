import { Injectable } from '@angular/core';
import { EChartsOption } from 'echarts';
import { ChartType, ChartConfig, ChartColors } from './chart.models';

@Injectable({ providedIn: 'root' })
export class ChartThemeService {
  private neutralColors: ChartColors = {
    primary: 'rgba(0, 217, 255, 1)',
    secondary: 'rgba(132, 188, 71, 1)',
    tertiary: 'rgba(0, 172, 167, 1)',
    background: 'transparent',
    text: '#64748b',
    grid: 'rgba(100, 116, 139, 0.15)',
  };

  getChartOption(
    type: ChartType,
    data: any[],
    config: Partial<ChartConfig> = {}
  ): EChartsOption {
    const colors = this.neutralColors;

    const finalConfig: ChartConfig = {
      fontFamily: 'Inter, sans-serif',
      fontSize: 12,
      borderRadius: 8,
      showLabels: true,
      showLegend: true,
      showGrid: true,
      smooth: false,
      stacked: false,
      colors,
      ...config,
    };

    const baseOption: EChartsOption = {
      backgroundColor: finalConfig.colors!.background,
      textStyle: {
        fontFamily: finalConfig.fontFamily,
        color: finalConfig.colors!.text,
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(30, 41, 59, 0.95)',
        borderColor: 'rgba(100, 116, 139, 0.3)',
        borderWidth: 1,
        textStyle: {
          color: '#e2e8f0',
        },
        padding: 12,
        borderRadius: 8,
      },
    };

    switch (type) {
      case 'heatmap':
        return this.createEnhancedHeatmap(data, finalConfig, baseOption);
      case 'bar':
        return this.createBarChart(data, finalConfig, baseOption);
      case 'line':
        return this.createLineChart(data, finalConfig, baseOption);
      default:
        return baseOption;
    }
  }


  private createEnhancedHeatmap(
    data: any[],
    config: ChartConfig,
    baseOption: EChartsOption
  ): EChartsOption {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const severities = ['Low', 'Medium', 'High', 'Critical'];

    return {
      ...baseOption,
      grid: {
        left: '80px',
        right: '60px',
        bottom: '60px',
        top: '60px',
      },
      xAxis: {
        type: 'category',
        data: hours.map(h => `${h.toString().padStart(2, '0')}:00`),
        axisLabel: {
          color: config.colors!.text,
          fontSize: 11,
          interval: 0,
          rotate: 45,
        },
        axisLine: {
          lineStyle: {
            color: config.colors!.grid,
          },
        },
        splitArea: {
          show: true,
          areaStyle: {
            color: ['rgba(100, 116, 139, 0.03)', 'rgba(100, 116, 139, 0.06)'],
          },
        },
      },
      yAxis: {
        type: 'category',
        data: severities,
        axisLabel: {
          color: config.colors!.text,
          fontSize: 13,
          fontWeight: 600,
        },
        axisLine: {
          lineStyle: {
            color: config.colors!.grid,
          },
        },
        splitArea: {
          show: true,
          areaStyle: {
            color: ['rgba(100, 116, 139, 0.03)', 'rgba(100, 116, 139, 0.06)'],
          },
        },
      },
      visualMap: {
        type: 'piecewise',
        dimension: 1, // Use y-axis dimension (severity index)
        pieces: [
          { value: 0, label: 'Low', color: '#22c55e' },
          { value: 1, label: 'Medium', color: '#f59e0b' },
          { value: 2, label: 'High', color: '#f97316' },
          { value: 3, label: 'Critical', color: '#ef4444' },
        ],
        orient: 'horizontal',
        left: 'center',
        top: 5,
        textStyle: {
          fontSize: 11,
          color: config.colors!.text,
        },
        itemWidth: 14,
        itemHeight: 14,
        itemGap: 15,
        selectedMode: 'multiple',
      },
      series: [{
        type: 'heatmap',
        data: data.map(item => [item.x, item.y, item.value]),
        label: {
          show: config.showLabels,
          fontSize: 13,
          fontWeight: 'bold',
          color: '#1e293b', // Dark text for heatmap cells
          formatter: (params: any) => {
            return params.value[2] > 0 ? params.value[2] : '';
          }
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
            borderColor: config.colors!.text,
            borderWidth: 2,
          },
        },
        itemStyle: {
          borderColor: 'rgba(100, 116, 139, 0.2)',
          borderWidth: 2,
          borderRadius: 6,
        },
      }],
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(30, 41, 59, 0.95)',
        borderColor: 'rgba(100, 116, 139, 0.3)',
        borderWidth: 1,
        textStyle: {
          color: '#e2e8f0',
        },
        padding: 12,
        borderRadius: 8,
        formatter: (params: any) => {
          const hour = params.value[0];
          const severityIndex = params.value[1];
          const count = params.value[2];
          const severityNames = ['Low', 'Medium', 'High', 'Critical'];

          if (count === 0 || count === undefined) {
            return 'No anomalies';
          }

          return `
            <div style="padding: 4px;">
              <div style="font-weight: 600; margin-bottom: 4px;">
                ${hour.toString().padStart(2, '0')}:00 - ${((hour + 1) % 24).toString().padStart(2, '0')}:00
              </div>
              <div>Severity: <strong>${severityNames[severityIndex]}</strong></div>
              <div>Count: <strong>${count}</strong></div>
            </div>
          `;
        }
      },
    };
  }

  private createBarChart(
    data: any[],
    config: ChartConfig,
    baseOption: EChartsOption
  ): EChartsOption {
    const isHybrid = config.hybrid === true;

    let cumulativeData: number[] = [];
    if (isHybrid) {
      let sum = 0;
      cumulativeData = data.map(item => {
        sum += item.value;
        return sum;
      });
    }

    const barSeries: any = {
      name: 'Volume',
      type: 'bar',
      yAxisIndex: 0,
      data: data.map((item) => ({
        value: item.value,
        itemStyle: {
          color: config.colors!.primary,
          borderRadius: [config.borderRadius!, config.borderRadius!, 0, 0],
        },
      })),
      barMaxWidth: 60,
      label: {
        show: config.showLabels,
        position: 'top',
        color: config.colors!.text,
        fontSize: config.fontSize! - 2,
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.3)',
        },
      },
    };

    const series: any[] = [barSeries];

    if (isHybrid) {
      series.push({
        name: 'Cumulative',
        type: 'line',
        yAxisIndex: 1,
        data: cumulativeData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 3,
          color: config.colors!.secondary,
        },
        itemStyle: {
          color: config.colors!.secondary,
          borderWidth: 2,
          borderColor: '#fff',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0,
              color: 'rgba(132, 188, 71, 0.25)'
            }, {
              offset: 1,
              color: 'rgba(132, 188, 71, 0.06)'
            }]
          }
        },
        emphasis: {
          disabled: false,
          scale: true,
          itemStyle: {
            borderWidth: 3
          }
        }
      });
    }

    // Configure Y-axes
    const yAxisConfig: any[] = [{
      type: 'value',
      name: 'Count',
      position: 'left',
      axisLine: {
        show: true,
        lineStyle: { color: config.colors!.text }
      },
      axisLabel: {
        color: config.colors!.text,
        fontSize: config.fontSize,
      },
      splitLine: {
        show: config.showGrid,
        lineStyle: { color: config.colors!.grid, type: 'dashed' },
      },
    }];

    if (isHybrid) {
      yAxisConfig.push({
        type: 'value',
        name: 'Cumulative',
        position: 'right',
        axisLine: {
          show: true,
          lineStyle: { color: config.colors!.secondary }
        },
        axisLabel: {
          color: config.colors!.text,
          fontSize: config.fontSize,
        },
        splitLine: {
          show: false,
        },
      });
    }

    return {
      ...baseOption,
      legend: isHybrid ? {
        data: ['Volume', 'Cumulative'],
        top: 10,
        textStyle: {
          color: config.colors!.text,
        },
      } : undefined,
      grid: {
        left: '50px',
        right: isHybrid ? '60px' : '20px',
        bottom: '50px',
        top: isHybrid ? '50px' : '50px',
      },
      xAxis: {
        type: 'category',
        data: data.map(item => item.name || item.label),
        axisLine: {
          lineStyle: { color: config.colors!.grid },
        },
        axisLabel: {
          color: config.colors!.text,
          fontSize: config.fontSize,
        },
        splitLine: {
          show: config.showGrid,
          lineStyle: { color: config.colors!.grid, type: 'dashed' },
        },
      },
      yAxis: yAxisConfig,
      series,
    };
  }

  private createLineChart(
    data: any[],
    config: ChartConfig,
    baseOption: EChartsOption
  ): EChartsOption {
    return {
      ...baseOption,
      grid: {
        left: '3%',
        right: '3%',
        bottom: '10%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: data.map(item => item.name || item.label),
        boundaryGap: false,
        axisLine: {
          lineStyle: { color: config.colors!.grid },
        },
        axisLabel: {
          color: config.colors!.text,
          fontSize: config.fontSize,
        },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisLabel: {
          color: config.colors!.text,
          fontSize: config.fontSize,
        },
        splitLine: {
          show: config.showGrid,
          lineStyle: { color: config.colors!.grid, type: 'dashed' },
        },
      },
      series: [{
        type: 'line',
        data: data.map(item => item.value),
        smooth: config.smooth,
        lineStyle: {
          color: config.colors!.primary,
          width: 3,
        },
        itemStyle: {
          color: config.colors!.primary,
        },
        symbol: 'circle',
        symbolSize: 6,
        areaStyle: config.stacked ? {
          color: {
            type: 'linear' as const,
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: config.colors!.primary || 'rgba(0, 217, 255, 1)' },
              { offset: 1, color: 'rgba(0, 217, 255, 0.1)' },
            ],
          },
        } : undefined,
      }],
    };
  }
}
