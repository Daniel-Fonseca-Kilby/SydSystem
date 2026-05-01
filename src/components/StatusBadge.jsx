import { Tag } from 'antd'

export const StatusBadge = ({ status }) => {
    const config = {
        paid: { color: 'success', label: 'Pagada' },
        pending: { color: 'warning', label: 'Pendiente' },
        overdue: { color: 'error', label: 'Vencida' },
        draft: { color: 'default', label: 'Borrador' }
    }
    const { color, label } = config[status] || config.draft
    return <Tag color={color}>{label}</Tag>
}
