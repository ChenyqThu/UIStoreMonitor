# UniFi Store Monitor 数据库重构方案

> 创建时间: 2025-11-21
> 状态: 已审阅

---

## 一、当前问题分析

### 1.1 现有数据库结构

```sql
-- 当前 products 表
CREATE TABLE products (
  id TEXT PRIMARY KEY,        -- 使用 SKU 作为主键 ❌
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  category TEXT,
  subcategory TEXT,
  current_price NUMERIC,
  currency TEXT,
  in_stock BOOLEAN,
  image_url TEXT,
  url TEXT,
  last_updated TIMESTAMP
);

-- 当前 product_history 表
CREATE TABLE product_history (
  id BIGINT PRIMARY KEY,
  product_id TEXT REFERENCES products(id),
  price NUMERIC,
  in_stock BOOLEAN,
  recorded_at TIMESTAMP
);
```

### 1.2 核心问题

| 问题 | 说明 | 影响 |
|------|------|------|
| **SKU 作为主键** | 一个产品有多个变体（不同颜色/长度），每个变体有不同 SKU | Cable 产品 24 个变体只能存 1 个 |
| **折扣信息丢失** | 未存储 `displayRegularPrice`（原价） | 无法分析打折情况 |
| **变体数据丢失** | 只取 `variants[0]`，忽略其他变体 | 大量价格数据丢失 |
| **有价值字段未采集** | title、description、tags 等均未存储 | 无法展示完整产品信息 |
| **历史追踪粒度不足** | 只追踪产品级别，而非变体级别 | 无法追踪每个 SKU 的价格变化 |

### 1.3 接口数据结构示例

一个 Cable 产品的真实数据：

```json
{
  "id": "4436004e-b03e-41e8-bc14-50d82fcdfe0c",  // 产品 UUID
  "name": "U-Cable-Patch-RJ45",
  "title": "UniFi Patch Cable",
  "options": [
    { "title": "Color", "values": ["White", "Blue", "Black"] },
    { "title": "Length", "values": ["0.1m", "0.3m", "1m", "2m", "3m", "5m", "8m", "50-pack"] }
  ],
  "variants": [
    { "sku": "U-Cable-Patch-RJ45", "displayPrice": {"amount": 200} },
    { "sku": "U-Cable-Patch-1M-RJ45", "displayPrice": {"amount": 260} },
    { "sku": "U-Cable-Patch-RJ45-BL", "displayPrice": {"amount": 200} },
    // ... 共 24 个变体
  ]
}
```

折扣产品示例：

```json
{
  "name": "UCG-Max",
  "minDisplayPrice": { "amount": 17900 },      // 折扣价 $179
  "minDisplayRegularPrice": { "amount": 27900 }, // 原价 $279
  "variants": [{
    "sku": "UCG-Max",
    "displayPrice": { "amount": 17900 },
    "displayRegularPrice": { "amount": 27900 }  // 变体级别的原价
  }],
  "tags": [{ "name": "black-friday" }]  // 促销标签
}
```

---

## 二、新数据库设计

### 2.1 ER 关系图

```
┌─────────────────┐       ┌─────────────────────┐
│    categories   │       │      products       │
├─────────────────┤       ├─────────────────────┤
│ id (PK)         │──┐    │ id (UUID, PK)       │
│ slug            │  │    │ name                │
│ name            │  └───→│ category_slug (FK)  │
│ parent_slug     │       │ subcategory_id      │
└─────────────────┘       │ title               │
                          │ short_description   │
                          │ ...                 │
                          └──────────┬──────────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              │                      │                      │
              ▼                      ▼                      ▼
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────┐
│  product_variants   │  │    product_tags     │  │ product_options │
├─────────────────────┤  ├─────────────────────┤  ├─────────────────┤
│ id (PK)             │  │ id (PK)             │  │ id (PK)         │
│ product_id (FK)     │  │ product_id (FK)     │  │ product_id (FK) │
│ sku (UNIQUE)        │  │ tag_name            │  │ option_title    │
│ current_price       │  │ tag_type            │  │ option_values   │
│ regular_price       │  │ tag_value           │  └─────────────────┘
│ discount_percent    │  └─────────────────────┘
│ in_stock            │
│ ...                 │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   variant_history   │
├─────────────────────┤
│ id (PK)             │
│ variant_id (FK)     │
│ sku                 │
│ price               │
│ regular_price       │
│ discount_percent    │
│ in_stock            │
│ recorded_at         │
└─────────────────────┘
```

