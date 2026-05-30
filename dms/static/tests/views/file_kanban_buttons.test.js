// /** ********************************************************************************
//     Copyright 2026 ledoent — Don Kendall
//     License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).
//
//     Locks down the wizard-view xpath regression that bit us twice during
//     the 19.0 MIG: Odoo 19.0 emptied web.KanbanView.Buttons to a no-op
//     `<t t-name="web.KanbanView.Buttons"/>`, so the 18.0 t-inherit + xpath
//     pattern silently produces an empty button bar (or worse, an OWL
//     "element not found" crash). We restored dms.KanbanButtons as a
//     self-contained template; this test verifies the view registration
//     still wires it to the right buttonTemplate.
//  **********************************************************************************/

import {expect, test} from "@odoo/hoot";
import {registry} from "@web/core/registry";

// Side-effect import: registers the file_kanban view in the registry.
// Note the `.esm` suffix — Odoo's transpiler keeps it in the module name
// (see odoo/tools/js_transpiler.py:url_to_module_path, which only strips
// `.js`). Importing without `.esm` produces a `module not defined` crash
// at Hoot runtime.
import "@dms/js/views/file_kanban_view.esm";

test("file_kanban view registers with dms.KanbanButtons template", () => {
    const view = registry.category("views").get("file_kanban");
    expect(view).toBeOfType("object");
    expect(view.buttonTemplate).toBe("dms.KanbanButtons");
    expect(view.Renderer).toBeOfType("function");
});
