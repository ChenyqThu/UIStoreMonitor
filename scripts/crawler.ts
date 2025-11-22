import { supabase } from '../services/supabaseClient.ts';

// ============================================
// Configuration
// ============================================
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

const STORE_BASE_URL = 'https://store.ui.com';
const STORE_REGION = 'us';
const STORE_LANGUAGE = 'en';

// ============================================
// Type Definitions (API Response)
// ============================================
interface ApiMoney {
  amount: number;
  currency: string;
}

interface ApiTag {
  name: string;
}

interface ApiOptionValue {
  id: string;
  title: string;
}

interface ApiOption {
  id: string;
  title: string;
  values: ApiOptionValue[];
}

interface ApiVariant {
  id: string;
  sku: string;
  hasUiCare: boolean;
  displayPrice: ApiMoney;
  displayRegularPrice: ApiMoney | null;
  isVisibleInStore: boolean;
}

interface ApiSpecFeature {
  id: string;
  value: string;
  note: string | null;
  feature: {
    id: string;
    icon: string;
    label: string;
    note: string | null;
  };
}

interface ApiSpecSection {
  id: string;
  section: {
    id: string;
    label: string;
    slug: string;
    type: string;
  };
  features: ApiSpecFeature[];
}

interface ApiTechnicalSpec {
  id: string;
  sections: ApiSpecSection[];
}

interface ApiLinkedProduct {
  id: string;
  slug: string;
  name: string;
}

interface ApiProduct {
  id: string;
  slug: string;
  name: string;
  title: string;
  shortDescription: string | null;
  collectionSlug: string | null;
  subcategoryId: string;
  status: string;
  minDisplayPrice: ApiMoney | null;
  minDisplayRegularPrice: ApiMoney | null;
  thumbnail: { url: string } | null;
  tags: ApiTag[];
  variants: ApiVariant[];
  options: ApiOption[];
  technicalSpecification: ApiTechnicalSpec | null;
  linkedProducts: ApiLinkedProduct[];
}

interface ApiSubCategory {
  id: string;
  products: ApiProduct[];
}

// ============================================
// Database Record Types
// ============================================
interface ProductRecord {
  id: string;
  name: string;
  title: string | null;
  short_description: string | null;
  slug: string;
  category_slug: string;
  subcategory_id: string;
  collection_slug: string | null;
  image_url: string | null;
  url: string;
  status: string;
  min_price: number | null;
  max_price: number | null;
  currency: string;
  has_discount: boolean;
  variant_count: number;
  last_updated: string;
}

interface VariantRecord {
  product_id: string;
  variant_id: string;
  sku: string;
  display_name: string | null;
  current_price: number | null;
  regular_price: number | null;
  discount_percent: number | null;
  currency: string;
  in_stock: boolean;
  status: string;
  is_visible: boolean;
  has_ui_care: boolean;
  last_updated: string;
}

interface TagRecord {
  product_id: string;
  tag_name: string;
  tag_type: string;
  tag_value: string;
}

interface OptionRecord {
  product_id: string;
  option_title: string;
  option_values: string[];
}

interface SpecRecord {
  product_id: string;
  spec_section: string;
  spec_label: string;
  spec_value: string | null;
  spec_icon: string | null;
  spec_note: string | null;
}

interface LinkedProductRecord {
  product_id: string;
  linked_product_id: string;
  link_type: string;
}

