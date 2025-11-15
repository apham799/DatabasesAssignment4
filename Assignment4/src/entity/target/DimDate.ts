import { Entity, PrimaryColumn, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "dim_date" })
export class DimDate {
    @PrimaryGeneratedColumn()
    date_key: number;

    @Column({ type: "text" })
    date: string;

    @Column({ type: "integer" })
    year: number;

    @Column({ type: "integer" })
    quarter: number;

    @Column({ type: "integer" })
    month: number;

    @Column({ type: "integer" })
    day_of_month: number;

    @Column({ type: "integer" })
    is_weekend: number;
}

