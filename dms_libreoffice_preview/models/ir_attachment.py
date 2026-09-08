# Copyright 2026 ledoent — Don Kendall
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

import logging

from odoo import api, models

from .dms_file import _CACHE_DESCRIPTION_PREFIX

_logger = logging.getLogger(__name__)


class IrAttachment(models.Model):
    _inherit = "ir.attachment"

    @api.autovacuum
    def _gc_libreoffice_previews(self):
        """Garbage collect superseded LibreOffice PDF previews.

        A preview is cached per content checksum, so every edit of a source
        document strands the previous render: it stays attached to the
        dms.file and nothing ever reads it again. Same shape as core's
        `_gc_doc_index` (addons/api_doc), which vacuums its cached
        /doc/index.json attachments the same way.
        """
        cached = self.search_fetch(
            [
                ("res_model", "=", "dms.file"),
                ("description", "=like", _CACHE_DESCRIPTION_PREFIX + "%"),
            ],
            ["res_id", "description"],
        )
        if not cached:
            return
        current = {
            dms_file.id: _CACHE_DESCRIPTION_PREFIX + (dms_file.checksum or "")
            for dms_file in self.env["dms.file"]
            .browse(cached.mapped("res_id"))
            .exists()
        }
        # A preview whose dms.file is gone is stale too — ir.attachment does
        # not cascade on res_id, so `current.get()` returning None drops it.
        stale = cached.filtered(lambda att: att.description != current.get(att.res_id))
        if stale:
            stale.unlink()
        _logger.info("GC'd %s stale LibreOffice preview(s)", len(stale))
