# POS Awesome Configuration Guide

## Initial Setup

### 1. Prerequisites
Before configuring POS Awesome, ensure:
- ERPNext Version 15 is installed
- POS Awesome app is installed and migrated
- User has appropriate permissions (Sales User, POS User)
- Company and warehouse are configured
- Items and item groups are created
- Customer groups are defined
- Tax templates are configured

### 2. POS Profile Configuration

Navigate to **POS Profile** in ERPNext and create or edit a profile.

#### Basic Settings
```javascript
{
  "pos_profile_name": "Main POS",
  "company": "Your Company",
  "warehouse": "Main Store",
  "currency": "USD",
  "selling_price_list": "Standard Selling",
  "write_off_account": "Write Off - Company",
  "write_off_cost_center": "Main - Company"
}
```

#### POS Awesome Settings Section

##### Display Configuration
- **`posa_display_items_in_stock`**: Show only items with available stock
- **`posa_show_item_image`**: Display product images in card view
- **`posa_hide_unavailable_items`**: Hide out-of-stock items completely
- **`posa_auto_set_batch`**: Automatically select batch for items
- **`posa_search_serial_no`**: Enable serial number search
- **`posa_search_batch_no`**: Enable batch number search

##### Operational Settings
- **`posa_allow_delete`**: Allow deletion of cart items
- **`posa_allow_return`**: Enable return functionality
- **`posa_allow_price_change`**: Allow manual price editing
- **`posa_allow_discount_change`**: Allow discount modifications
- **`posa_max_discount_allowed`**: Maximum discount percentage (0-100)
- **`posa_allow_credit_sale`**: Enable credit sales

##### Performance Settings
- **`posa_use_server_cache`**: Enable Redis caching for items
- **`posa_local_storage`**: Enable browser localStorage caching
- **`posa_cache_duration`**: Cache duration in seconds (default: 300)

##### Advanced Settings
- **`posa_hide_expected_amount`**: Hide expected amount in closing
- **`posa_hide_closing_shift`**: Skip closing shift dialog
- **`posa_allow_sales_order`**: Enable sales order creation
- **`posa_fetch_coupon`**: Auto-fetch applicable coupons
- **`posa_allow_partial_payment`**: Allow incomplete payments

### 3. Payment Methods Setup

Configure payment methods in the POS Profile:

```javascript
// Payment Methods Table
[
  {
    "mode_of_payment": "Cash",
    "default": 1,
    "allow_in_returns": 1
  },
  {
    "mode_of_payment": "Credit Card",
    "default": 0,
    "allow_in_returns": 1
  },
  {
    "mode_of_payment": "Bank Transfer",
    "default": 0,
    "allow_in_returns": 0
  }
]
```

### 4. Item Groups Configuration

Set up item groups for categorization:

1. Go to **Item Group**
2. Create hierarchical structure:
```
All Item Groups
├── Food & Beverages
│   ├── Beverages
│   └── Snacks
├── Electronics
│   ├── Mobile Phones
│   └── Accessories
└── Clothing
    ├── Men's Wear
    └── Women's Wear
```

3. Assign items to appropriate groups

### 5. Tax Configuration

#### Tax Templates
Create tax templates for automatic tax calculation:

```javascript
{
  "title": "GST 18%",
  "taxes": [
    {
      "charge_type": "On Net Total",
      "account_head": "GST - Company",
      "rate": 18,
      "description": "GST @ 18%"
    }
  ]
}
```

#### Inclusive/Exclusive Pricing
Configure in POS Profile:
- **`tc_name`**: Default terms and conditions
- **`tax_category`**: Default tax category
- **`taxes_and_charges`**: Default tax template

## Feature-Specific Configuration

### 1. Loyalty Program Setup

#### Create Loyalty Program
1. Go to **Loyalty Program**
2. Configure program details:
```javascript
{
  "loyalty_program_name": "Customer Rewards",
  "from_date": "2024-01-01",
  "loyalty_program_type": "Single Tier",
  "conversion_factor": 10, // 10 points per $1
  "redemption_conversion_factor": 0.1 // $0.1 per point
}
```

#### Collection Rules
```javascript
{
  "collection_rules": [
    {
      "tier_name": "Base",
      "min_spent": 0,
      "collection_factor": 10
    }
  ]
}
```

### 2. POS Offers Configuration

#### Create POS Offer
Navigate to **POS Offer** and create:

```javascript
{
  "offer_name": "Buy 2 Get 1 Free",
  "status": "Active",
  "valid_from": "2024-01-01",
  "valid_upto": "2024-12-31",
  "offer_type": "Product", // Product/Grand Total
  "apply_on": "Item Code",
  "min_qty": 2,
  "free_qty": 1,
  "apply_rule_on_items": ["ITEM-001", "ITEM-002"]
}
```

#### Discount Offers
```javascript
{
  "offer_name": "10% Off on Electronics",
  "offer_type": "Grand Total",
  "apply_discount_on": "Grand Total",
  "discount_percentage": 10,
  "min_amount": 100,
  "item_groups": ["Electronics"]
}
```

### 3. Coupon System Setup

#### Create POS Coupon
```javascript
{
  "coupon_code": "SAVE20",
  "coupon_type": "Discount",
  "discount_percentage": 20,
  "maximum_discount_amount": 50,
  "valid_from": "2024-01-01",
  "valid_upto": "2024-12-31",
  "used": 0,
  "maximum_use": 100,
  "customer": null, // null for all customers
  "min_amount": 200
}
```

