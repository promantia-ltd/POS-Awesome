import frappe
from frappe import _

@frappe.whitelist()
def generate_sales_order_xml(sales_order_name):
    doc = frappe.get_doc("Sales Order", sales_order_name)
    xml = frappe.render_template("posawesome/templates/print_formats/sales_order_hm.xml", {"doc": doc})
    return xml
