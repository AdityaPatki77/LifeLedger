

export function getCategoryStyle(category: string): string {
    const map: Record<string, string> = {
        Career: 'category-career',
        Relationships: 'category-relationships',
        Health: 'category-health',
        Finance: 'category-finance',
        Education: 'category-education',
        Personal: 'category-personal',
    }
    return map[category] || 'badge-muted'
}

export function getReflectionDueDates(createdAt: string) {
    const created = new Date(createdAt)
    return {
        '1month': new Date(created.getTime() + 30 * 24 * 60 * 60 * 1000),
        '3month': new Date(created.getTime() + 90 * 24 * 60 * 60 * 1000),
        '6month': new Date(created.getTime() + 180 * 24 * 60 * 60 * 1000),
        '1year': new Date(created.getTime() + 365 * 24 * 60 * 60 * 1000),
    }
}

export function formatReflectionLabel(type: string): string {
    const map: Record<string, string> = {
        '1month': '1 Month',
        '3month': '3 Months',
        '6month': '6 Months',
        '1year': '1 Year',
    }
    return map[type] || type
}
