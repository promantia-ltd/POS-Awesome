frappe.ui.form.on("Sales Order", {
  refresh(frm) {
    frm.add_custom_button("Print on HM", function () {
      frappe.call({
        method: "posawesome.api.sales_order_hm.generate_sales_order_xml",
        args: { sales_order_name: frm.doc.name },
        callback: function (r) {
          const xmlPayload = r.message;

          fetch("http://localhost:8090/printer", {
            method: "POST",
            headers: {
              "Content-Type": "application/xml;charset-utf-8",
            },
            body: xmlPayload,
            mode: "cors",
          })
            .then((res) => {
              if (res.ok) {
                frappe.msgprint("Print sent to Hardware Manager");
              } else {
                frappe.msgprint("Failed to print");
              }
            })
            .catch((err) => {
              frappe.msgprint("Error: " + err);
            });
        },
      });
    });
  },
});
