
import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    google: any;
  }
}

interface ChartDisplayProps {
  data: string[][];
}

const getChartability = (data: string[][]): { isChartable: boolean; suitableCharts: string[] } => {
    if (!data || data.length < 2 || data[0].length < 2) {
        return { isChartable: false, suitableCharts: [] };
    }

    const firstDataRow = data[1];
    let numericColumns = 0;
    for (let i = 1; i < firstDataRow.length; i++) {
        const val = parseFloat(firstDataRow[i]);
        if (!isNaN(val) && isFinite(val)) {
            numericColumns++;
        }
    }
    
    if (numericColumns === 0) {
        return { isChartable: false, suitableCharts: [] };
    }

    const suitableCharts = ['ColumnChart', 'BarChart'];
    if (data[0].length === 2) {
        suitableCharts.push('PieChart');
    }

    return { isChartable: true, suitableCharts };
};


const ChartDisplay: React.FC<ChartDisplayProps> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartability, setChartability] = useState({ isChartable: false, suitableCharts: [] as string[] });
  const [chartType, setChartType] = useState('ColumnChart');

  useEffect(() => {
    const result = getChartability(data);
    setChartability(result);
    if (result.isChartable) {
      setChartType('ColumnChart');
    }
  }, [data]);
  
  useEffect(() => {
    if (!chartability.isChartable || !window.google || !window.google.charts) {
      return;
    }

    const drawChart = () => {
      if (!chartRef.current) return;
      
      const header = data[0];
      const rows = data.slice(1).map(row => 
        row.map((cell, index) => {
          if (index > 0) {
            const num = parseFloat(cell);
            return isNaN(num) ? null : num;
          }
          return cell;
        })
      );

      const dataTable = window.google.visualization.arrayToDataTable([header, ...rows]);

      const options = {
        titleTextStyle: { color: '#f3f4f6', fontSize: 16 },
        backgroundColor: 'transparent',
        legend: { textStyle: { color: '#9ca3af' } },
        hAxis: { 
            textStyle: { color: '#9ca3af' },
            titleTextStyle: { color: '#9ca3af' },
        },
        vAxis: { 
            textStyle: { color: '#9ca3af' },
            titleTextStyle: { color: '#9ca3af' },
            gridlines: { color: '#374151' }
        },
        colors: ['#4f46e5', '#7c3aed', '#a855f7', '#ec4899', '#f97316'],
        chartArea: { left: 60, top: 30, width: '90%', height: '80%' },
      };
      
      let chart;
      if (chartType === 'PieChart' && chartability.suitableCharts.includes('PieChart')) {
        chart = new window.google.visualization.PieChart(chartRef.current);
      } else if (chartType === 'BarChart') {
        chart = new window.google.visualization.BarChart(chartRef.current);
      } else {
        chart = new window.google.visualization.ColumnChart(chartRef.current);
      }
      chart.draw(dataTable, options);
    };
    
    const handleResize = () => drawChart();
    
    window.google.charts.load('current', { 'packages': ['corechart'] });
    window.google.charts.setOnLoadCallback(drawChart);
    
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };

  }, [data, chartability, chartType]);

  if (!chartability.isChartable) {
    return null;
  }

  return (
    <div className="mt-8 w-full animate-fade-in">
        <h3 className="text-xl font-semibold text-dark-text mb-4">Data Visualization</h3>
        <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="flex flex-wrap gap-2 mb-4">
                {chartability.suitableCharts.includes('ColumnChart') &&
                    <button onClick={() => setChartType('ColumnChart')} className={`px-3 py-1 text-sm rounded transition-colors ${chartType === 'ColumnChart' ? 'bg-brand-primary text-white' : 'bg-gray-600 hover:bg-gray-500'}`}>Column</button>
                }
                {chartability.suitableCharts.includes('BarChart') &&
                    <button onClick={() => setChartType('BarChart')} className={`px-3 py-1 text-sm rounded transition-colors ${chartType === 'BarChart' ? 'bg-brand-primary text-white' : 'bg-gray-600 hover:bg-gray-500'}`}>Bar</button>
                }
                {chartability.suitableCharts.includes('PieChart') &&
                    <button onClick={() => setChartType('PieChart')} className={`px-3 py-1 text-sm rounded transition-colors ${chartType === 'PieChart' ? 'bg-brand-primary text-white' : 'bg-gray-600 hover:bg-gray-500'}`}>Pie</button>
                }
            </div>
            <div ref={chartRef} className="w-full h-96"></div>
        </div>
    </div>
  );
};

export default ChartDisplay;