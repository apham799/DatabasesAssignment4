import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity({ name: "dim_category" })
export class DimCategory {
    @PrimaryGeneratedColumn()
    category_key: number;

    @Column({unique: true})
    category_id: number;

    @Column({ type: "text" })
    name: string;

    @Column({ type: "date" })
    last_update: Date;
}