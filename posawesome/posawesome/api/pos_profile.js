// Copyright (c) 20201 Youssef Restom and contributors
// For license information, please see license.txt

frappe.ui.form.on('POS Profile', {
    setup: function (frm) {
        frm.set_query("posa_cash_mode_of_payment", function (doc) {
            return {
                filters: { 'type': 'Cash' }
            };
        });
    },

    refresh: function (frm) {
        // Toggle hardware manager setting field visibility
        frm.toggle_display('posa_hardware_manager_setting', frm.doc.posa_hardware_manager);
    },

    posa_hardware_manager: function (frm) {
        // Toggle hardware manager setting field when checkbox changes
        frm.toggle_display('posa_hardware_manager_setting', frm.doc.posa_hardware_manager);
    },
});