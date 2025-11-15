import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn} from "typeorm";
import {Address} from "./Address";

@Entity({ name: "customer"})
export class Customer {
    @PrimaryColumn({ type: "smallint", unsigned: true })
    customer_id: number;

    @Column({ type: "tinyint", unsigned: true })
    store_id: number;

    @Column({ type: "varchar", length: 45 })
    first_name: string;

    @Column({ type: "varchar", length: 45 })
    last_name: string;

    @Column({ type: "varchar", length: 50, nullable: true })
    email: string | null;

    @Column({ type: "smallint", unsigned: true })
    address_id: number;
    @ManyToOne(() => Address)
    @JoinColumn({ name: "address_id" })
    address: Address;

    @Column({ type: "tinyint" })
    active: number;   // tinyint(1) => use number, not boolean

    @Column({ type: "datetime" })
    create_date: Date;

    @Column({ type: "timestamp" })
    last_update: Date;
}