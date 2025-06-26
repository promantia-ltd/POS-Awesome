const frappeCall = (method, args = {}) =>
  frappe.call({ method, args }).then((r) => {
    if ("message" in r) return r.message;
    throw new Error("No message returned");
  });

export default {
  methods: {
    hardwareConfiguration(pos_name) {
      return frappeCall(
        "awesome_pos_hw.api.get_hardware_details.get_hardware_manager_setting",
        { pos_profile_name: pos_name }
      );
    },

    async hardwareURL(api_name) {
      try {
        const url = await frappeCall(
          "awesome_pos_hw.api.get_hardware_details.hardware_url",
          { api_name }
        );
        if (!url) {
          frappe.msgprint(
            __("Hardware URL not configured for {0}", [api_name])
          );
          throw new Error("URL not configured");
        }
        return url;
      } catch (err) {
        throw err;
      }
    },

    async custom_print(invoice_name) {
      try {
        const url = await this.hardwareURL("Printer");
        if (!url) return;

        const xmlPayload = await frappeCall(
          "posawesome.posawesome.api.pos_sales_hm.generate_print_xml",
          {
            doc_type: "Sales Invoice",
            sales_invoice_name: invoice_name,
            template_path:
              "posawesome/templates/print_formats/sales_invoice_template.xml",
          }
        );

        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/xml;charset=utf-8" },
          body: xmlPayload,
          mode: "cors",
        });

        frappe.show_alert({
          message: res.ok ? "Printing..." : "Failed to print",
          indicator: res.ok ? "green" : "red",
        });
      } catch (err) {
        frappe.msgprint("Error: " + (err.message || err));
      }
    },
  },
};
