# Copyright 2020 Creu Blanca
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

from odoo import _, api, fields, models
from odoo.exceptions import ValidationError
from odoo.osv import expression
from odoo.tools.sql import SQL


class DmsDirectory(models.Model):
    _inherit = "dms.directory"

    parent_id = fields.Many2one(default=lambda self: self._default_parent())

    @api.model
    def _default_parent(self):
        return self.env.context.get("default_parent_directory_id", False)

    @api.constrains("res_id", "is_root_directory", "storage_id", "res_model")
    def _check_resource(self):
        for directory in self:
            if directory.storage_id.save_type == "attachment":
                continue
            if (
                directory.is_root_directory
                and directory.storage_id.model_ids
                and not directory.res_id
            ):
                raise ValidationError(
                    _("Directories of this storage must be related to a record")
                )
            if not directory.res_id:
                continue
            if self.search(
                [
                    ("storage_id", "=", directory.storage_id.id),
                    ("id", "!=", directory.id),
                    ("res_id", "=", directory.res_id),
                    ("res_model", "=", directory.res_model),
                ],
                limit=1,
            ):
                raise ValidationError(
                    _("This record is already related in this storage")
                )

    @api.model
    def _build_documents_view_directory(self, directory):
        return {
            "id": f"directory_{directory.id}",
            "text": directory.name,
            "icon": "fa fa-folder-o",
            "type": "directory",
            "data": {"odoo_id": directory.id, "odoo_model": "dms.directory"},
            "children": directory.count_elements > 0,
        }

    @api.model
    def _check_parent_field(self):
        if self._parent_name not in self._fields:
            raise TypeError(f"The parent ({self._parent_name}) field does not exist.")

    @api.model
    def search_read_parents(
        self, domain=False, fields=None, offset=0, limit=None, order=None
    ):
        """This method finds the top level elements of the hierarchy
        for a given search query.

        :param domain: a search domain <reference/orm/domains> (default: empty list)
        :param fields: a list of fields to read (default: all fields of the model)
        :param offset: the number of results to ignore (default: none)
        :param limit: maximum number of records to return (default: all)
        :param order: a string to define the sort order of the query
             (default: none)
        :returns: the top level elements for the given search query
        """
        if not domain:
            domain = []
        records = self.search_parents(
            domain=domain, offset=offset, limit=limit, order=order
        )
        if not records:
            return []
        if fields and fields == ["id"]:
            return [{"id": record.id} for record in records]
        result = records.read(fields)
        if len(result) <= 1:
            return result
        index = {vals["id"]: vals for vals in result}
        return [index[record.id] for record in records if record.id in index]

    @api.model
    def search_parents(
        self, domain=False, offset=0, limit=None, order=None, count=False
    ):
        """This method finds the top level elements of the
        hierarchy for a given search query.

        :param domain: a search domain <reference/orm/domains> (default: empty list)
        :param offset: the number of results to ignore (default: none)
        :param limit: maximum number of records to return (default: all)
        :param order: a string to define the sort order of the query
             (default: none)
        :param count: counts and returns the number of matching records
             (default: False)
        :returns: the top level elements for the given search query
        """
        if not domain:
            domain = []
        res = self._search_parents(
            domain=domain, offset=offset, limit=limit, order=order, count=count
        )
        return res if count else self.browse(res)

    @api.model
    def _search_parents(
        self, domain=False, offset=0, limit=None, order=None, count=False
    ):
        if not domain:
            domain = []
        self._check_parent_field()
        self.check_access("read")
        if expression.is_false(self, domain):
            return []
        query = self._search(domain, bypass_access=True)
        from_sql = query.from_clause
        where_sql = query.where_clause

        table = SQL.identifier(self._table)
        parent_col = SQL.identifier(self._parent_name)

        if where_sql:
            parent_subquery = SQL(
                "SELECT %s.id FROM %s WHERE %s", table, from_sql, where_sql
            )
        else:
            parent_subquery = SQL("SELECT %s.id FROM %s", table, from_sql)

        no_parent = SQL("%s.%s IS NULL", table, parent_col)
        no_access = SQL("%s.%s NOT IN (%s)", table, parent_col, parent_subquery)
        parent_clause = SQL("(%s OR %s)", no_parent, no_access)

        final_where = (
            SQL("%s AND %s", where_sql, parent_clause) if where_sql else parent_clause
        )

        if count:
            self._cr.execute(
                SQL("SELECT count(1) FROM %s WHERE %s", from_sql, final_where)
            )
            return self._cr.fetchone()[0]

        select_sql = SQL(
            "SELECT %s.id FROM %s WHERE %s", table, from_sql, final_where
        )
        order_str = order or self._order
        if order_str:
            select_sql = SQL(
                "%s ORDER BY %s", select_sql, self._order_to_sql(order_str, query)
            )
        if limit:
            select_sql = SQL("%s LIMIT %s", select_sql, limit)
        if offset:
            select_sql = SQL("%s OFFSET %s", select_sql, offset)

        self._cr.execute(select_sql)
        return list({x[0] for x in self._cr.fetchall()})