interface HistoryRecord {
  variant_id: number;
  sku: string;
  price: number | null;
  regular_price: number | null;
  discount_percent: number | null;
  in_stock: boolean;
  status: string;
  recorded_at: string;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Parse a tag name into type and value
 * Examples:
 * - 'feature:10g-sfp-plus' => { type: 'feature', value: '10g-sfp-plus' }
 * - 'black-friday' => { type: 'promo', value: 'black-friday' }
 * - 'pro-sort-weight:5020' => { type: 'sort', value: '5020' }
 */
function parseTag(tagName: string): { type: string; value: string } {
  // Tags with colon separator
  if (tagName.includes(':')) {
    const colonIndex = tagName.indexOf(':');
    const prefix = tagName.substring(0, colonIndex);
    const suffix = tagName.substring(colonIndex + 1);

    // Known prefixed tags
    if (prefix === 'feature') return { type: 'feature', value: suffix };
    if (prefix === 'poe') return { type: 'poe', value: suffix };
    if (prefix.endsWith('-sort-weight') || prefix.includes('sort')) return { type: 'sort', value: suffix };

    return { type: prefix, value: suffix };
  }

  // Known promo tags
  const promoTags = ['black-friday', 'holiday-offer', 'cyber-monday', 'sale', 'new', 'limited'];
  if (promoTags.some(promo => tagName.toLowerCase().includes(promo))) {
    return { type: 'promo', value: tagName };
  }

  // UI-related tags
  const uiTags = ['support-banner', 'banner', 'badge'];
  if (uiTags.some(ui => tagName.toLowerCase().includes(ui))) {
    return { type: 'ui', value: tagName };
  }

  // Default: use as-is
  return { type: 'other', value: tagName };
}

/**
 * Calculate discount percentage
 */
function calculateDiscount(current: number, regular: number): number {
  if (regular <= 0) return 0;
  return Math.round((1 - current / regular) * 100);
}

/**
 * Convert API price (cents) to dollars
 */
function toDollars(amount: number | null | undefined): number | null {
  if (amount === null || amount === undefined) return null;
  return amount / 100;
}

// ============================================
// API Functions
// ============================================

async function getBuildId(): Promise<string> {
  console.log('Fetching main page to find buildId...');
  const mainPageRes = await fetch(`${STORE_BASE_URL}/${STORE_REGION}/${STORE_LANGUAGE}`);
  const mainPageText = await mainPageRes.text();

  const buildIdMatch = mainPageText.match(/"buildId":"([^"]+)"/);
  if (!buildIdMatch) {
    throw new Error('Could not find buildId in main page.');
  }
  return buildIdMatch[1];
}

async function fetchCategoryData(buildId: string, categorySlug: string): Promise<ApiSubCategory[]> {
  const url = `${STORE_BASE_URL}/_next/data/${buildId}/${STORE_REGION}/${STORE_LANGUAGE}/category/${categorySlug}.json?store=${STORE_REGION}&language=${STORE_LANGUAGE}&category=${categorySlug}`;
  console.log(`Fetching data for category: ${categorySlug}`);

  const dataRes = await fetch(url);
  if (!dataRes.ok) {
    console.error(`Failed to fetch data for ${categorySlug}: ${dataRes.status} ${dataRes.statusText}`);
    return [];
  }
  const data = await dataRes.json();
  return data.pageProps?.subCategories || [];
}

// ============================================
// Data Processing Functions
// ============================================

