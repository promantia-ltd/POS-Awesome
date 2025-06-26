export default {
  data() {},
  methods: {
    hardwareConfiguration(pos_name) {
      return new Promise((resolve, reject) => {
        frappe.call({
          method:
            "awesome_pos_hw.api.get_hardware_details.get_hardware_manager_setting",
          args: { pos_profile_name: pos_name },
          callback: function (r) {
            console.log(r);

            if ("message" in r) {
              resolve(r.message); // allow true, false, 0, etc.
            } else {
              reject("No message returned");
            }
          },
          error: function (err) {
            reject(err);
          },
        });
      });
    },
    hardwareURL(api_name) {
      return new Promise((resolve, reject) => {
        frappe.call({
          method: "awesome_pos_hw.api.get_hardware_details.hardware_url",
          args: { api_name: api_name },
          callback: function (r) {
            if (r.message) {
              resolve(r.message);
            } else {
              frappe.msgprint(
                __("Hardware URL not configured for {0}", [api_name])
              );
              reject("URL not configured");
            }
          },
          error: function (err) {
            reject(err);
          },
        });
      });
    },
    async custom_print(invoice_name) {
      const url = await this.hardwareURL("Printer");

      if (!url) {
        frappe.msgprint(__("Printer URL not configured"));
        return;
      }
      url &&
        frappe.call({
          method: "posawesome.posawesome.api.pos_sales_hm.generate_print_xml",
          args: {
            doc_type: "Sales Invoice",
            sales_invoice_name: invoice_name,
            template_path:
              "posawesome/templates/print_formats/sales_invoice_template.xml",
          },
          callback: function (r) {
            const xmlPayload = r.message;

            fetch(url, {
              method: "POST",
              headers: {
                "Content-Type": "application/xml;charset-utf-8",
              },
              body: xmlPayload,
              mode: "cors",
            })
              .then((res) => {
                if (res.ok) {
                  frappe.show_alert({
                    message: "Printing...",
                    indicator: "green", // or 'green', 'red', etc.
                  });
                } else {
                  frappe.show_alert({
                    message: "Failed to print",
                    indicator: "red", // or 'green', 'red', etc.
                  });
                }
              })
              .catch((err) => {
                frappe.msgprint("Error: " + err);
              });
          },
        });
    },
  },
};
