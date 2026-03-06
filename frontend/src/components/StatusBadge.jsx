const STATUS_MAP = {
    secure: { label: 'Secure', color: 'var(--green, #34d399)', bg: 'var(--green-dim, rgba(52,211,153,0.12))' },
    waste: { label: 'Waste', color: 'var(--red, #f87171)', bg: 'var(--red-dim, rgba(248,113,113,0.12))' },
    recently_vacated: { label: 'Vacated', color: 'var(--amber, #fbbf24)', bg: 'var(--amber-dim, rgba(251,191,36,0.12))' },
};

export default function StatusBadge({ status }) {
    const s = STATUS_MAP[status] || STATUS_MAP.secure;
    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.2rem 0.5rem',
                borderRadius: '6px',
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: s.color,
                background: s.bg,
                letterSpacing: '0.03em',
            }}
        >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color }} />
            {s.label}
        </span>
    );
}
