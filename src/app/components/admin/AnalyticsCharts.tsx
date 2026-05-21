import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";


const revenueData = [
    { name: 'Mon', total: 1500 },
    { name: 'Tue', total: 2300 },
    { name: 'Wed', total: 3200 },
    { name: 'Thu', total: 2900 },
    { name: 'Fri', total: 4500 },
    { name: 'Sat', total: 5100 },
    { name: 'Sun', total: 3800 },
];

const trafficData = [
    { subject: 'Direct', A: 120, fullMark: 150 },
    { subject: 'Social', A: 98, fullMark: 150 },
    { subject: 'Organic', A: 86, fullMark: 150 },
    { subject: 'Referral', A: 99, fullMark: 150 },
    { subject: 'Email', A: 85, fullMark: 150 },
    { subject: 'Ads', A: 65, fullMark: 150 },
];


export function UserGrowthChart({ data }: { data?: any[] }) {
    if (!data || data.length === 0) return <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">No data available</div>;

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                    <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#94a3b8' }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#94a3b8' }}
                    />
                    <Tooltip
                        contentStyle={{
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            backgroundColor: 'rgba(255, 255, 255, 0.95)'
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="users"
                        name="Total Users"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorUsers)"
                    />
                    <Area
                        type="monotone"
                        dataKey="active"
                        name="Active Users"
                        stroke="#10b981"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorActive)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

export function RoleDistributionChart({ data }: { data?: any[] }) {
    if (!data || data.length === 0) return <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">No data available</div>;

    return (
        <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        cornerRadius={6}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                        }}
                    />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        formatter={(value) => <span className="text-sm text-slate-600 dark:text-slate-400 font-medium ml-1">{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

export function RevenueChart({ data }: { data?: any[] }) {
    // Fallback data if none provided (since we don't have real revenue yet)
    const displayData = data && data.length > 0 ? data : revenueData;

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={displayData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#94a3b8' }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#94a3b8' }}
                        tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                        }}
                        formatter={(value: number) => [`$${value}`, "Revenue"]}
                    />
                    <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={50}>
                        {displayData.map((_: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#6366f1" : "rgba(99, 102, 241, 0.6)"} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

export function TrafficRadarChart({ data }: { data?: any[] }) {
    // Fallback data
    const displayData = data && data.length > 0 ? data : trafficData;

    return (
        <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={displayData}>
                    <PolarGrid opacity={0.2} />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 150]} opacity={0} />
                    <Radar
                        name="Traffic"
                        dataKey="A"
                        stroke="#f43f5e"
                        fill="#f43f5e"
                        fillOpacity={0.5}
                    />
                    <Tooltip
                        contentStyle={{
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                        }}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}

export function ContentOverviewChart({ data }: { data: { jobs: number, courses: number, posts: number } }) {
    const chartData = [
        { name: 'Jobs', value: data.jobs, color: '#f97316' }, // Orange
        { name: 'Courses', value: data.courses, color: '#ef4444' }, // Red
        { name: 'Posts', value: data.posts, color: '#6366f1' }, // Indigo
    ];

    return (
        <div className="w-full">
            <div className="h-[120px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={chartData} margin={{ left: 0, right: 0 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" hide width={100} />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            }}
                        />
                        <Bar dataKey="value" barSize={24} radius={[6, 6, 6, 6]} background={{ fill: 'rgba(0,0,0,0.05)', radius: 6 }}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="flex justify-between items-center px-2 mt-4">
                {chartData.map((item, i) => (
                    <div key={i} className="flex flex-col items-center">
                        <span className="text-xs text-muted-foreground font-medium">{item.name}</span>
                        <span className="text-lg font-bold tracking-tight" style={{ color: item.color }}>{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
