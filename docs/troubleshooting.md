# POS Awesome Troubleshooting Guide

## Common Issues and Solutions

## 1. Installation Issues

### App Not Found After Installation

**Symptoms:**
- POS Awesome not appearing in apps list
- Module not found errors

**Solution:**
```bash
# Verify installation
bench --site your-site.local list-apps

# If not listed, reinstall
bench get-app branch version-14 https://github.com/yrestom/POS-Awesome.git
bench --site your-site.local install-app posawesome
bench --site your-site.local migrate
bench restart
```

### Build Errors During Installation

**Symptoms:**
- JavaScript build errors
- Asset compilation failures

**Solution:**
```bash
# Clean and rebuild
rm -rf node_modules
bench setup requirements
bench build --app posawesome --force
bench clear-cache
```

## 2. Interface Issues

### POS Interface Not Loading

**Symptoms:**
- Blank screen when opening POS
- Loading spinner never stops
- Console errors

**Diagnosis:**
```javascript
// Check browser console for errors
// Press F12 and check Console tab
```

**Solutions:**

1. **Clear cache and rebuild:**
```bash
bench --site your-site.local clear-cache
bench build --app posawesome
bench restart
```

2. **Check POS Profile configuration:**
```python
# In frappe console
bench --site your-site.local console

pos_profile = frappe.get_doc("POS Profile", "Main POS")
print(pos_profile.as_dict())
```

3. **Verify permissions:**
```sql
-- Check user permissions
SELECT * FROM `tabHas Role` WHERE parent = 'your-username';
```

### Items Not Showing

**Symptoms:**
- Empty item grid
- Search returns no results
- Categories not displaying

**Solutions:**

1. **Check warehouse configuration:**
```python
# Verify POS Profile warehouse
pos_profile = frappe.get_doc("POS Profile", "Main POS")
print(f"Warehouse: {pos_profile.warehouse}")

# Check item stock in warehouse
items_with_stock = frappe.db.sql("""
    SELECT item_code, actual_qty 
    FROM `tabBin` 
    WHERE warehouse = %s
""", pos_profile.warehouse)
```

2. **Clear item cache:**
```bash
bench --site your-site.local execute posawesome.posawesome.api.posapp.clear_items_cache
```

3. **Check item settings:**
```python
# Verify items are enabled for POS
items = frappe.db.sql("""
    SELECT name, disabled, is_sales_item 
    FROM `tabItem` 
    WHERE disabled = 0 AND is_sales_item = 1
""", as_dict=True)
```

### Payment Methods Not Available

**Symptoms:**
- Payment buttons missing
- Cannot process payment
- Payment method errors

**Solution:**
```python
# Check POS Profile payment methods
pos_profile = frappe.get_doc("POS Profile", "Main POS")
for payment in pos_profile.payments:
    print(f"Payment Method: {payment.mode_of_payment}")
    
# Verify Mode of Payment exists
payment_modes = frappe.get_all("Mode of Payment", fields=["name", "enabled"])
print(payment_modes)
```

## 3. Transaction Issues

### Invoice Submission Failing

**Symptoms:**
- "Cannot submit invoice" error
- Validation errors
- Timeout errors

**Solutions:**

1. **Check for validation errors:**
```python
# Get draft invoice
invoice = frappe.get_doc("Sales Invoice", "ACC-SINV-00001")
invoice.run_method("validate")
```

2. **Verify accounting configuration:**
```python
# Check accounts
company = frappe.get_doc("Company", "Your Company")
print(f"Default Income Account: {company.default_income_account}")
print(f"Default Receivable Account: {company.default_receivable_account}")
```

3. **Check for missing mandatory fields:**
```sql
-- Find missing mandatory fields
SELECT fieldname, label 
FROM `tabDocField` 
WHERE parent = 'Sales Invoice' 
AND reqd = 1;
```

### Returns Not Working

**Symptoms:**
- Cannot create return invoice
- Original invoice not found
- Return amount incorrect

