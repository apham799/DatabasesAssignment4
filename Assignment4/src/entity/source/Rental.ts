import { Entity, PrimaryColumn, Column} from "typeorm";

@Entity({ name: "rental"})
export class Rental {
    @PrimaryColumn({type: "int"})
    rental_id: number;

    @Column({type: "datetime"})
    rental_date: Date;

    @Column({type: "mediumint"})
    inventory_id: number;

    @Column({type: "smallint"})
    customer_id: number;

    @Column({type: "datetime"})
    return_date: Date;

    @Column({type: "tinyint"})
    staff_id: number;

    @Column({type: "timestamp"})
    last_update: Date;
}