function processProduct(
  product: ApiProduct,
  categorySlug: string,
  now: string
): {
  product: ProductRecord;
  variants: VariantRecord[];
  tags: TagRecord[];
  options: OptionRecord[];
  specs: SpecRecord[];
} {
  // Calculate price range and discount status
  const prices = product.variants
    .map(v => toDollars(v.displayPrice?.amount))
    .filter((p): p is number => p !== null);

  const minPrice = prices.length > 0 ? Math.min(...prices) : null;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : null;
  const hasDiscount = product.variants.some(v => v.displayRegularPrice !== null);

  // Product record
  const productRecord: ProductRecord = {
    id: product.id,
    name: product.name,
    title: product.title || null,
    short_description: product.shortDescription || null,
    slug: product.slug,
    category_slug: categorySlug,
    subcategory_id: product.subcategoryId,
    collection_slug: product.collectionSlug || null,
    image_url: product.thumbnail?.url || null,
    url: `${STORE_BASE_URL}/${STORE_REGION}/${STORE_LANGUAGE}/pro/category/${categorySlug}/products/${product.slug}`,
    status: product.status || 'Unknown',
    min_price: minPrice,
    max_price: maxPrice,
    currency: product.minDisplayPrice?.currency || 'USD',
    has_discount: hasDiscount,
    variant_count: product.variants.length,
    last_updated: now
  };

  // Variant records
  const variants: VariantRecord[] = product.variants.map(variant => {
    const currentPrice = toDollars(variant.displayPrice?.amount);
    const regularPrice = toDollars(variant.displayRegularPrice?.amount);
    const discountPercent = regularPrice && currentPrice
      ? calculateDiscount(currentPrice, regularPrice)
      : null;

    return {
      product_id: product.id,
      variant_id: variant.id,
      sku: variant.sku,
      display_name: null, // Will be derived from options if needed
      current_price: currentPrice,
      regular_price: regularPrice,
      discount_percent: discountPercent,
      currency: variant.displayPrice?.currency || 'USD',
      in_stock: product.status === 'Available',
      status: product.status || 'Unknown',
      is_visible: variant.isVisibleInStore,
      has_ui_care: variant.hasUiCare,
      last_updated: now
    };
  });

  // Tag records
  const tags: TagRecord[] = product.tags.map(tag => {
    const parsed = parseTag(tag.name);
    return {
      product_id: product.id,
      tag_name: tag.name,
      tag_type: parsed.type,
      tag_value: parsed.value
    };
  });

  // Option records
  const options: OptionRecord[] = product.options.map(option => ({
    product_id: product.id,
    option_title: option.title,
    option_values: option.values.map(v => v.title)
  }));

  // Spec records
  const specs: SpecRecord[] = [];
  if (product.technicalSpecification?.sections) {
    for (const section of product.technicalSpecification.sections) {
      for (const feature of section.features) {
        specs.push({
          product_id: product.id,
          spec_section: section.section.label,
          spec_label: feature.feature.label,
          spec_value: feature.value,
          spec_icon: feature.feature.icon,
          spec_note: feature.note || feature.feature.note
        });
      }
    }
  }

  return { product: productRecord, variants, tags, options, specs };
}

// ============================================
// Database Operations
// ============================================

async function upsertProducts(products: ProductRecord[]): Promise<void> {
  if (products.length === 0) return;

  const { error } = await supabase
    .from('products')
    .upsert(products, { onConflict: 'id' });

  if (error) {
    console.error('Error upserting products:', error);
    throw error;
  }
  console.log(`Upserted ${products.length} products`);
}

async function upsertVariants(variants: VariantRecord[]): Promise<Map<string, number>> {
  if (variants.length === 0) return new Map();

  // Upsert variants
  const { error } = await supabase
    .from('product_variants')
    .upsert(variants, { onConflict: 'sku' });

  if (error) {
    console.error('Error upserting variants:', error);
    throw error;
  }
  console.log(`Upserted ${variants.length} variants`);

  // Get variant IDs for history records
  const skus = variants.map(v => v.sku);
  const { data: variantIds, error: selectError } = await supabase
    .from('product_variants')
    .select('id, sku')
    .in('sku', skus);

  if (selectError) {
    console.error('Error fetching variant IDs:', selectError);
    throw selectError;
  }

  const skuToId = new Map<string, number>();
  for (const v of variantIds || []) {
    skuToId.set(v.sku, v.id);
  }

  return skuToId;
}

