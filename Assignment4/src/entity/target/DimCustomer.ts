import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity({ name: "dim_customer" })
export class DimCustomer {
    @PrimaryGeneratedColumn()
    customer_key: number;

    @Column({unique: true})
    customer_id: number;

    @Column({ type: "text" })
    first_name: string;

    @Column({ type: "text" })
    last_name: string;

    @Column({ type: "integer" })
    active: number;

    @Column({ type: "text" })
    city: string;

    @Column({ type: "text" })
    country: string;

    @Column({ type: "date" })
    last_update: Date;
}