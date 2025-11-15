import { AppDataSource } from "../data-source";
import { TargetDataSource } from "../data-target";
import { Film } from "../entity/source/Film";
import { Actor } from "../entity/source/Actor";
import { Category } from "../entity/source/Category";
import { Customer } from "../entity/source/Customer";
import { Store } from "../entity/source/Store";
import { Rental } from "../entity/source/Rental";
import { Payment } from "../entity/source/Payment";
import { FilmActor } from "../entity/source/FilmActor";
import { FilmCategory } from "../entity/source/FilmCategory";
import { DimFilm } from "../entity/target/DimFilm";
import { DimActor } from "../entity/target/DimActor";
import { DimCategory } from "../entity/target/DimCategory";
import { DimCustomer } from "../entity/target/DimCustomer";
import { DimStore } from "../entity/target/DimStore";
import { FactRental } from "../entity/target/FactRental";
import { FactPayment } from "../entity/target/FactPayment";
import { BridgeFilmActor } from "../entity/target/BridgeFilmActor";
import { BridgeFilmCategory } from "../entity/target/BridgeFilmCategory";
import { Inventory } from "../entity/source/Inventory";
import { Staff } from "../entity/source/Staff";

interface ValidationResult {
    table: string;
    sourceCount: number;
    targetCount: number;
    difference: number;
    percentDiff: number;
    status: 'PASS' | 'WARNING' | 'FAIL';
}

interface AggregateValidation {
    metric: string;
    sourceValue: number;
    targetValue: number;
    difference: number;
    percentDiff: number;
    status: 'PASS' | 'WARNING' | 'FAIL';
}

