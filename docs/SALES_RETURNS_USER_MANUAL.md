# Sales Returns & Customer Credit - User Manual

## Table of Contents
1. [Overview](#overview)
2. [POS Profile Configuration](#pos-profile-configuration)
3. [Creating Sales Returns](#creating-sales-returns)
4. [Customer Credit Management](#customer-credit-management)
5. [Redeeming Customer Credit](#redeeming-customer-credit)
6. [Tracking Credit Transactions](#tracking-credit-transactions)
7. [Troubleshooting](#troubleshooting)

---

## Overview

POS Awesome now supports comprehensive sales return functionality with customer credit management. This system allows you to:

- Process **full or partial returns** of previously sold items
- Track **multi-level returns** (returning items from a previous return)
- Choose between **immediate cashback** or **store credit**
- **Redeem customer credit** on future purchases
- Generate **audit reports** of all credit transactions

### Key Concepts

**Sales Return**: A transaction that reverses a previous sale, either fully or partially.

**Credit Note**: A document created when processing a return, representing the refund amount.

**Store Credit**: Credit that remains on the customer's account for future purchases (negative outstanding amount).

**Cashback**: Immediate cash refund to the customer (credit note fully paid).

**Partial Return**: Returning only some items or quantities from an original invoice.

---

## POS Profile Configuration

### Setting Up Returns

1. Navigate to: **POS Profile** → Select your profile
2. Find the **Returns** section
3. Configure the following settings:

#### Use Cashback
- **Enabled (1)**: Users can choose between cashback or store credit during returns
  - Shows a "Cashback?" toggle during return processing
  - Default behavior: Immediate cash refund

- **Disabled (0)**: All returns automatically create store credit
  - No cashback option shown
  - Credit notes maintain negative outstanding balance
  - Recommended for businesses wanting to retain customers

#### Use Customer Credit
- **Enabled**: Allows customers to use accumulated store credit on new purchases
- **Disabled**: Credit cannot be redeemed (not recommended)

### Example Configuration

```
POS Profile: Retail Store Profile 1
├── Use Cashback: 0 (Disabled)
└── Use Customer Credit: 1 (Enabled)

Result: All returns create store credit, customers can redeem on future purchases
```

---

## Creating Sales Returns

### Step 1: Access Sales Returns

1. Open the **POS** interface
2. Click the **"Sales Return"** button in the top navigation
3. A modal dialog will appear showing returnable invoices

### Step 2: Search for Original Invoice

The sales return dialog displays:
- **Last 20 invoices** by default
- **Search bar** to find specific invoices by ID

**Search Example:**
```
Enter Invoice ID: ACC-SINV-2025-00050
```

### Step 3: View Return Status

Each invoice displays a status badge:

| Badge | Meaning | Action |
|-------|---------|--------|
| No Badge | Never returned | Full return available |
| **Partial Return** (Orange) | Some items returned | Partial return available |
| **Fully Returned** (Red) | All items returned | Cannot select |

### Step 4: Select Items to Return

1. Click on the invoice you want to return
2. An **Item Selection Dialog** appears showing all items
3. Review the available quantities:

#### Item Selection Table

| Column | Description | Example |
|--------|-------------|---------|
| **Checkbox** | Select item for return | ☑ |
| **Item** | Item name | "Widget A" |
| **Status** | Return status | "Partial" / "Fully Returned" |
| **Available** | Qty available to return | "8 / 10" |
| **Return Qty** | Quantity to return (editable) | 5 |
| **Rate** | Unit price | $10.00 |
| **Amount** | Total return amount | -$50.00 |

#### Understanding Available Quantities

**Example:**
```
Original Sale: 10 units
Already Returned: 2 units
Available to Return: 8 units
```

The **progress bar** shows:
- Green: Full quantity available
- Yellow: Partial quantity available
- Red: Fully returned (disabled)

### Step 5: Set Return Quantities

1. **Check** the items you want to return
2. **Edit** the return quantity (defaults to maximum available)
3. The system prevents:
   - ❌ Returning more than available quantity
   - ❌ Returning zero or negative quantities
   - ❌ Selecting fully returned items

**Example:**
```
Item: Laptop
Original Qty: 5
Already Returned: 2
Max Returnable: 3

You can return: 1, 2, or 3 (not more)
```

### Step 6: Submit the Return

1. Click **"Proceed Return"** in the item selection dialog
2. You're taken to the **Return Invoice Screen**

#### Return Invoice Screen Features

**RETURN MODE Badge**:
- Red badge at the top indicating you're processing a return
- Prevents adding new items to the return

**Cart Display**:
- Shows selected items with **negative quantities**
- Displays **negative amounts** (refund)
- Shows **progress indicators** for partial returns

**Example Cart:**
```
┌─────────────────────────────────┐
│ RETURN MODE                     │
├─────────────────────────────────┤
│ Item: Widget A                  │
│ Qty: -5 (Max: 8)               │
│ Amount: -$50.00                 │
│ Progress: ████░░░░ 62%          │
└─────────────────────────────────┘
```

### Step 7: Process Payment/Refund

Click **"Pay"** to open the payment dialog.

#### If Cashback is ENABLED in POS Profile:

You'll see a **"Cashback?" toggle**:

**Option A: Cashback ON (Default)**
```
☑ Cashback?
└── Immediate cash refund
└── Credit note marked as paid
└── Outstanding amount: $0
```

**Option B: Cashback OFF**
```
☐ Cashback?
└── Store credit created
└── Credit note unpaid
└── Outstanding amount: -$50 (negative)
```

#### If Cashback is DISABLED in POS Profile:

- No toggle shown
- Automatically creates store credit
- Customer can redeem on future purchases

### Step 8: Complete the Return

1. Click **"Complete Order"**
2. The credit note is created and submitted
3. You see a success message with the credit note number

**Result:**
```
✓ Credit Note Created: ACC-SINV-2025-00051
  Original Invoice: ACC-SINV-2025-00050
  Return Amount: -$50.00
  Type: Store Credit
```

---

## Customer Credit Management

### How Credit Notes Work

When a return creates **store credit** (cashback disabled):

1. **Credit Note** is created with:
   - `is_return = 1`
   - `outstanding_amount = -50.00` (negative)
   - `update_outstanding_for_self = 1`

2. **Original Invoice** status changes to:
   - "Credit Note Issued" (full return)
   - "Return" (partial return)

3. **Customer Account** shows:
   - Available credit visible in "Use Customer Credit"

### Viewing Customer Credit

#### In POS Interface:

1. Select a customer
2. Click **"Pay"** button
3. Look for **"Use Customer Credit"** toggle
4. Enable it to see available credits

**Display Example:**
```
┌─────────────────────────────────────┐
│ Use Customer Credit                 │
├─────────────────────────────────────┤
│ Credit Note: ACC-SINV-2025-00051   │
│ Available: $50.00                   │
│ Redeem: [________] (enter amount)   │
│                                      │
│ Credit Note: ACC-SINV-2025-00048   │
│ Available: $30.00                   │
│ Redeem: [________]                  │
├─────────────────────────────────────┤
│ Total Credit Available: $80.00      │
└─────────────────────────────────────┘
```

#### In ERPNext Backend:

1. Go to **Sales Invoice** list
2. Filter: `is_return = 1` AND `outstanding_amount < 0`
3. These are available customer credits

---

## Redeeming Customer Credit

### Step 1: Create New Sale

1. Add items to cart as usual
2. Select the customer who has credit
3. Click **"Pay"**

### Step 2: Enable Customer Credit

1. Toggle **"Use Customer Credit"** ON
2. Available credit notes appear in the list
3. Each shows:
   - Credit Note number
   - Available amount
   - Original invoice reference

### Step 3: Apply Credit

1. **Enter amount** to redeem from each credit note
2. The system validates:
   - ✓ Cannot exceed available credit
   - ✓ Cannot exceed invoice total
3. Remaining balance shows below

**Example:**
```
Invoice Total: $100.00

Credit Applied:
├── ACC-SINV-2025-00051: $50.00
└── ACC-SINV-2025-00048: $30.00
    Total Credit: $80.00

Remaining to Pay: $20.00
└── Pay with: Cash/Card
```

### Step 4: Complete Payment

1. Pay remaining balance using cash/card
2. Click **"Complete Order"**
3. The system:
   - Creates a **Journal Entry** to reconcile credit
   - Marks the new invoice as **Paid**
   - Reduces outstanding on credit notes

**Result:**
```
✓ Invoice Created: ACC-SINV-2025-00052
  Total: $100.00
  Credit Used: $80.00
  Cash Paid: $20.00
  Status: Paid

Journal Entry: ACC-JV-2025-00005
├── Debit: ACC-SINV-2025-00051 ($50.00)
├── Debit: ACC-SINV-2025-00048 ($30.00)
└── Credit: ACC-SINV-2025-00052 ($80.00)
```

---

## Tracking Credit Transactions

### Customer Credit Redemption Report

Access the comprehensive tracking report:

1. Go to: **Reports** → **Sales Invoice**
2. Find: **"Customer Credit Redemption"**
3. Or search: Press `Ctrl+K` and type "Customer Credit Redemption"

### Report Filters

| Filter | Purpose | Example |
|--------|---------|---------|
| **Company** | Filter by company | "Yanur Trading Company" |
| **Customer** | Specific customer | "POS Customer" |
| **From Date** | Start date | "2025-11-01" |
| **To Date** | End date | "2025-11-30" |
| **New Invoice** | Invoice that used credit | "ACC-SINV-2025-00052" |
| **Credit Note** | Credit note redeemed | "ACC-SINV-2025-00051" |

### Report Columns

| Column | Shows | Clickable |
|--------|-------|-----------|
| **New Invoice** | Invoice paid with credit | Yes → Opens invoice |
| **Invoice Date** | When invoice created | No |
| **Customer** | Customer name | Yes → Opens customer |
| **Invoice Total** | Total invoice amount | No |
| **Credit Used** | Amount of credit applied | No |
| **Outstanding** | Remaining balance | No |
| **Status** | Invoice status | No |
| **Credit Note Used** | Which credit note | Yes → Opens credit note |
| **Credit Note Amount** | Total credit available | No |
| **Journal Entry** | Reconciliation JE | Yes → Opens JE |
| **JE Date** | When reconciled | No |
| **Company** | Company name | Yes → Opens company |

### Example Report Output

```
┌──────────────┬────────────┬─────────────┬──────────┬─────────────┬──────────────┐
│ New Invoice  │ Date       │ Customer    │ Total    │ Credit Used │ Credit Note  │
├──────────────┼────────────┼─────────────┼──────────┼─────────────┼──────────────┤
│ SINV-00052   │ 2025-11-27 │ POS Cust.   │ $100.00  │ $80.00      │ SINV-00051   │
│ SINV-00053   │ 2025-11-27 │ POS Cust.   │ $50.00   │ $20.00      │ SINV-00048   │
│ SINV-00055   │ 2025-11-28 │ John Doe    │ $200.00  │ $150.00     │ SINV-00049   │
└──────────────┴────────────┴─────────────┴──────────┴─────────────┴──────────────┘
```

### Exporting Reports

Click the menu icon and select:
- **Export to Excel**: Full data export
- **Export to CSV**: Plain text format
- **Print**: PDF or paper output

---

## Troubleshooting

### Issue 1: Credit Notes Not Showing in "Use Customer Credit"

**Symptoms:**
- Customer has credit notes, but they don't appear in the credit list
- Credit notes exist in Sales Invoice list

**Possible Causes & Solutions:**

#### Cause A: Cashback Was Enabled During Return
```
Check: Credit Note outstanding_amount = 0

Solution:
- For future returns, disable cashback in POS Profile
- Or manually toggle "Cashback?" OFF during return
```

#### Cause B: Cache Not Cleared
```
Solution:
1. Hard refresh browser: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
2. Clear cache: bench --site [sitename] clear-cache
```

#### Cause C: Wrong Company Filter
```
Check: Credit note company matches current invoice company

Solution:
- Ensure credit note has same company as new sale
```

### Issue 2: Cannot Return More Quantity

**Symptoms:**
- Item shows "Max: 5" but you need to return more
- Progress bar shows item partially returned

**Explanation:**
This is **correct behavior**. The system tracks cumulative returns.

**Example:**
```
Original Sale: 10 units
Return #1: 3 units (7 remaining)
Return #2: 2 units (5 remaining)
Current Max: 5 units

This prevents over-returning items.
```

**Solution:**
- If this is incorrect, check if multiple partial returns were made
- Review return history in the Customer Credit Redemption report

### Issue 3: "Cannot Add Items in Return Mode" Error

**Symptoms:**
- RETURN MODE badge showing
- Cannot add new items to cart

**Explanation:**
This is a **safety feature** preventing accidental modifications to returns.

**Solution:**
1. Complete the current return, OR
2. Cancel and start over:
   - Close the return invoice
   - Click "New Invoice"
   - Start fresh return process

### Issue 4: Invoice Shows "Unpaid" After Using Credit

**Symptoms:**
- Applied customer credit during payment
- Invoice status shows "Unpaid"
- Credit was deducted from credit note

**Possible Cause:**
Bug in credit redemption (should be fixed in this version)

**Check:**
1. Go to **Journal Entry** list
2. Search for today's date
3. Look for JE with references to both invoices

**If No Journal Entry Found:**
```
This indicates the credit redemption failed

Solution:
1. Cancel the new invoice (if draft)
2. Retry the transaction
3. If issue persists, check error logs:
   - bench --site [sitename] console
   - Check frappe error log
```

### Issue 5: Partial Return Not Tracking Correctly

**Symptoms:**
- Made multiple returns
- Available quantity seems wrong

**Debugging Steps:**

1. **Check Return History:**
   ```sql
   SELECT
       parent as credit_note,
       item_code,
       qty,
       sales_invoice_item
   FROM `tabSales Invoice Item`
   WHERE sales_invoice_item = '[original-item-row-id]'
   ORDER BY creation DESC
   ```

2. **Verify Original Invoice:**
   - Open original invoice
   - Check each item's quantity
   - Compare with returns

3. **Use Report:**
   - Open Customer Credit Redemption report
   - Filter by Credit Note
   - See all related transactions

---

## Best Practices

### For Store Managers

1. **Configure Once:**
   - Set POS Profile cashback setting based on business policy
   - Don't change frequently to avoid confusion

2. **Train Staff:**
   - Explain difference between cashback and store credit
   - Show how to use "Use Customer Credit" toggle

3. **Regular Audits:**
   - Run Customer Credit Redemption report weekly
   - Verify credit balances match expectations
   - Check for unredeemed old credits

### For Cashiers

1. **Before Processing Return:**
   - Verify customer identity
   - Check original invoice exists
   - Confirm item condition

2. **During Return:**
   - Carefully select items and quantities
   - Double-check amounts before submitting
   - Ask customer about cashback preference (if enabled)

3. **After Return:**
   - Give customer the credit note number
   - Explain how to redeem on future purchases
   - Keep printed receipt for records

### For Customers

1. **Keep Receipts:**
   - Original invoice needed for returns
   - Credit note number for tracking

2. **Check Credit Balance:**
   - Ask cashier to show available credit
   - Note expiration policies (if any)

3. **Redeem Credit:**
   - Inform cashier you have store credit
   - Provide credit note number if needed
   - Can use partial credit (no need to use all)

---

## Appendix: Technical Details

### Credit Note Document Structure

```json
{
  "doctype": "Sales Invoice",
  "name": "ACC-SINV-2025-00051",
  "is_return": 1,
  "return_against": "ACC-SINV-2025-00050",
  "grand_total": -50.00,
  "outstanding_amount": -50.00,
  "update_outstanding_for_self": 1,
  "status": "Return",
  "items": [
    {
      "item_code": "WIDGET-A",
      "qty": -5,
      "rate": 10.00,
      "amount": -50.00,
      "sales_invoice_item": "[original-row-id]"
    }
  ],
  "payments": []  // Empty for store credit
}
```

### Journal Entry for Credit Redemption

```json
{
  "doctype": "Journal Entry",
  "name": "ACC-JV-2025-00005",
  "voucher_type": "Journal Entry",
  "accounts": [
    {
      "account": "Debtors - YTC",
      "party": "POS Customer",
      "reference_type": "Sales Invoice",
      "reference_name": "ACC-SINV-2025-00051",
      "debit_in_account_currency": 50.00
    },
    {
      "account": "Debtors - YTC",
      "party": "POS Customer",
      "reference_type": "Sales Invoice",
      "reference_name": "ACC-SINV-2025-00052",
      "credit_in_account_currency": 50.00
    }
  ]
}
```

### API Endpoints

**Get Invoice Return Status:**
```python
GET /api/method/posawesome.posawesome.api.posapp.get_invoice_return_status
Params: invoice_name
Returns: List of items with return status
```

**Get Available Credit:**
```python
GET /api/method/posawesome.posawesome.api.posapp.get_available_credit
Params: customer, company
Returns: List of credit sources (notes, advances)
```

**Search Returns:**
```python
GET /api/method/posawesome.posawesome.api.posapp.search_invoices_for_return
Params: invoice_name, company
Returns: List of returnable invoices with metadata
```

---

## FAQ

**Q: Can I return an item multiple times?**
A: Yes, partial returns are supported. You can return 3 items today, 2 items tomorrow, etc., up to the original quantity sold.

**Q: Does credit expire?**
A: No automatic expiration in the system. Set manual policies if needed.

**Q: Can credit be transferred to another customer?**
A: Not through the POS interface. Requires manual intervention in the backend.

**Q: Can I return items from different invoices in one transaction?**
A: No. Each return must reference a single original invoice. Process multiple returns separately.

**Q: What if I accidentally process a return?**
A: Cancel the credit note before it's used. Contact administrator if already redeemed.

**Q: Can I mix cashback and store credit?**
A: No. Each return is either full cashback or full store credit. No partial mixing.

**Q: How do I void a credit note?**
A: Use ERPNext's standard cancellation:
1. Open the credit note
2. Click "Cancel"
3. Provide reason
4. Original invoice status reverts

---

## Support

For technical issues or questions:
- **Documentation**: Check this manual first
- **Error Logs**: `bench --site [sitename] logs`
- **Community**: ERPNext Forum
- **GitHub**: Report bugs at posawesome/issues

---

**Version:** 1.0
**Last Updated:** November 27, 2025
**Applies To:** POS Awesome with Sales Return & Customer Credit features
