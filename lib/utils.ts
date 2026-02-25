import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Generate a URL-friendly slug from tournament name
 */
export function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
        + '-' + Math.random().toString(36).substring(2, 7)
}

/**
 * Format currency in INR
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}

/**
 * Format date to a readable string
 */
export function formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    })
}

/**
 * Check if a tournament's registration is still open
 */
export function isRegistrationOpen(lastDate: string, isActive: boolean): boolean {
    if (!isActive) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const last = new Date(lastDate)
    last.setHours(23, 59, 59, 999)
    return last >= today
}

/**
 * Convert data array to CSV string
 */
export function toCSV(data: Record<string, unknown>[]): string {
    if (!data.length) return ''
    const headers = Object.keys(data[0])
    const rows = data.map(row =>
        headers.map(h => {
            const val = row[h]
            if (val === null || val === undefined) return ''
            const str = String(val)
            return str.includes(',') || str.includes('"') || str.includes('\n')
                ? `"${str.replace(/"/g, '""')}"`
                : str
        }).join(',')
    )
    return [headers.join(','), ...rows].join('\n')
}

/**
 * Download a CSV string as a file
 */
export function downloadCSV(csv: string, filename: string) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
}
