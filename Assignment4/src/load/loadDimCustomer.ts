import { AppDataSource } from "../data-source";
import { TargetDataSource } from "../data-target";
import { Customer } from "../entity/source/Customer";
import { DimCustomer } from "../entity/target/DimCustomer";

export async function loadDimCustomer(lastSyncTime: Date | null = null) {
    const customerRepo = AppDataSource.getRepository(Customer);
    const dimCustomerRepo = TargetDataSource.getRepository(DimCustomer);
    /*const customers = await customerRepo
        .createQueryBuilder("c")
        .leftJoinAndSelect("c.address", "addr")
        .leftJoinAndSelect("addr.city", "city")
        .leftJoinAndSelect("city.country", "country")
        .getMany();*/
    let query = customerRepo
        .createQueryBuilder("c")
        .leftJoinAndSelect("c.address", "addr")
        .leftJoinAndSelect("addr.city", "city")
        .leftJoinAndSelect("city.country", "country");

    if (lastSyncTime) {
        query = query.where("c.last_update > :lastSync", { lastSync: lastSyncTime });
        console.log(`  Fetching customers updated after ${lastSyncTime.toISOString()}`);
    } else {
        console.log(`  Fetching all customers (initial load)`);
    }

    const customers = await query.getMany();

    if (customers.length === 0) {
        console.log(`  No new/updated customers found`);
        return;
    }

    const dimCustomers = customers.map(c => ({
        customer_id: c.customer_id,
        first_name: c.first_name,
        last_name: c.last_name,
        active: c.active ? 1 : 0,
        city: c.address?.city?.city || 'Unknown',
        country: c.address?.city?.country?.country || 'Unknown',
        last_update: c.last_update
    }));
    //if (dimCustomers.length > 0) {
        await dimCustomerRepo.upsert(dimCustomers, ["customer_id"]);
        console.log(`Loaded ${dimCustomers.length} customers`);
    //}
}