**Solution:**
```python
# Enable returns in POS Profile
frappe.db.set_value("POS Profile", "Main POS", "posa_allow_return", 1)

# Check if invoice is returnable
invoice = frappe.get_doc("Sales Invoice", "ACC-SINV-00001")
print(f"Is Return: {invoice.is_return}")
print(f"Return Against: {invoice.return_against}")
```

### Payment Reconciliation Issues

**Symptoms:**
- Payment amounts not matching
- Cannot close shift
- Reconciliation errors

**Solution:**
```python
# Check payment entries
payments = frappe.get_all("Payment Entry", 
    filters={"posting_date": today()},
    fields=["name", "paid_amount", "payment_type"])

# Reconcile payments
from posawesome.posawesome.api.posapp import reconcile_payments
reconcile_payments(pos_opening_shift="POSA-OS-00001")
```

## 4. Performance Issues

### Slow Loading Times

**Symptoms:**
- Items take long to load
- Search is slow
- Interface lags

**Solutions:**

1. **Enable caching:**
```python
# In POS Profile
frappe.db.set_value("POS Profile", "Main POS", {
    "posa_use_server_cache": 1,
    "posa_local_storage": 1,
    "posa_cache_duration": 600
})
```

2. **Optimize database:**
```sql
-- Add indexes for commonly searched fields
CREATE INDEX idx_item_barcode ON `tabItem Barcode` (barcode);
CREATE INDEX idx_batch_item ON `tabBatch` (item);
CREATE INDEX idx_serial_item ON `tabSerial No` (item_code);

-- Analyze tables
ANALYZE TABLE `tabItem`;
ANALYZE TABLE `tabSales Invoice`;
```

3. **Limit items fetched:**
```python
# Set maximum items
frappe.db.set_value("POS Profile", "Main POS", 
    "posa_max_items_to_fetch", 500)
```

### High Memory Usage

**Symptoms:**
- Browser becomes unresponsive
- Out of memory errors
- Page crashes

**Solution:**
```javascript
// Clear local storage
localStorage.clear()

// Limit cache size in settings
frappe.db.set_value("POS Profile", "Main POS", {
    "posa_local_storage_limit": 50  // MB
})
```

## 5. Printing Issues

### Receipt Not Printing

**Symptoms:**
- Print button not working
- Printer not responding
- Incorrect format

**Solutions:**

1. **Check print format:**
```python
# Verify print format exists
print_format = frappe.get_doc("Print Format", "POS Invoice")
print(print_format.html)
```

2. **Test printer connection:**
```javascript
// Browser print dialog
window.print()

// Check printer settings
navigator.permissions.query({name: "printer"}).then(result => {
    console.log(result.state)
})
```

3. **Thermal printer setup:**
```bash
# Install printer drivers
sudo apt-get install cups
sudo usermod -a -G lpadmin frappe

# Add printer
sudo lpadmin -p thermal_printer -v usb://...
```

## 6. Data Issues

### Missing Custom Fields

**Symptoms:**
- POS fields not visible
- Features not working
- Migration errors

**Solution:**
```bash
# Re-run migrations
bench --site your-site.local migrate

# Manually create custom fields
bench --site your-site.local execute posawesome.install.create_custom_fields
```

### Duplicate Entries

**Symptoms:**
- Duplicate invoices
- Repeated transactions
- Data inconsistency

**Solution:**
```python
# Find duplicates
duplicates = frappe.db.sql("""
    SELECT name, COUNT(*) as count
    FROM `tabSales Invoice`
    WHERE posa_pos_opening_shift = %s
    GROUP BY customer, grand_total, posting_date
    HAVING count > 1
""", shift_name)

# Remove duplicates (carefully!)
for dup in duplicates:
    # Review before deleting
    frappe.delete_doc("Sales Invoice", dup.name)
```

## 7. Integration Issues

### M-Pesa Not Working

**Symptoms:**
- Payment fails
- No response from API
- Callback not received

**Solution:**
```python
# Check M-Pesa configuration
settings = frappe.get_doc("M-Pesa Settings")
print(f"Consumer Key: {settings.consumer_key[:5]}...")
print(f"API URL: {settings.api_url}")

# Test connection
import requests
response = requests.get(settings.api_url + "/oauth/v1/generate")
print(response.status_code)
```