### 2.2 表结构详细设计

#### 2.2.1 `categories` - 类别表

```sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,           -- 'all-cloud-gateways'
  name TEXT NOT NULL,                  -- 'Cloud Gateways'
  parent_slug TEXT,                    -- 用于子类别关联
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2.2.2 `products` - 产品主表

```sql
CREATE TABLE products (
  -- 主键使用 API 返回的 UUID
  id UUID PRIMARY KEY,

  -- 基本信息
  name TEXT NOT NULL,                  -- 'UCG-Max'
  title TEXT,                          -- 'Cloud Gateway Max'
  short_description TEXT,              -- 产品描述
  slug TEXT,                           -- URL 标识

  -- 分类
  category_slug TEXT,                  -- 'all-cloud-gateways'
  subcategory_id TEXT,                 -- 'cloud-gateways-compact'
  collection_slug TEXT,                -- 'cloud-gateway-compact'

  -- 展示信息
  image_url TEXT,
  url TEXT,                            -- 产品页面完整 URL

  -- 状态
  status TEXT DEFAULT 'Unknown',       -- 'Available', 'Sold Out'

  -- 价格汇总 (便于列表展示和筛选)
  min_price NUMERIC,                   -- 最低变体价格
  max_price NUMERIC,                   -- 最高变体价格
  currency TEXT DEFAULT 'USD',
  has_discount BOOLEAN DEFAULT FALSE,  -- 是否有任何变体在打折

  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_products_category ON products(category_slug);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_has_discount ON products(has_discount);
```

#### 2.2.3 `product_variants` - 产品变体表 (核心)

```sql
CREATE TABLE product_variants (
  id SERIAL PRIMARY KEY,

  -- 关联
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID,                     -- API 返回的变体 ID

  -- SKU 信息
  sku TEXT UNIQUE NOT NULL,            -- 'U-Cable-Patch-1M-RJ45'
  display_name TEXT,                   -- '1m White' (可从 options 推导)

  -- 价格信息
  current_price NUMERIC,               -- 当前价格 (已转为元)
  regular_price NUMERIC,               -- 原价 (无折扣时为 NULL)
  discount_percent NUMERIC,            -- 折扣百分比
  currency TEXT DEFAULT 'USD',

  -- 库存状态
  in_stock BOOLEAN DEFAULT FALSE,
  status TEXT,                         -- 变体状态
  is_visible BOOLEAN DEFAULT TRUE,     -- 是否在商店显示

  -- 其他
  has_ui_care BOOLEAN DEFAULT FALSE,

  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_variants_sku ON product_variants(sku);
CREATE INDEX idx_variants_in_stock ON product_variants(in_stock);
CREATE INDEX idx_variants_discount ON product_variants(discount_percent) WHERE discount_percent IS NOT NULL;
```

#### 2.2.4 `product_tags` - 产品标签表

```sql
CREATE TABLE product_tags (
  id SERIAL PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,

  tag_name TEXT NOT NULL,              -- 完整标签: 'feature:10g-sfp-plus'
  tag_type TEXT,                       -- 解析后类型: 'feature'
  tag_value TEXT,                      -- 解析后值: '10g-sfp-plus'

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(product_id, tag_name)
);

-- 索引
CREATE INDEX idx_tags_product_id ON product_tags(product_id);
CREATE INDEX idx_tags_type ON product_tags(tag_type);
CREATE INDEX idx_tags_value ON product_tags(tag_value);
```

**标签类型解析规则**：

| 原始标签 | tag_type | tag_value |
|----------|----------|-----------|
| `feature:10g-sfp-plus` | `feature` | `10g-sfp-plus` |
| `poe:180w` | `poe` | `180w` |
| `black-friday` | `promo` | `black-friday` |
| `holiday-offer` | `promo` | `holiday-offer` |
| `pro-sort-weight:5020` | `sort` | `5020` |
| `support-banner` | `ui` | `support-banner` |

#### 2.2.5 `product_options` - 产品选项表

```sql
CREATE TABLE product_options (
  id SERIAL PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,

  option_title TEXT NOT NULL,          -- 'Color', 'Length', 'Pack Type'
  option_values JSONB NOT NULL,        -- '["White", "Blue", "Black"]'

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(product_id, option_title)
);

CREATE INDEX idx_options_product_id ON product_options(product_id);
```

#### 2.2.6 `variant_history` - 变体历史表

```sql
CREATE TABLE variant_history (
  id BIGSERIAL PRIMARY KEY,

  -- 关联 (使用 variant 表的 id)
  variant_id INTEGER NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  sku TEXT NOT NULL,                   -- 冗余存储，便于查询

  -- 快照数据
  price NUMERIC,
  regular_price NUMERIC,
  discount_percent NUMERIC,
  in_stock BOOLEAN,
  status TEXT,

  -- 时间戳
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_history_variant_id ON variant_history(variant_id);
CREATE INDEX idx_history_sku ON variant_history(sku);
CREATE INDEX idx_history_recorded_at ON variant_history(recorded_at);

-- 复合索引 (查询某 SKU 的历史记录)
CREATE INDEX idx_history_sku_time ON variant_history(sku, recorded_at DESC);
```

### 2.3 RLS 策略

```sql
-- 启用 RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE variant_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 公开读取策略
CREATE POLICY "Public read access" ON products FOR SELECT USING (true);
CREATE POLICY "Public read access" ON product_variants FOR SELECT USING (true);
CREATE POLICY "Public read access" ON product_tags FOR SELECT USING (true);
CREATE POLICY "Public read access" ON product_options FOR SELECT USING (true);
CREATE POLICY "Public read access" ON variant_history FOR SELECT USING (true);
CREATE POLICY "Public read access" ON categories FOR SELECT USING (true);

-- 写入策略 (用于爬虫)
CREATE POLICY "Service write access" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service write access" ON product_variants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service write access" ON product_tags FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service write access" ON product_options FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service write access" ON variant_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service write access" ON categories FOR ALL USING (true) WITH CHECK (true);
```

---

## 三、Dashboard 查询示例

### 3.1 获取所有打折产品

```sql
SELECT
  p.name,
  p.title,
  pv.sku,
  pv.current_price,
  pv.regular_price,
  pv.discount_percent,
  pv.in_stock
FROM products p
JOIN product_variants pv ON p.id = pv.product_id
WHERE pv.regular_price IS NOT NULL
ORDER BY pv.discount_percent DESC;
```

### 3.2 获取 Black Friday 促销产品

```sql
SELECT DISTINCT p.*,
  (SELECT MIN(pv.current_price) FROM product_variants pv WHERE pv.product_id = p.id) as min_price,
  (SELECT MAX(pv.discount_percent) FROM product_variants pv WHERE pv.product_id = p.id) as max_discount
FROM products p
JOIN product_tags pt ON p.id = pt.product_id
WHERE pt.tag_value = 'black-friday'
ORDER BY max_discount DESC NULLS LAST;
```

### 3.3 追踪某 SKU 的价格历史

```sql
SELECT
  vh.price,
  vh.regular_price,
  vh.discount_percent,
  vh.in_stock,
  vh.recorded_at
FROM variant_history vh
WHERE vh.sku = 'UCG-Max'
ORDER BY vh.recorded_at DESC
LIMIT 30;
```

### 3.4 获取某产品的所有变体 (Cable 产品展示)

```sql
SELECT
  pv.sku,
  pv.display_name,
  pv.current_price,
  pv.regular_price,
  pv.discount_percent,
  pv.in_stock
FROM product_variants pv
WHERE pv.product_id = '4436004e-b03e-41e8-bc14-50d82fcdfe0c'
ORDER BY pv.current_price;
```

### 3.5 获取库存变化的产品 (对比最近两次采集)

```sql
WITH latest_two AS (
  SELECT
    sku,
    in_stock,
    recorded_at,
    ROW_NUMBER() OVER (PARTITION BY sku ORDER BY recorded_at DESC) as rn
  FROM variant_history
)
SELECT
  l1.sku,
  l2.in_stock as previous_stock,
  l1.in_stock as current_stock,
  l1.recorded_at
FROM latest_two l1
JOIN latest_two l2 ON l1.sku = l2.sku AND l2.rn = 2
WHERE l1.rn = 1 AND l1.in_stock != l2.in_stock;
```

### 3.6 按类别统计产品和折扣情况

```sql
SELECT
  p.category_slug,
  COUNT(DISTINCT p.id) as product_count,
  COUNT(pv.id) as variant_count,
  COUNT(pv.id) FILTER (WHERE pv.in_stock = true) as in_stock_count,
  COUNT(pv.id) FILTER (WHERE pv.regular_price IS NOT NULL) as on_sale_count,
  ROUND(AVG(pv.discount_percent) FILTER (WHERE pv.discount_percent > 0), 1) as avg_discount
FROM products p
LEFT JOIN product_variants pv ON p.id = pv.product_id
GROUP BY p.category_slug
ORDER BY product_count DESC;
```

---

## 四、数据迁移策略

### 4.1 迁移映射

| 旧表字段 | 新表字段 | 说明 |
|----------|----------|------|
| `products.id` (SKU) | `product_variants.sku` | SKU 移到变体表 |
| `products.name` | `products.name` | 保持 |
| `products.current_price` | `product_variants.current_price` | 移到变体表 |
| `products.in_stock` | `product_variants.in_stock` | 移到变体表 |
| `product_history.*` | `variant_history.*` | 历史改为变体级别 |

### 4.2 迁移步骤

1. **创建新表** - 执行上述 SQL
2. **运行新爬虫** - 全量采集所有数据到新表
3. **验证数据** - 确保数据完整性
4. **更新前端** - 切换 API 查询到新表
5. **删除旧表** - 确认无问题后删除

### 4.3 历史数据处理

由于旧数据结构不完整（缺少变体信息），建议：
- 保留旧的 `product_history` 表作为归档
- 新系统从当前时间开始记录完整数据
- 不尝试迁移历史数据到新结构

---

## 五、爬虫修改要点

### 5.1 主要变更

1. **使用产品 UUID 作为主键**，而非 SKU
2. **遍历所有变体**，为每个变体创建记录
3. **采集折扣信息** (`displayRegularPrice`)
4. **采集标签信息** (`tags` 数组)
5. **采集选项信息** (`options` 数组)
6. **历史记录改为变体级别**

### 5.2 数据处理逻辑

```typescript
// 伪代码
for (const product of products) {
  // 1. 插入/更新产品
  upsertProduct({
    id: product.id,  // UUID
    name: product.name,
    title: product.title,
    // ...
  });

  // 2. 处理每个变体
  for (const variant of product.variants) {
    const discountPercent = variant.displayRegularPrice
      ? (1 - variant.displayPrice.amount / variant.displayRegularPrice.amount) * 100
      : null;

    upsertVariant({
      product_id: product.id,
      sku: variant.sku,
      current_price: variant.displayPrice.amount / 100,
      regular_price: variant.displayRegularPrice?.amount / 100,
      discount_percent: discountPercent,
      // ...
    });

    // 3. 记录历史
    insertHistory({
      sku: variant.sku,
      price: variant.displayPrice.amount / 100,
      // ...
    });
  }

  // 4. 处理标签
  for (const tag of product.tags) {
    const { type, value } = parseTag(tag.name);
    upsertTag({
      product_id: product.id,
      tag_name: tag.name,
      tag_type: type,
      tag_value: value,
    });
  }

  // 5. 处理选项
  for (const option of product.options) {
    upsertOption({
      product_id: product.id,
      option_title: option.title,
      option_values: option.values.map(v => v.title),
    });
  }
}
```

---

## 六、预期收益

| 方面 | 改进 |
|------|------|
| **数据完整性** | 从只存 1 个 SKU 到存储所有变体 (如 Cable 的 24 个) |
| **折扣追踪** | 可以追踪原价、折扣价、折扣百分比 |
| **促销分析** | 可以按标签筛选 Black Friday 等促销产品 |
| **价格历史** | 每个 SKU 独立追踪价格变化 |
| **前端展示** | 可以展示完整产品信息、变体选择器 |
| **查询灵活性** | 支持按类别、折扣、库存等多维度查询 |

---

## 七、待确认事项

- [ ] 是否需要存储 `technicalSpecification` 技术规格？ 可以存储。
- [ ] 是否需要存储 `linkedProducts` 关联产品？ 可以存储。
- [ ] 是否需要存储 `bundleDiscounts` 捆绑折扣？ 可以存储。
- [ ] 历史数据保留策略（保留多久？是否需要聚合？）  暂时不用，脚本一直跑。
- [ ] 是否需要添加其他索引优化查询？  看前端优化方案的展示情况决定。

---

**请审阅后告知是否需要调整，确认后我将开始实施。**
