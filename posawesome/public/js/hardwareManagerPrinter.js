frappe.ui.form.on("Sales Order", {
  refresh(frm) {
    frm.add_custom_button("Print on HM (Direct)", function () {
      // Step 1: Build XML payload from Sales Order data
      let xmlPayload = `<output>
            <ticket>
            <line>
                <OrderNo>${frm.doc.name}</OrderNo>
                <Customer>${frm.doc.customer}</Customer>
                <Items>`;

      frm.doc.items.forEach((item) => {
        xmlPayload += `<Item>
                    <Name>${item.item_name}</Name>
                    <Qty>${item.qty}</Qty>
                    <Price>${item.rate}</Price>
                </Item>`;
      });

      xmlPayload += `</Items>
                <Total>${frm.doc.grand_total}</Total>
                </line>
                </ticket>
            </output>`;

      // Step 2: Send XML via Fetch API
      fetch("http://localhost:8090/printer", {
        method: "POST",
        headers: {
          "Content-Type": "application/xml;charset-utf-8",
        },
        body: xmlPayload,
      })
        .then((response) => {
          console.log(response);

          if (!response.ok) throw new Error("Failed to send print request");

          return response.text();
        })
        .then((data) => {
          frappe.msgprint("Print request sent successfully!");
          console.log("Middleware Response:", data);
        })
        .catch((error) => {
          console.error("Error:", error);
          frappe.msgprint("Error sending print request: " + error.message);
        });
    });
  },
});
