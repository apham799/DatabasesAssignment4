import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn} from "typeorm";
import {Address} from "./Address";

@Entity({ name: "store"})
export class Store {
    @PrimaryColumn({type: "tinyint"})
    store_id: number;

    @Column({type: "tinyint"})
    manager_staff_id: number;

    @Column({type: "smallint"})
    address_id: number;
    @ManyToOne(() => Address)
    @JoinColumn({ name: "address_id" })
    address: Address;

    @Column({type: "timestamp"})
    last_update: Date;
}