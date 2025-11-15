import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn} from "typeorm";
import {Country} from "./Country";

@Entity({ name: "city"})
export class City {
    @PrimaryColumn({ type: "smallint" })
    city_id: string;

    @Column({ type: "varchar", length: 50})
    city: string;

    @Column({ type: "smallint"})
    country_id: number;
    @ManyToOne(() => Country)
    @JoinColumn({ name: "country_id" })
    country: Country

    @Column({ type: "timestamp" })
    last_update: Date;
}