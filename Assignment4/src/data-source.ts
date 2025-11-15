import "reflect-metadata"
import { DataSource } from "typeorm"
//import { User } from "./entity/User"
import { Film } from "./entity/source/Film";
import { Language } from "./entity/source/Language";
import { Actor } from "./entity/source/Actor";
import { Category } from "./entity/source/Category";
import { FilmActor } from "./entity/source/FilmActor";
import { FilmCategory } from "./entity/source/FilmCategory";
import { Inventory } from "./entity/source/Inventory";
import { Rental } from "./entity/source/Rental";
import { Payment } from "./entity/source/Payment";
import { Store } from "./entity/source/Store";
import { Staff } from "./entity/source/Staff";
import { Customer } from "./entity/source/Customer";
import { Address } from "./entity/source/Address";
import { City } from "./entity/source/City";
import { Country } from "./entity/source/Country";


export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "apham799",
    password: "Ap(43#26!23$",
    database: "sakila",
    synchronize: false,
    logging: false,
    entities: [
        Film,
        Language,
        Actor,
        Category,
        FilmActor,
        FilmCategory,
        Inventory,
        Rental,
        Payment,
        Store,
        Staff,
        Customer,
        Address,
        City,
        Country],
    migrations: [],
    subscribers: [],
})
