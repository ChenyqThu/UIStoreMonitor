import { supabase } from '../services/supabaseClient.ts';
// import fetch from 'node-fetch'; // Using global fetch

// Node 18+ has global fetch, but for type safety with ts-node we might need to ensure it's recognized.
// If running with recent Node, global fetch is available.

const CATEGORIES = [
    'all-cloud-gateways',
    'all-switching',
    'all-wifi',
    'all-cameras-nvrs',
    'all-door-access',
    'all-integrations',
    'all-advanced-hosting',
    'accessories-cables-dacs'
];

async function getBuildId(): Promise<string> {
    console.log('Fetching main page to find buildId...');
    const mainPageRes = await fetch('https://store.ui.com/us/en');
    const mainPageText = await mainPageRes.text();

    const buildIdMatch = mainPageText.match(/"buildId":"([^"]+)"/);
    if (!buildIdMatch) {
        throw new Error('Could not find buildId in main page.');
    }
    return buildIdMatch[1];
}

async function fetchCategoryData(buildId: string, categorySlug: string) {
    const url = `https://store.ui.com/_next/data/${buildId}/us/en/category/${categorySlug}.json?store=us&language=en&category=${categorySlug}`;
    console.log(`Fetching data for category: ${categorySlug}`);

    const dataRes = await fetch(url);
    if (!dataRes.ok) {
        console.error(`Failed to fetch data for ${categorySlug}: ${dataRes.status} ${dataRes.statusText}`);
        return [];
    }
    const data = await dataRes.json();
    return data.pageProps?.subCategories || [];
}

async function main() {
    try {
        console.log('Starting crawler...');

        const buildId = await getBuildId();
        console.log(`Found buildId: ${buildId}`);

        const productsToUpsert: any[] = [];
        const historyToInsert: any[] = [];
        const now = new Date().toISOString();

        for (const categorySlug of CATEGORIES) {
            const subCategories = await fetchCategoryData(buildId, categorySlug);

            for (const subCat of subCategories) {
                if (subCat.products) {
                    for (const p of subCat.products) {
                        const sku = p.variants?.[0]?.sku || p.sku;
                        // Skip if no SKU (some items might be weird)
                        if (!sku) continue;

                        const price = p.minDisplayPrice?.amount ? p.minDisplayPrice.amount / 100 : null;
                        const currency = p.minDisplayPrice?.currency;
                        const inStock = p.status === 'Available';
                        const imageUrl = p.thumbnail?.url;

                        // Product Record
                        productsToUpsert.push({
                            id: sku, // Using SKU as ID
                            name: p.name,
                            sku: sku,
                            category: categorySlug, // Main category
                            subcategory: subCat.id, // Subcategory from the API
                            current_price: price,
                            currency: currency,
                            in_stock: inStock,
                            image_url: imageUrl,
                            url: `https://store.ui.com/us/en/pro/category/${categorySlug}/products/${p.slug}`,
                            last_updated: now
                        });

                        // History Record
                        historyToInsert.push({
                            product_id: sku,
                            price: price,
                            in_stock: inStock,
                            recorded_at: now
                        });
                    }
                }
            }
        }

        console.log(`Parsed total ${productsToUpsert.length} products across all categories.`);

        if (productsToUpsert.length === 0) {
            console.log('No products found. Exiting.');
            return;
        }

        // Deduplicate products by ID (SKU)
        // Some products might appear in multiple categories or variants
        const uniqueProducts = Array.from(new Map(productsToUpsert.map(item => [item.id, item])).values());
        console.log(`Deduplicated to ${uniqueProducts.length} unique products.`);

        // 4. Update Supabase
        // Upsert Products (Batching might be needed if too large, but for <1000 items it's usually fine)
        const { error: productsError } = await supabase
            .from('products')
            .upsert(uniqueProducts, { onConflict: 'id' });

        if (productsError) {
            console.error('Error upserting products:', productsError);
        } else {
            console.log('Successfully upserted products.');
        }

        // Insert History
        const { error: historyError } = await supabase
            .from('product_history')
            .insert(historyToInsert);

        if (historyError) {
            console.error('Error inserting history:', historyError);
        } else {
            console.log('Successfully inserted history.');
        }

    } catch (error) {
        console.error('Crawler failed:', error);
        process.exit(1);
    }
}

main();
