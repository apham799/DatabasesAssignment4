import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn} from "typeorm";
import {City} from "./City";

@Entity({ name: "address"})
export class Address {
    @PrimaryColumn({ type: "smallint", unsigned: true })
    address_id: number;

    @Column({ type: "varchar", length: 50 })
    address: string;

    @Column({ type: "varchar", length: 50, nullable: true })
    address2: string | null;

    @Column({ type: "varchar", length: 20 })
    district: string;

    @Column({ type: "smallint", unsigned: true })
    city_id: number;
    @ManyToOne(() => City)
    @JoinColumn({ name: "city_id" })
    city: City;

    @Column({ type: "varchar", length: 10, nullable: true })
    postal_code: string | null;

    @Column({ type: "varchar", length: 20 })
    phone: string;

    @Column({ type: "timestamp" })
    last_update: Date;
}