export async function validateData() {
    console.log("\n Running Data Validation...\n");

    const results: ValidationResult[] = [];
    const aggregateResults: AggregateValidation[] = [];
    let hasErrors = false;
    let hasWarnings = false;

    try {
        //console.log("Validating Record Counts:");
        //console.log("─".repeat(80));

        //Films
        const filmSourceCount = await AppDataSource.getRepository(Film).count();
        const filmTargetCount = await TargetDataSource.getRepository(DimFilm).count();
        results.push(createValidationResult('Films', filmSourceCount, filmTargetCount));

        //Actors
        const actorSourceCount = await AppDataSource.getRepository(Actor).count();
        const actorTargetCount = await TargetDataSource.getRepository(DimActor).count();
        results.push(createValidationResult('Actors', actorSourceCount, actorTargetCount));

        //Categories
        const categorySourceCount = await AppDataSource.getRepository(Category).count();
        const categoryTargetCount = await TargetDataSource.getRepository(DimCategory).count();
        results.push(createValidationResult('Categories', categorySourceCount, categoryTargetCount));

        //Customers
        const customerSourceCount = await AppDataSource.getRepository(Customer).count();
        const customerTargetCount = await TargetDataSource.getRepository(DimCustomer).count();
        results.push(createValidationResult('Customers', customerSourceCount, customerTargetCount));

        //Stores
        const storeSourceCount = await AppDataSource.getRepository(Store).count();
        const storeTargetCount = await TargetDataSource.getRepository(DimStore).count();
        results.push(createValidationResult('Stores', storeSourceCount, storeTargetCount));

        //Rentals
        const rentalSourceCount = await AppDataSource.getRepository(Rental).count();
        const rentalTargetCount = await TargetDataSource.getRepository(FactRental).count();
        results.push(createValidationResult('Rentals', rentalSourceCount, rentalTargetCount));

        //Payments
        const paymentSourceCount = await AppDataSource.getRepository(Payment).count();
        const paymentTargetCount = await TargetDataSource.getRepository(FactPayment).count();
        results.push(createValidationResult('Payments', paymentSourceCount, paymentTargetCount));

        //Film-Actor
        const filmActorSourceCount = await AppDataSource.getRepository(FilmActor).count();
        const filmActorTargetCount = await TargetDataSource.getRepository(BridgeFilmActor).count();
        results.push(createValidationResult('Film-Actor Links', filmActorSourceCount, filmActorTargetCount));

        //Film-Category
        const filmCategorySourceCount = await AppDataSource.getRepository(FilmCategory).count();
        const filmCategoryTargetCount = await TargetDataSource.getRepository(BridgeFilmCategory).count();
        results.push(createValidationResult('Film-Category Links', filmCategorySourceCount, filmCategoryTargetCount));

        //console.log("\nRecord Count Summary:");
        //console.log("─".repeat(80));
        results.forEach(r => {
            const statusIcon = r.status === 'PASS' ? '✅' : r.status === 'WARNING' ? '⚠️' : '❌';
            console.log(`${statusIcon} ${r.table.padEnd(25)} Source: ${String(r.sourceCount).padStart(6)} | Target: ${String(r.targetCount).padStart(6)} | Diff: ${r.difference >= 0 ? '+' : ''}${r.difference} (${r.percentDiff.toFixed(2)}%)`);

            if (r.status === 'FAIL') hasErrors = true;
            if (r.status === 'WARNING') hasWarnings = true;
        });

        //Aggregates
        console.log("\n\n📈 Validating Aggregates:");
        console.log("─".repeat(80));

        //Total payment amount
        const paymentAmountResult = await validatePaymentTotals();
        aggregateResults.push(paymentAmountResult);

        //Rentals per store
        const rentalsPerStoreResults = await validateRentalsPerStore();
        aggregateResults.push(...rentalsPerStoreResults);

        //Payments per store
        const paymentsPerStoreResults = await validatePaymentsPerStore();
        aggregateResults.push(...paymentsPerStoreResults);

        console.log("\nAggregate Validation Summary:");
        console.log("─".repeat(80));
        aggregateResults.forEach(r => {
            if (r.status === 'FAIL') hasErrors = true;
            if (r.status === 'WARNING') hasWarnings = true;
        });

        console.log("\n" + "═".repeat(80));
        if (hasErrors) {
            console.log("VALIDATION FAILED - Critical errors detected!");
            console.log("Please investigate data discrepancies before proceeding.");
            throw new Error("Data validation failed");
        } else if (hasWarnings) {
            console.log("VALIDATION PASSED WITH WARNINGS");
            console.log("Minor discrepancies detected - review recommended.");
        } else {
            console.log("VALIDATION PASSED - All checks successful!");
        }
        console.log("═".repeat(80) + "\n");

    } catch (error) {
        console.error("\n Validation error:", error);
        throw error;
    }
}

function createValidationResult(
    tableName: string,
    sourceCount: number,
    targetCount: number
): ValidationResult {
    const difference = targetCount - sourceCount;
    const percentDiff = sourceCount > 0 ? (difference / sourceCount) * 100 : 0;

    let status: 'PASS' | 'WARNING' | 'FAIL' = 'PASS';

    if (Math.abs(percentDiff) > 5 || targetCount < sourceCount) {
        status = 'FAIL';
    }else if (Math.abs(percentDiff) > 1) {
        status = 'WARNING';
    }

    return {
        table: tableName,
        sourceCount,
        targetCount,
        difference,
        percentDiff,
        status
    };
}

async function validatePaymentTotals(): Promise<AggregateValidation> {
    //Source total
    const sourceResult = await AppDataSource
        .getRepository(Payment)
        .createQueryBuilder("p")
        .select("SUM(p.amount)", "total")
        .getRawOne();
    const sourceTotal = parseFloat(sourceResult?.total || 0);

    //Target total
    const targetResult = await TargetDataSource
        .getRepository(FactPayment)
        .createQueryBuilder("fp")
        .select("SUM(fp.amount)", "total")
        .getRawOne();
    const targetTotal = parseFloat(targetResult?.total || 0);

    const difference = targetTotal - sourceTotal;
    const percentDiff = sourceTotal > 0 ? (difference / sourceTotal) * 100 : 0;

    let status: 'PASS' | 'WARNING' | 'FAIL' = 'PASS';
    if (Math.abs(percentDiff) > 1) {
        status = 'FAIL';
    } else if (Math.abs(percentDiff) > 0.1) {
        status = 'WARNING';
    }

    return {
        metric: 'Total Payment Amount',
        sourceValue: sourceTotal,
        targetValue: targetTotal,
        difference,
        percentDiff,
        status
    };
}

