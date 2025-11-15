import { AppDataSource } from "../data-source";
import { TargetDataSource } from "../data-target";
import { Rental } from "../entity/source/Rental";
import { Inventory } from "../entity/source/Inventory";
import { FactRental } from "../entity/target/FactRental";
import { DimFilm } from "../entity/target/DimFilm";
import { DimStore } from "../entity/target/DimStore";
import { DimCustomer } from "../entity/target/DimCustomer";
import { getDateKey, getDaysBetween } from "../utilities/dateUtils";

export async function loadFactRental(lastSyncTime: Date | null = null) {
    const rentalRepo = AppDataSource.getRepository(Rental);
    const inventoryRepo = AppDataSource.getRepository(Inventory);
    const factRentalRepo = TargetDataSource.getRepository(FactRental);
    const dimFilmRepo = TargetDataSource.getRepository(DimFilm);
    const dimStoreRepo = TargetDataSource.getRepository(DimStore);
    const dimCustomerRepo = TargetDataSource.getRepository(DimCustomer);

    //const rentals = await rentalRepo.find();
    let query = rentalRepo.createQueryBuilder("r");

    if (lastSyncTime) {
        query = query.where("r.last_update > :lastSync", { lastSync: lastSyncTime });
        console.log(`  Fetching rentals updated after ${lastSyncTime.toISOString()}`);
    } else {
        console.log(`  Fetching all rentals (initial load)`);
    }
    const rentals = await query.getMany();

    if (rentals.length === 0) {
        console.log(`  No new/updated rentals found`);
        return;
    }

    const inventories = await inventoryRepo.find();
    const inventoryMap = new Map(
        inventories.map(inv => [
            inv.inventory_id,
            { film_id: inv.film_id, store_id: inv.store_id }
        ])
    );
    const films = await dimFilmRepo.find();
    const stores = await dimStoreRepo.find();
    const customers = await dimCustomerRepo.find();
    const filmKeyMap = new Map(films.map(f => [f.film_id, f.film_key]));
    const storeKeyMap = new Map(stores.map(s => [s.store_id, s.store_key]));
    const customerKeyMap = new Map(customers.map(c => [c.customer_id, c.customer_key]));
    const factRentals = rentals
        .map(r => {
            const inventory = inventoryMap.get(r.inventory_id);
            if (!inventory) return null;

            const filmKey = filmKeyMap.get(inventory.film_id);
            const storeKey = storeKeyMap.get(inventory.store_id);
            const customerKey = customerKeyMap.get(r.customer_id);

            if (!filmKey || !storeKey || !customerKey) return null;

            const dateKeyRented = getDateKey(r.rental_date);
            const dateKeyReturned = getDateKey(r.return_date);
            const rentalDuration = getDaysBetween(r.rental_date, r.return_date);

            if (!dateKeyRented) return null;

            return {
                rental_id: r.rental_id,
                date_key_rented: dateKeyRented,
                date_key_returned: dateKeyReturned || 0, // Use 0 for unreturned rentals
                film_key: filmKey,
                store_key: storeKey,
                customer_key: customerKey,
                staff_id: r.staff_id,
                rental_duration_days: rentalDuration
            };
        })
        .filter(record => record !== null);

    if (factRentals.length > 0) {
        await factRentalRepo.upsert(factRentals, ["rental_id"]);
        console.log(`Loaded ${factRentals.length} rental facts`);
    }
}