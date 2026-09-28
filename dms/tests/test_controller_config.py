# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).
import json

import odoo.tests
from odoo.tests.common import new_test_user
from odoo.tools import mute_logger

CT_JSON = {"Content-Type": "application/json"}


@odoo.tests.tagged("post_install", "-at_install")
class TestDmsControllerConfig(odoo.tests.HttpCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.env["ir.config_parameter"].sudo().set_param(
            "dms.forbidden_extensions", ".exe,.bat"
        )
        new_test_user(
            cls.env,
            login="dms-json2",
            password="dms-json2",
            groups="dms.group_dms_user",
        )

    def test_forbidden_extensions_returns_bare_json(self):
        """The result is bare JSON, not wrapped in a JSON-RPC envelope."""
        self.authenticate("dms-json2", "dms-json2")
        response = self.url_open(
            "/config/dms.forbidden_extensions", data=json.dumps({}), headers=CT_JSON
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"forbidden_extensions": ".exe,.bat"})

    @mute_logger("odoo.http")
    def test_forbidden_extensions_requires_user(self):
        """Without a session the endpoint answers 403."""
        response = self.url_open(
            "/config/dms.forbidden_extensions", data=json.dumps({}), headers=CT_JSON
        )
        self.assertEqual(response.status_code, 403)