async function validateRentalsPerStore(): Promise<AggregateValidation[]> {
    const results: AggregateValidation[] = [];

    //Get source counts per store
    const sourceResults = await AppDataSource
        .getRepository(Rental)
        .createQueryBuilder("r")
        .innerJoin(Inventory, "i", "r.inventory_id = i.inventory_id")
        .select("i.store_id", "store_id")
        .addSelect("COUNT(*)", "count")
        .groupBy("i.store_id")
        .getRawMany();

    //Get target counts per store
    const targetResults = await TargetDataSource
        .getRepository(FactRental)
        .createQueryBuilder("fr")
        .innerJoin(DimStore, "ds", "fr.store_key = ds.store_key")
        .select("ds.store_id", "store_id")
        .addSelect("COUNT(*)", "count")
        .groupBy("ds.store_id")
        .getRawMany();

    const sourceMap = new Map(sourceResults.map(r => [r.store_id, parseInt(r.count)]));
    const targetMap = new Map(targetResults.map(r => [r.store_id, parseInt(r.count)]));

    //Compare stores
    for (const [storeId, sourceCount] of sourceMap) {
        const targetCount = targetMap.get(storeId) || 0;
        const difference = targetCount - sourceCount;
        const percentDiff = sourceCount > 0 ? (difference / sourceCount) * 100 : 0;

        let status: 'PASS' | 'WARNING' | 'FAIL' = 'PASS';
        if (Math.abs(percentDiff) > 5) {
            status = 'FAIL';
        } else if (Math.abs(percentDiff) > 1) {
            status = 'WARNING';
        }

        results.push({
            metric: `Rentals for Store ${storeId}`,
            sourceValue: sourceCount,
            targetValue: targetCount,
            difference,
            percentDiff,
            status
        });
    }

    return results;
}

async function validatePaymentsPerStore(): Promise<AggregateValidation[]> {
    const results: AggregateValidation[] = [];

    //Get source payment totals per store
    const sourceResults = await AppDataSource
        .getRepository(Payment)
        .createQueryBuilder("p")
        .innerJoin(Staff, "st", "p.staff_id = st.staff_id")
        .select("st.store_id", "store_id")
        .addSelect("SUM(p.amount)", "total")
        .groupBy("st.store_id")
        .getRawMany();

    //Get target payment totals per store
    const targetResults = await TargetDataSource
        .getRepository(FactPayment)
        .createQueryBuilder("fp")
        .innerJoin(DimStore, "ds", "fp.store_key = ds.store_key")
        .select("ds.store_id", "store_id")
        .addSelect("SUM(fp.amount)", "total")
        .groupBy("ds.store_id")
        .getRawMany();

    const sourceMap = new Map(sourceResults.map(r => [r.store_id, parseFloat(r.total)]));
    const targetMap = new Map(targetResults.map(r => [r.store_id, parseFloat(r.total)]));

    //Compare stores
    for (const [storeId, sourceTotal] of sourceMap) {
        const targetTotal = targetMap.get(storeId) || 0;
        const difference = targetTotal - sourceTotal;
        const percentDiff = sourceTotal > 0 ? (difference / sourceTotal) * 100 : 0;

        let status: 'PASS' | 'WARNING' | 'FAIL' = 'PASS';
        if (Math.abs(percentDiff) > 1) {
            status = 'FAIL';
        } else if (Math.abs(percentDiff) > 0.1) {
            status = 'WARNING';
        }

        results.push({
            metric: `Payment Total for Store ${storeId}`,
            sourceValue: sourceTotal,
            targetValue: targetTotal,
            difference,
            percentDiff,
            status
        });
    }

    return results;
}