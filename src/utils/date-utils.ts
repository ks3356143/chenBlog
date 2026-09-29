// 统一格式为 YYYY-MM-DD HH:mm，支持站点时区
export function formatDateTimeToYYYYMMDDHHmm(
    dateInput: Date | string,
    type: "date" | "time" = "time",
    // 不传则按访客机区渲染；需要"作者写几点就显示几点"时传站点时区
    timeZone?: string,
): string {
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput

    const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }
    if (timeZone) options.timeZone = timeZone

    const parts = new Intl.DateTimeFormat("en-CA", options).formatToParts(date)
    const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value || ""
    if (type === "time") {
        return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}`
    }
    return `${get("year")}-${get("month")}-${get("day")}`
}
