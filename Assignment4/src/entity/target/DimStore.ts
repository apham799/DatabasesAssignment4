import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity({ name: "dim_store" })
export class DimStore{
    @PrimaryGeneratedColumn()
    store_key: number;

    @Column({unique: true})
    store_id: number;

    @Column({ type: "text" })
    city: string;

    @Column({ type: "text" })
    country: string;

    @Column({ type: "date" })
    last_update: Date;
}