async function upsertTags(tags: TagRecord[]): Promise<void> {
  if (tags.length === 0) return;

  // Deduplicate tags by (product_id, tag_name)
  const uniqueTagsMap = new Map<string, TagRecord>();
  for (const tag of tags) {
    const key = `${tag.product_id}:${tag.tag_name}`;
    if (!uniqueTagsMap.has(key)) {
      uniqueTagsMap.set(key, tag);
    }
  }
  const uniqueTags = Array.from(uniqueTagsMap.values());

  // Delete existing tags for these products first to handle removed tags
  const productIds = [...new Set(uniqueTags.map(t => t.product_id))];
  const { error: deleteError } = await supabase
    .from('product_tags')
    .delete()
    .in('product_id', productIds);

  if (deleteError) {
    console.error('Error deleting old tags:', deleteError);
    throw deleteError;
  }

  // Insert new tags
  const { error } = await supabase
    .from('product_tags')
    .insert(uniqueTags);

  if (error) {
    console.error('Error inserting tags:', error);
    throw error;
  }
  console.log(`Inserted ${uniqueTags.length} tags (deduplicated from ${tags.length})`);
}

async function upsertOptions(options: OptionRecord[]): Promise<void> {
  if (options.length === 0) return;

  // Deduplicate options by (product_id, option_title)
  const uniqueOptionsMap = new Map<string, OptionRecord>();
  for (const opt of options) {
    const key = `${opt.product_id}:${opt.option_title}`;
    if (!uniqueOptionsMap.has(key)) {
      uniqueOptionsMap.set(key, opt);
    }
  }
  const uniqueOptions = Array.from(uniqueOptionsMap.values());

  // Delete existing options for these products first
  const productIds = [...new Set(uniqueOptions.map(o => o.product_id))];
  const { error: deleteError } = await supabase
    .from('product_options')
    .delete()
    .in('product_id', productIds);

  if (deleteError) {
    console.error('Error deleting old options:', deleteError);
    throw deleteError;
  }

  // Insert new options
  const { error } = await supabase
    .from('product_options')
    .insert(uniqueOptions);

  if (error) {
    console.error('Error inserting options:', error);
    throw error;
  }
  console.log(`Inserted ${uniqueOptions.length} options`);
}

async function upsertSpecs(specs: SpecRecord[]): Promise<void> {
  if (specs.length === 0) return;

  // Deduplicate specs by (product_id, spec_section, spec_label)
  const uniqueSpecsMap = new Map<string, SpecRecord>();
  for (const spec of specs) {
    const key = `${spec.product_id}:${spec.spec_section}:${spec.spec_label}`;
    if (!uniqueSpecsMap.has(key)) {
      uniqueSpecsMap.set(key, spec);
    }
  }
  const uniqueSpecs = Array.from(uniqueSpecsMap.values());

  // Delete existing specs for these products first
  const productIds = [...new Set(uniqueSpecs.map(s => s.product_id))];
  const { error: deleteError } = await supabase
    .from('product_specs')
    .delete()
    .in('product_id', productIds);

  if (deleteError) {
    console.error('Error deleting old specs:', deleteError);
    throw deleteError;
  }

  // Insert new specs
  const { error } = await supabase
    .from('product_specs')
    .insert(uniqueSpecs);

  if (error) {
    console.error('Error inserting specs:', error);
    throw error;
  }
  console.log(`Inserted ${uniqueSpecs.length} specs`);
}

async function upsertLinkedProducts(
  products: ApiProduct[],
  existingProductIds: Set<string>
): Promise<void> {
  const links: LinkedProductRecord[] = [];

  for (const product of products) {
    for (const linked of product.linkedProducts) {
      // Only add if both products exist in our database
      if (existingProductIds.has(linked.id)) {
        links.push({
          product_id: product.id,
          linked_product_id: linked.id,
          link_type: 'related'
        });
      }
    }
  }

  if (links.length === 0) return;

  // Delete existing links for these products first
  const productIds = [...new Set(links.map(l => l.product_id))];
  await supabase
    .from('linked_products')
    .delete()
    .in('product_id', productIds);

  // Insert new links
  const { error } = await supabase
    .from('linked_products')
    .insert(links);

  if (error) {
    console.error('Error inserting linked products:', error);
    throw error;
  }
  console.log(`Inserted ${links.length} linked product relationships`);
}

