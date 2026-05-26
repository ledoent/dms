# Copyright 2026 ledoent — Don Kendall
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).
#
# Wires the dms Hoot test suite (dms/static/tests/**/*.test.js) into the
# Python `--test-enable` CI runner. Without this, the JS test bundle is built
# but never executed: `oca_run_tests` only runs Python TransactionCase /
# HttpCase subclasses; Hoot suites need an explicit Python HttpCase that
# navigates to `/web/tests?module=dms` in headless Chrome.
#
# Canonical pattern lifted from odoo/addons/web/tests/test_js.py (WebSuite).

import odoo.tests


@odoo.tests.tagged("hoot", "post_install", "-at_install")
class TestHoot(odoo.tests.HttpCase):
    def test_hoot_dms(self):
        # Hoot's `filter=` query param defaults to FUZZY matching (any
        # ordering of the chars), which means a bare `filter=@dms` also
        # matches web-core test names like `@web/views/fields/...` because
        # the chars '@', 'd', 'm', 's' appear scattered through them.
        # Double-quote-wrapping switches Hoot to exact substring matching,
        # so only test names actually containing `@dms` are selected. This
        # is what isolates us from web's own bundled Hoot suite (which has
        # known browser-version-sensitive flakes like daterange widths).
        self.browser_js(
            '/web/tests?headless&loglevel=2&preset=desktop&filter="@dms"',
            "",
            "",
            login="admin",
            timeout=600,
            success_signal="[HOOT] Test suite succeeded",
        )
