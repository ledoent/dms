# Copyright 2020 Creu Blanca
# Copyright 2017-2019 MuK IT GmbH
# Copyright 2024 Subteno - Timothée Vannier (https://www.subteno.com).
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

from odoo import fields, models


class ResCompany(models.Model):
    _inherit = "res.company"

    documents_onboarding_state = fields.Selection(
        selection=[
            ("not_done", "Not done"),
            ("just_done", "Just done"),
            ("done", "Done"),
            ("closed", "Closed"),
        ],
        default="not_done",
    )
    documents_onboarding_storage_state = fields.Selection(
        selection=[
            ("not_done", "Not done"),
            ("just_done", "Just done"),
            ("done", "Done"),
            ("closed", "Closed"),
        ],
        default="not_done",
    )
    documents_onboarding_directory_state = fields.Selection(
        selection=[
            ("not_done", "Not done"),
            ("just_done", "Just done"),
            ("done", "Done"),
            ("closed", "Closed"),
        ],
        default="not_done",
    )
    documents_onboarding_file_state = fields.Selection(
        selection=[
            ("not_done", "Not done"),
            ("just_done", "Just done"),
            ("done", "Done"),
            ("closed", "Closed"),
        ],
        default="not_done",
    )

    def set_onboarding_step_done(self, step):
        self.ensure_one()
        if self[step] == "not_done":
            self[step] = "just_done"