async function insertHistory(
  variants: VariantRecord[],
  skuToId: Map<string, number>,
  now: string
): Promise<void> {
  const history: HistoryRecord[] = [];

  for (const variant of variants) {
    const variantId = skuToId.get(variant.sku);
    if (!variantId) {
      console.warn(`Could not find variant ID for SKU: ${variant.sku}`);
      continue;
    }

    history.push({
      variant_id: variantId,
      sku: variant.sku,
      price: variant.current_price,
      regular_price: variant.regular_price,
      discount_percent: variant.discount_percent,
      in_stock: variant.in_stock,
      status: variant.status,
      recorded_at: now
    });
  }

  if (history.length === 0) return;

  const { error } = await supabase
    .from('variant_history')
    .insert(history);

  if (error) {
    console.error('Error inserting history:', error);
    throw error;
  }
  console.log(`Inserted ${history.length} history records`);
}

// ============================================
// Main Crawler Function
// ============================================

async function main() {
  try {
    console.log('='.repeat(50));
    console.log('UniFi Store Monitor Crawler v2.0');
    console.log('='.repeat(50));
    console.log(`Started at: ${new Date().toISOString()}`);
    console.log('');

    const buildId = await getBuildId();
    console.log(`Found buildId: ${buildId}`);
    console.log('');

    const now = new Date().toISOString();
    const allProducts: ProductRecord[] = [];
    const allVariants: VariantRecord[] = [];
    const allTags: TagRecord[] = [];
    const allOptions: OptionRecord[] = [];
    const allSpecs: SpecRecord[] = [];
    const rawProducts: ApiProduct[] = [];
    const processedProductIds = new Set<string>();

    // Fetch and process all categories
    for (const categorySlug of CATEGORIES) {
      const subCategories = await fetchCategoryData(buildId, categorySlug);

      for (const subCat of subCategories) {
        if (!subCat.products) continue;

        for (const apiProduct of subCat.products) {
          // Skip if already processed (products can appear in multiple categories)
          if (processedProductIds.has(apiProduct.id)) {
            continue;
          }
          processedProductIds.add(apiProduct.id);

          // Skip products without variants
          if (!apiProduct.variants || apiProduct.variants.length === 0) {
            console.warn(`Skipping product without variants: ${apiProduct.name}`);
            continue;
          }

          const { product, variants, tags, options, specs } = processProduct(
            apiProduct,
            categorySlug,
            now
          );

          allProducts.push(product);
          allVariants.push(...variants);
          allTags.push(...tags);
          allOptions.push(...options);
          allSpecs.push(...specs);
          rawProducts.push(apiProduct);
        }
      }
    }

    console.log('');
    console.log('='.repeat(50));
    console.log('Data Summary:');
    console.log(`  Products: ${allProducts.length}`);
    console.log(`  Variants: ${allVariants.length}`);
    console.log(`  Tags: ${allTags.length}`);
    console.log(`  Options: ${allOptions.length}`);
    console.log(`  Specs: ${allSpecs.length}`);
    console.log('='.repeat(50));
    console.log('');

    if (allProducts.length === 0) {
      console.log('No products found. Exiting.');
      return;
    }

    // Upsert data to database
    console.log('Saving to database...');
    console.log('');

    // 1. Upsert products first
    await upsertProducts(allProducts);

    // 2. Upsert variants and get their IDs
    const skuToId = await upsertVariants(allVariants);

    // 3. Insert history records
    await insertHistory(allVariants, skuToId, now);

    // 4. Upsert tags
    await upsertTags(allTags);

    // 5. Upsert options
    await upsertOptions(allOptions);

    // 6. Upsert specs
    await upsertSpecs(allSpecs);

    // 7. Upsert linked products
    await upsertLinkedProducts(rawProducts, processedProductIds);

    console.log('');
    console.log('='.repeat(50));
    console.log('Crawler completed successfully!');
    console.log(`Finished at: ${new Date().toISOString()}`);
    console.log('='.repeat(50));

  } catch (error) {
    console.error('Crawler failed:', error);
    process.exit(1);
  }
}

main();
