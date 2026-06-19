"""
supplier_template.py — Generate a supplier GHG data request template.

Creates an Excel workbook with structured tabs for:
  - Cat 1: Purchased goods & services
  - Cat 4: Upstream transport
  - Cat 11: Use of sold products

Suppliers fill this in and return it. The calculator can read it
back via the Excel upload path.
"""
from __future__ import annotations
from pathlib import Path
import io
from datetime import datetime


def generate_supplier_template(
    org_name: str = "Your Organisation",
    inventory_year: int = 2024,
    categories: list[str] | None = None,
) -> bytes:
    """
    Generate a supplier GHG data request workbook.

    Returns:
        bytes: Excel file content ready for st.download_button()
    """
    try:
        import openpyxl
        from openpyxl.styles import (
            Font, PatternFill, Alignment, Border, Side
        )
        from openpyxl.utils import get_column_letter
    except ImportError:
        raise ImportError("openpyxl required: pip install openpyxl")

    wb = openpyxl.Workbook()

    # Styles
    hdr_fill  = PatternFill("solid", fgColor="1F3864")
    hdr_font  = Font(bold=True, color="FFFFFF", size=11)
    sub_fill  = PatternFill("solid", fgColor="D6E4F0")
    sub_font  = Font(bold=True, size=10)
    req_fill  = PatternFill("solid", fgColor="FFF2CC")   # yellow = required
    opt_fill  = PatternFill("solid", fgColor="F0F0F0")   # grey = optional
    border    = Border(
        left=Side(style="thin"), right=Side(style="thin"),
        top=Side(style="thin"),  bottom=Side(style="thin"),
    )

    def style_header(ws, row, cols):
        for col in range(1, cols+1):
            c = ws.cell(row=row, column=col)
            c.fill = hdr_fill; c.font = hdr_font
            c.alignment = Alignment(horizontal="center", wrap_text=True)
            c.border = border

    def style_subheader(ws, row, cols):
        for col in range(1, cols+1):
            c = ws.cell(row=row, column=col)
            c.fill = sub_fill; c.font = sub_font
            c.alignment = Alignment(horizontal="center")
            c.border = border

    def col_widths(ws, widths):
        for i, w in enumerate(widths, 1):
            ws.column_dimensions[get_column_letter(i)].width = w

    # ── Cover sheet ────────────────────────────────────────────────────────
    cover = wb.active
    cover.title = "Instructions"
    cover["A1"] = f"Supplier GHG Data Request — {org_name}"
    cover["A1"].font = Font(bold=True, size=16, color="1F3864")
    cover["A3"] = f"Inventory year: {inventory_year}"
    cover["A4"] = f"Generated: {datetime.now().strftime('%d %b %Y')}"
    cover["A6"] = "HOW TO USE THIS TEMPLATE"
    cover["A6"].font = Font(bold=True, size=12)
    instructions = [
        "1. Please complete the relevant tabs for your products/services.",
        "2. Yellow cells are REQUIRED. Grey cells are optional but improve accuracy.",
        "3. Enter one row per product/service/transport leg.",
        "4. Use the unit exactly as specified in the 'Unit' column.",
        "5. If you have your own verified GHG data, enter it in the 'Supplier tCO2e' column.",
        "6. Return the completed file to your contact at " + org_name + ".",
        "",
        "IMPORTANT: Do not add or remove columns. Do not change sheet names.",
        "",
        "Questions? Contact your sustainability/procurement team.",
    ]
    for i, line in enumerate(instructions, 8):
        cover[f"A{i}"] = line
        if line.startswith("IMPORTANT"):
            cover[f"A{i}"].font = Font(bold=True, color="C00000")
    cover.column_dimensions["A"].width = 80
    cover.column_dimensions["B"].width = 20

    # ── Cat 1: Purchased goods ─────────────────────────────────────────────
    ws1 = wb.create_sheet("Cat1 - Purchased Goods")
    ws1.freeze_panes = "A4"

    ws1.merge_cells("A1:L1")
    ws1["A1"] = "Category 1 — Purchased Goods & Services  |  Supplier Data Request"
    ws1["A1"].font = Font(bold=True, size=13, color="1F3864")
    ws1["A1"].alignment = Alignment(horizontal="center")

    ws1.merge_cells("A2:L2")
    ws1["A2"] = (f"Organisation: {org_name}  |  Inventory year: {inventory_year}  "
                 f"|  Please fill in all yellow cells")
    ws1["A2"].alignment = Alignment(horizontal="center")

    headers = [
        "Product / service name", "Product code / SKU", "Material category",
        "Quantity supplied", "Unit",
        "Supplier tCO2e (if known)", "EF used (kgCO2e/unit)", "EF source",
        "Country of manufacture", "% recycled content",
        "Verified by third party?", "Notes",
    ]
    required = {0,1,3,4}   # required column indices
    for col, hdr in enumerate(headers, 1):
        c = ws1.cell(row=3, column=col, value=hdr)
        c.fill = hdr_fill; c.font = hdr_font
        c.alignment = Alignment(horizontal="center", wrap_text=True)
        c.border = border
        ws1.row_dimensions[3].height = 30

    # Sample data row
    sample = [
        "Example: Steel sheet (Grade S355)", "STL-001", "Metals",
        "500", "t",
        "", "2.89", "worldsteel 2023",
        "IN", "0%", "No", ""
    ]
    for col, val in enumerate(sample, 1):
        c = ws1.cell(row=4, column=col, value=val)
        c.fill = req_fill if (col-1) in required else opt_fill
        c.border = border

    # 30 blank data rows
    for row in range(5, 35):
        for col in range(1, len(headers)+1):
            c = ws1.cell(row=row, column=col, value="")
            c.fill = req_fill if (col-1) in required else opt_fill
            c.border = border

    col_widths(ws1, [30,15,18,14,10,16,16,20,18,12,14,20])

    # ── Cat 4: Upstream transport ──────────────────────────────────────────
    ws4 = wb.create_sheet("Cat4 - Upstream Transport")
    ws4.freeze_panes = "A4"

    ws4.merge_cells("A1:K1")
    ws4["A1"] = "Category 4 — Upstream Transport & Distribution  |  Supplier Data Request"
    ws4["A1"].font = Font(bold=True, size=13, color="1F3864")
    ws4["A1"].alignment = Alignment(horizontal="center")

    t4_headers = [
        "Shipment description", "Origin (city/port)", "Destination (city/port)",
        "Transport mode", "Distance (km)", "Weight shipped (t)",
        "Tonne-km", "Fuel type (if known)", "Supplier tCO2e",
        "Carrier name", "Notes",
    ]
    req4 = {0,1,2,3,5}
    for col, hdr in enumerate(t4_headers, 1):
        c = ws4.cell(row=3, column=col, value=hdr)
        c.fill = hdr_fill; c.font = hdr_font
        c.alignment = Alignment(horizontal="center", wrap_text=True)
        c.border = border
        ws4.row_dimensions[3].height = 30

    sample4 = ["Mumbai→Pune delivery","Mumbai","Pune","Road/truck","165","20",
                "=E5*F5","Diesel","","XYZ Logistics",""]
    for col, val in enumerate(sample4, 1):
        c = ws4.cell(row=4, column=col, value=val)
        c.fill = req_fill if (col-1) in req4 else opt_fill
        c.border = border

    for row in range(5, 35):
        for col in range(1, len(t4_headers)+1):
            c = ws4.cell(row=row, column=col, value="" if col != 7 else f"=E{row}*F{row}")
            c.fill = req_fill if (col-1) in req4 else opt_fill
            c.border = border

    col_widths(ws4, [25,18,18,15,12,14,10,15,14,18,20])

    # ── Cat 11: Use of sold products ───────────────────────────────────────
    ws11 = wb.create_sheet("Cat11 - Use of Products")
    ws11.freeze_panes = "A4"

    ws11.merge_cells("A1:K1")
    ws11["A1"] = "Category 11 — Use of Sold Products  |  Supplier Data Request"
    ws11["A1"].font = Font(bold=True, size=13, color="1F3864")
    ws11["A1"].alignment = Alignment(horizontal="center")

    t11_headers = [
        "Product name", "Units sold (inventory year)", "Energy consumed per unit use",
        "Energy unit", "Annual hours of use", "Useful life (years)",
        "Lifetime energy (kWh)", "EF for energy (kgCO2e/kWh)",
        "Lifetime tCO2e per unit", "Supplier tCO2e total", "Notes",
    ]
    req11 = {0,1,2,3}
    for col, hdr in enumerate(t11_headers, 1):
        c = ws11.cell(row=3, column=col, value=hdr)
        c.fill = hdr_fill; c.font = hdr_font
        c.alignment = Alignment(horizontal="center", wrap_text=True)
        c.border = border
        ws11.row_dimensions[3].height = 40

    sample11 = ["Air conditioner (1.5T)","1000","1.5","kW","2000","10",
                "=C5*E5*F5","0.727","=G5*H5/1000","",""]
    for col, val in enumerate(sample11, 1):
        c = ws11.cell(row=4, column=col, value=val)
        c.fill = req_fill if (col-1) in req11 else opt_fill
        c.border = border

    for row in range(5, 25):
        for col in range(1, len(t11_headers)+1):
            val = ""
            if col == 7: val = f"=C{row}*E{row}*F{row}"
            if col == 9: val = f"=G{row}*H{row}/1000"
            c = ws11.cell(row=row, column=col, value=val)
            c.fill = req_fill if (col-1) in req11 else opt_fill
            c.border = border

    col_widths(ws11, [25,14,16,10,14,12,14,16,16,14,20])

    # ── Legend sheet ───────────────────────────────────────────────────────
    leg = wb.create_sheet("Legend")
    leg["A1"] = "Colour Legend"
    leg["A1"].font = Font(bold=True, size=12)
    for row, (colour, fill, desc) in enumerate([
        ("Yellow", req_fill, "Required — must be filled"),
        ("Grey",   opt_fill, "Optional — improves accuracy"),
        ("Dark blue", hdr_fill, "Column header"),
    ], 3):
        leg.cell(row=row, column=1, value=colour).fill = fill
        leg.cell(row=row, column=2, value=desc)
    leg.column_dimensions["A"].width = 15
    leg.column_dimensions["B"].width = 40

    buf = io.BytesIO()
    wb.save(buf)
    return buf.getvalue()