### ERPNext Sync Issues

**Symptoms:**
- Data not syncing
- Accounts not updating
- Stock discrepancies

**Solution:**
```bash
# Force sync
bench --site your-site.local trigger-background-jobs

# Check scheduler
bench --site your-site.local show-pending-jobs
bench --site your-site.local execute frappe.utils.scheduler.enqueue_events
```

## 8. Debugging Tools

### Enable Debug Mode

```bash
# Set debug mode
bench --site your-site.local set-config developer_mode 1
bench --site your-site.local set-config logging 2
```

### Check Logs

```bash
# Application logs
tail -f logs/worker.log
tail -f logs/web.log
tail -f logs/scheduler.log

# Database logs
tail -f logs/database.log

# Specific app logs
grep -i "posawesome" logs/*.log
```

### Browser Debugging

```javascript
// Enable verbose logging
localStorage.setItem('debug_mode', 'true')

// Check Vue DevTools
// Install Vue.js devtools extension

// Monitor network requests
// Open Network tab in browser DevTools
// Filter by XHR/Fetch
```

### Database Debugging

```sql
-- Check recent errors
SELECT * FROM `tabError Log` 
ORDER BY modified DESC 
LIMIT 10;

-- Check POS transactions
SELECT name, customer, grand_total, docstatus 
FROM `tabSales Invoice` 
WHERE posa_pos_opening_shift IS NOT NULL
ORDER BY creation DESC
LIMIT 20;

-- Verify custom fields
SELECT fieldname, label, fieldtype 
FROM `tabCustom Field` 
WHERE dt = 'Sales Invoice' 
AND fieldname LIKE 'posa_%';
```

## 9. Recovery Procedures

### Recover Lost Shift Data

```python
# Find orphaned invoices
orphaned = frappe.db.sql("""
    SELECT name, customer, grand_total
    FROM `tabSales Invoice`
    WHERE posa_pos_opening_shift IS NULL
    AND creation > %s
    AND owner = %s
""", (yesterday, user))

# Assign to shift
for invoice in orphaned:
    frappe.db.set_value("Sales Invoice", invoice.name, 
        "posa_pos_opening_shift", shift_name)
```

### Reset POS Configuration

```bash
# Backup current configuration
bench --site your-site.local backup

# Reset to defaults
bench --site your-site.local execute posawesome.install.reset_pos_settings

# Reconfigure
bench --site your-site.local execute posawesome.install.setup_pos_profile
```

## 10. Preventive Maintenance

### Regular Tasks

```bash
# Daily
bench --site your-site.local clear-cache
bench --site your-site.local backup

# Weekly
bench --site your-site.local execute frappe.utils.scheduler.enqueue_events
bench --site your-site.local doctor

# Monthly
bench update
bench migrate
```

### Performance Monitoring

```python
# Create monitoring script
def monitor_pos_performance():
    # Check response times
    # Monitor cache hit rates
    # Track error rates
    # Alert on anomalies
    pass
```

## Getting Help

### Collect Diagnostic Information

```bash
# System information
bench version
bench --site your-site.local doctor

# Error details
bench --site your-site.local show-error-log

# Configuration dump
bench --site your-site.local export-fixtures
```

### Report Issues

When reporting issues, include:
1. Error messages and screenshots
2. Browser console logs
3. Server error logs
4. Steps to reproduce
5. System configuration

### Support Channels

- GitHub Issues: https://github.com/yrestom/POS-Awesome/issues
- Frappe Forum: https://discuss.frappe.io
- Email: info@totrox.com

## Quick Reference Commands

```bash
# Clear all caches
bench --site your-site.local clear-cache
redis-cli FLUSHALL

# Restart all services
bench restart
sudo supervisorctl restart all

# Force rebuild
bench build --app posawesome --force

# Reset a stuck shift
bench --site your-site.local execute posawesome.api.reset_shift

# Emergency backup
bench --site your-site.local backup --with-files
```