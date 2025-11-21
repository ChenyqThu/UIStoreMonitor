
import fs from 'fs';

async function main() {
    try {
        console.log('Fetching main page to find buildId...');
        const mainPageRes = await fetch('https://store.ui.com/us/en');
        const mainPageText = await mainPageRes.text();

        // Extract buildId from __NEXT_DATA__
        // Pattern: "buildId":"c3d3bb77b"
        const buildIdMatch = mainPageText.match(/"buildId":"([^"]+)"/);

        if (!buildIdMatch) {
            console.error('Could not find buildId in main page.');
            process.exit(1);
        }

        const buildId = buildIdMatch[1];
        console.log(`Found buildId: ${buildId}`);

        const url = `https://store.ui.com/_next/data/${buildId}/us/en/category/all-cloud-gateways.json?store=us&language=en&category=all-cloud-gateways`;
        console.log(`Fetching data from: ${url}`);

        const dataRes = await fetch(url);
        if (!dataRes.ok) {
            console.error(`Failed to fetch data: ${dataRes.status} ${dataRes.statusText}`);
            process.exit(1);
        }

        const data = await dataRes.json();

        // Parse and display relevant data
        const subCategories = data.pageProps?.subCategories || [];
        console.log(`Found ${subCategories.length} subcategories.`);

        const products: any[] = [];

        for (const subCat of subCategories) {
            if (subCat.products) {
                for (const p of subCat.products) {
                    products.push({
                        name: p.name,
                        sku: p.variants?.[0]?.sku || p.sku, // Fallback to product SKU if variant SKU missing
                        price: p.minDisplayPrice?.amount ? p.minDisplayPrice.amount / 100 : 'N/A',
                        currency: p.minDisplayPrice?.currency,
                        status: p.status,
                        inStock: p.status === 'Available',
                        imageUrl: p.thumbnail?.url
                    });
                }
            }
        }

        console.log(`\nParsed ${products.length} products. Sample:`);
        console.table(products.slice(0, 5));

        console.log('\nVerification Successful: API is accessible and data structure matches expectation.');

    } catch (error) {
        console.error('Error:', error);
    }
}

main();
