import { Entity, PrimaryColumn, Column} from "typeorm";

@Entity({ name: "category"})
export class Category {
    @PrimaryColumn({type: "tinyint"})
    category_id: number;

    @Column({type: "varchar", length: 25})
    name: string;

    @Column({type: "timestamp"})
    last_update: Date;
}