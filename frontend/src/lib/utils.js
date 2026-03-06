/** Merge class names (simple clsx alternative). */
export function cn(...classes) {
    return classes.filter(Boolean).join(' ');
}
