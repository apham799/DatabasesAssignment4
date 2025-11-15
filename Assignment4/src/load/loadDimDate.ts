import { TargetDataSource } from "../data-target";
import { DimDate } from "../entity/target/DimDate";

export async function loadDimDate() {
    const dimDateRepo = TargetDataSource.getRepository(DimDate);
    const startDate = new Date('2005-01-01');
    const endDate = new Date('2025-12-31');
    const dates: any[] = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const currentDate = new Date(d);
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const day = currentDate.getDate();
        const dayOfWeek = currentDate.getDay(); // 0=Sunday, 6=Saturday

        dates.push({
            date_key: parseInt(`${year}${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}`),
            date: currentDate,
            year: year,
            quarter: Math.ceil(month / 3),
            month: month,
            day_of_month: day,
            day_of_week: dayOfWeek,
            is_weekend: (dayOfWeek === 0 || dayOfWeek === 6) ? 1 : 0
        });
    }
    if (dates.length > 0) {
        await dimDateRepo.upsert(dates, ["date_key"]);
        console.log(`Loaded ${dates.length} dates`);
    }
}