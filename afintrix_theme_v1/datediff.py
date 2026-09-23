"""Two-argument DateDiff for frappe version-16.

ERPNext (develop) calls ``DateDiff(start_date, end_date)`` from
``frappe.query_builder.functions`` — the helper frappe's develop branch ships.
frappe version-16 does not define it, so that name falls through to pypika's
three-argument ``DateDiff(interval, start, end)`` and every such call raises
"TypeError: DateDiff.__init__() missing 1 required positional argument:
'end_date'" (e.g. the Inactive Customers report on the Selling workspace).

The production image builds frappe from the version-16 branch on every deploy,
so the fix has to live in this app rather than in frappe's source. ``apply()``
runs before every request and background job; it swaps in the develop
implementation only while frappe still exposes pypika's version, so it becomes
a no-op once frappe ships its own.
"""

import pypika.functions
from pypika.terms import Arithmetic, ArithmeticExpression, CustomFunction, Function

from frappe.query_builder import functions
from frappe.query_builder.utils import ImportMapper, db_type_is


class _PostgresDateDiff(ArithmeticExpression):
	"""Postgres subtracts two dates to get an integer number of days, which
	matches MariaDB's DATEDIFF(date1, date2)."""

	def __init__(self, date1, date2, alias=None):
		super().__init__(
			operator=Arithmetic.sub,
			left=pypika.functions.Cast(date1, "date"),
			right=pypika.functions.Cast(date2, "date"),
			alias=alias,
		)


class _SQLiteDateDiff(Function):
	"""Return the difference between calendar dates, ignoring their times of day."""

	def __init__(self, date1, date2, alias=None):
		super().__init__("DATEDIFF", date1, date2, alias=alias)

	def get_function_sql(self, **kwargs):
		date1_sql, date2_sql = (
			argument.get_sql(with_alias=False, subquery=True, **kwargs) for argument in self.args
		)
		return f"CAST(JULIANDAY(DATE({date1_sql})) - JULIANDAY(DATE({date2_sql})) AS INTEGER)"


DateDiff = ImportMapper(
	{
		db_type_is.MARIADB: CustomFunction("DATEDIFF", ["date1", "date2"]),
		db_type_is.POSTGRES: _PostgresDateDiff,
		db_type_is.SQLITE: _SQLiteDateDiff,
	}
)


def apply():
	if functions.DateDiff is pypika.functions.DateDiff:
		functions.DateDiff = DateDiff
