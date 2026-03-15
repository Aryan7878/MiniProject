import React from 'react';
import { CheckCircle2, AlertCircle, Clock, Info } from 'lucide-react';

const BuyBadge = ({ rec, large = false }) => {
    let config = {
        text: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-500/10 dark:text-gray-300 dark:border-gray-500/20',
        icon: Info,
        label: 'Monitor',
        glow: 'shadow-[0_0_15px_rgba(107,114,128,0.2)] dark:shadow-[0_0_15px_rgba(156,163,175,0.1)]'
    };

    const safeRec = (rec || '').toLowerCase();

    switch (safeRec) {
        case 'buy_now':
        case 'good_deal':
            config = {
                text: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
                icon: CheckCircle2,
                label: safeRec.replace(/_/g, ' '),
                glow: 'shadow-[0_0_15px_rgba(16,185,129,0.4)] dark:shadow-[0_0_15px_rgba(52,211,153,0.25)]'
            };
            break;
        case 'wait':
            config = {
                text: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
                icon: Clock,
                label: 'Wait to Buy',
                glow: 'shadow-[0_0_15px_rgba(245,158,11,0.4)] dark:shadow-[0_0_15px_rgba(251,191,36,0.25)]'
            };
            break;
        case 'overpriced':
        case 'high_risk':
            config = {
                text: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
                icon: AlertCircle,
                label: safeRec.replace(/_/g, ' '),
                glow: 'shadow-[0_0_15px_rgba(244,63,94,0.4)] dark:shadow-[0_0_15px_rgba(251,113,133,0.25)]'
            };
            break;
        default:
            // Keep default monitor config
            break;
    }

    const Icon = config.icon;

    if (large) {
        return (
            <div className={`inline-flex items-center px-4 py-2.5 rounded-full border border-solid font-bold uppercase tracking-wider text-sm transition-all duration-300 ${config.text} ${config.glow}`}>
                <Icon className="w-5 h-5 mr-2" />
                {config.label}
            </div>
        );
    }

    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border border-solid transition-all duration-300 capitalize tracking-wide ${config.text} ${config.glow}`}>
            <Icon className="w-3 h-3 mr-1" />
            {config.label}
        </span>
    );
};

export default BuyBadge;
