import React from 'react';
import {
    ComposedChart,
    Area,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    ReferenceLine
} from 'recharts';
import { useCurrency } from '../context/CurrencyContext';
import { formatCurrency } from '../utils/formatCurrency';
import { useTheme } from '../context/ThemeContext';

const PriceChart = ({ history, forecast7Day, forecast30Day }) => {
    const { currency } = useCurrency();
    const { isDarkMode } = useTheme();

    if (!history || history.length === 0) {
        return (
            <div className="flex h-full items-center justify-center text-gray-500 dark:text-gray-400">
                No historical data available.
            </div>
        );
    }

    // 1. Map historical data
    const chartData = history.map(h => ({
        date: new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        price: h.price,
        forecast7: null,
        forecast30: null
    }));

    // 2. Attach forecasts to make continuous lines
    const lastPoint = chartData[chartData.length - 1];
    const todayDateStr = lastPoint.date;

    if (forecast7Day && forecast7Day.forecastPrice !== undefined) {
        // Link the start of the forecast to the last real data point
        lastPoint.forecast7 = lastPoint.price;

        const date7 = new Date();
        date7.setDate(date7.getDate() + 7);
        chartData.push({
            date: date7.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            price: null,
            forecast7: forecast7Day.forecastPrice,
            forecast30: null
        });
    }

    if (forecast30Day && forecast30Day.forecastPrice !== undefined) {
        // Since we want the 30-day forecast to stem from the history, link it up
        lastPoint.forecast30 = lastPoint.price;

        const date30 = new Date();
        date30.setDate(date30.getDate() + 30);
        chartData.push({
            date: date30.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            price: null,
            forecast7: null,
            forecast30: forecast30Day.forecastPrice
        });
    }

    // 3. Theme-aware dynamic colors
    const gridColor = isDarkMode ? '#374151' : '#E5E7EB';
    const textColor = isDarkMode ? '#9CA3AF' : '#6B7280';
    const historyLine = isDarkMode ? '#818CF8' : '#4F46E5'; // Indigo
    const f7Line = isDarkMode ? '#34D399' : '#10B981'; // Emerald
    const f30Line = isDarkMode ? '#F87171' : '#EF4444'; // Red

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700/60 backdrop-blur-sm dark:bg-gray-800/90 transition-all">
                    <p className="font-semibold text-gray-800 dark:text-gray-200 mb-3 text-sm">{label}</p>
                    <div className="space-y-2">
                        {payload.map((entry, index) => (
                            <div key={index} className="flex items-center text-sm justify-between gap-4">
                                <div className="flex items-center">
                                    <span
                                        className="w-2.5 h-2.5 rounded-full mr-2"
                                        style={{ backgroundColor: entry.color }}
                                    ></span>
                                    <span className="text-gray-600 dark:text-gray-400">
                                        {entry.name}
                                    </span>
                                </div>
                                <span className="font-bold text-gray-900 dark:text-white">
                                    {formatCurrency(entry.value, currency)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                    <defs>
                        <linearGradient id="colorHistory" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={historyLine} stopOpacity={0.25} />
                            <stop offset="95%" stopColor={historyLine} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                    <XAxis
                        dataKey="date"
                        stroke={textColor}
                        tick={{ fill: textColor, fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        minTickGap={20}
                    />
                    <YAxis
                        stroke={textColor}
                        tick={{ fill: textColor, fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => formatCurrency(val, currency).replace(/\.00$/, '')}
                        domain={['auto', 'auto']}
                        width={80}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: isDarkMode ? '#4B5563' : '#D1D5DB', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Legend
                        verticalAlign="top"
                        height={36}
                        iconType="circle"
                        wrapperStyle={{ fontSize: '13px', color: textColor }}
                    />

                    <ReferenceLine
                        x={todayDateStr}
                        stroke={isDarkMode ? '#4B5563' : '#9CA3AF'}
                        strokeDasharray="3 3"
                        label={{ position: 'insideTopLeft', value: 'Today', fill: textColor, fontSize: 11, offset: 10 }}
                    />

                    <Area
                        name="Historical"
                        type="monotone"
                        dataKey="price"
                        stroke={historyLine}
                        fillOpacity={1}
                        fill="url(#colorHistory)"
                        strokeWidth={3}
                        activeDot={{ r: 6, stroke: isDarkMode ? '#1F2937' : '#FFFFFF', strokeWidth: 2 }}
                        animationDuration={1200}
                        animationEasing="ease-in-out"
                    />
                    <Line
                        name="7-Day Model"
                        type="monotone"
                        dataKey="forecast7"
                        stroke={f7Line}
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={false}
                        activeDot={{ r: 5 }}
                        animationDuration={1200}
                        animationEasing="ease-in-out"
                    />
                    <Line
                        name="30-Day Model"
                        type="monotone"
                        dataKey="forecast30"
                        stroke={f30Line}
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={false}
                        activeDot={{ r: 5 }}
                        animationDuration={1200}
                        animationEasing="ease-in-out"
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PriceChart;
