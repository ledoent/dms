# Copyright 2026 ledoent — Don Kendall
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).
"""Backend (admin-driven) e2e tours.

Companion to ``test_portal.py`` which exercises portal flows. This file
drives backend UI behaviour that mounts the custom ``file_kanban``
renderer — density toggle, in particular, which is pure browser-side
state (localStorage) and is not reachable from any Python-only test.
"""

import odoo.tests


@odoo.tests.tagged("post_install", "-at_install")
class TestDmsBackendTours(odoo.tests.HttpCase):
    def test_kanban_density_toggle(self):
        self.start_tour(
            "/odoo",
            "dms_kanban_density_tour",
            login="admin",
        )
