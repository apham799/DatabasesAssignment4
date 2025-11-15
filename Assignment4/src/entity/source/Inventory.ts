import { Entity, PrimaryColumn, Column} from "typeorm";

@Entity({ name: "inventory"})
export class Inventory {
    @PrimaryColumn({type: "mediumint"})
    inventory_id: number;

    @Column({type: "smallint"})
    film_id: number;

    @Column({type: "tinyint"})
    store_id: number;

    @Column({type: "timestamp"})
    last_update: Date;
}