### 4. M-Pesa Integration

#### Enable M-Pesa
1. Configure M-Pesa settings in ERPNext
2. Add M-Pesa as payment method in POS Profile:
```javascript
{
  "mode_of_payment": "M-Pesa",
  "type": "Phone",
  "mpesa_till_number": "123456",
  "mpesa_api_endpoint": "https://api.safaricom.co.ke/"
}
```

### 5. Delivery Charges Setup

#### Create Delivery Charges
Navigate to **Delivery Charges**:

```javascript
{
  "pos_profile": "Main POS",
  "delivery_charges_table": [
    {
      "territory": "Local",
      "charges": 5
    },
    {
      "territory": "Regional",
      "charges": 10
    },
    {
      "territory": "National",
      "charges": 20
    }
  ]
}
```

### 6. Custom Fields Configuration

POS Awesome adds custom fields to standard DocTypes. Configure visibility and properties:

#### Sales Invoice Custom Fields
- **`posa_pos_opening_shift`**: Link to opening shift
- **`posa_notes`**: Additional notes field
- **`posa_delivery_date`**: Delivery date selection
- **`posa_sales_person`**: Sales person assignment

#### Customer Custom Fields
- **`posa_discount`**: Customer-specific discount percentage
- **`posa_referral_code`**: Customer's referral code
- **`posa_birthday`**: Birthday for special offers

### 7. Print Format Configuration

#### Receipt Template
1. Go to **Print Format**
2. Create custom POS receipt format:
```html
<div class="receipt">
  <div class="header">
    <img src="{{ company.logo }}" />
    <h2>{{ company.name }}</h2>
  </div>
  
  <div class="invoice-details">
    <p>Invoice: {{ doc.name }}</p>
    <p>Date: {{ doc.posting_date }}</p>
    <p>Cashier: {{ doc.owner }}</p>
  </div>
  
  <table class="items">
    {% for item in doc.items %}
    <tr>
      <td>{{ item.item_name }}</td>
      <td>{{ item.qty }}</td>
      <td>{{ item.rate }}</td>
      <td>{{ item.amount }}</td>
    </tr>
    {% endfor %}
  </table>
  
  <div class="totals">
    <p>Subtotal: {{ doc.net_total }}</p>
    <p>Tax: {{ doc.total_taxes_and_charges }}</p>
    <p>Total: {{ doc.grand_total }}</p>
  </div>
</div>
```

## Performance Optimization

### 1. Caching Configuration

#### Redis Cache Settings
```python
# In site_config.json
{
  "redis_cache": "redis://localhost:13000",
  "cache_ttl": 300
}
```

#### POS Specific Cache
```javascript
// In POS Profile
{
  "posa_use_server_cache": 1,
  "posa_cache_duration": 600, // 10 minutes
  "posa_local_storage": 1
}
```

### 2. Database Indexing

Create indexes for frequently searched fields:
```sql
CREATE INDEX idx_item_barcode ON `tabItem Barcode` (barcode);
CREATE INDEX idx_serial_no ON `tabSerial No` (name, item_code);
CREATE INDEX idx_batch_no ON `tabBatch` (name, item);
```

### 3. Item Limit Configuration

For large catalogs, limit items displayed:
```javascript
{
  "posa_max_items_to_fetch": 500,
  "posa_items_per_page": 50
}
```

## Security Configuration

### 1. User Permissions

#### POS User Role
```javascript
{
  "role": "POS User",
  "permissions": [
    {
      "document_type": "Sales Invoice",
      "read": 1,
      "write": 1,
      "create": 1,
      "submit": 1
    },
    {
      "document_type": "Customer",
      "read": 1,
      "write": 1,
      "create": 1
    }
  ]
}
```

### 2. Operation Restrictions

Configure in POS Profile:
```javascript
{
  "posa_allow_delete": 0, // Restrict deletion
  "posa_max_discount_allowed": 15, // Max 15% discount
  "posa_allow_price_change": 0, // No price changes
  "posa_require_manager_approval": 1 // For voids
}
```

## Troubleshooting Configuration

### Common Issues

#### 1. Items Not Loading
- Check `posa_use_server_cache` setting
- Clear Redis cache: `bench clear-cache`
- Verify warehouse in POS Profile

#### 2. Payment Methods Missing
- Ensure Mode of Payment exists
- Check account linking in Mode of Payment
- Verify POS Profile payment methods table

#### 3. Tax Calculation Issues
- Verify tax template configuration
- Check item tax templates
- Ensure tax accounts are properly linked

#### 4. Print Issues
- Check print format assignment
- Verify printer settings
- Test with different print formats

### Debug Mode

Enable debug mode for troubleshooting:
```javascript
// In site_config.json
{
  "developer_mode": 1,
  "logging": 2 // Verbose logging
}
```

## Backup and Migration

### Configuration Backup
```bash
# Export POS configurations
bench --site [site] export-fixtures

# Backup includes:
# - POS Profiles
# - POS Offers
# - POS Coupons
# - Custom Fields
# - Property Setters
```

### Migration to New Instance
```bash
# On new instance
bench get-app posawesome
bench --site [site] install-app posawesome
bench --site [site] migrate
bench --site [site] import-fixtures
```