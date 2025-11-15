import { Entity, PrimaryColumn, Column} from "typeorm";

@Entity({ name: "payment"})
export class Payment {
    @PrimaryColumn({type: "smallint"})
    payment_id: number;

    @Column({type: "smallint"})
    customer_id: number;

    @Column({type: "tinyint"})
    staff_id: number;

    @Column({type: "int"})
    rental_id: number

    @Column({type: "decimal", precision: 5, scale: 2})
    amount: number;

    @Column({type: "datetime"})
    payment_date: Date;

    @Column({type: "timestamp"})
    last_update: Date;
}