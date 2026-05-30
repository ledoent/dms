// Copyright 2026 ledoent — Don Kendall
// License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).
//
// Verifies the extension→accent colour resolution for getDmsAccent and
// getDmsAccentFromName. These must stay in sync with dms_ext_palette.scss.

import {expect, test} from "@odoo/hoot";
import {getDmsAccent, getDmsAccentFromName} from "@dms/js/utils/use_dms_accent.esm";

test("known extensions return correct hex colour", () => {
    expect(getDmsAccent("pdf")).toBe("#d6336c");
    expect(getDmsAccent("docx")).toBe("#1971c2");
    expect(getDmsAccent("xlsx")).toBe("#2f9e44");
    expect(getDmsAccent("pptx")).toBe("#e8590c");
    expect(getDmsAccent("py")).toBe("#1098ad");
    expect(getDmsAccent("mp4")).toBe("#ae3ec9");
});

test("extension lookup is case-insensitive", () => {
    expect(getDmsAccent("PDF")).toBe("#d6336c");
    expect(getDmsAccent("DOCX")).toBe("#1971c2");
});

test("unknown extension returns null", () => {
    expect(getDmsAccent("xyz")).toBe(null);
    expect(getDmsAccent("")).toBe(null);
    expect(getDmsAccent(null)).toBe(null);
});

test("getDmsAccentFromName extracts extension from filename", () => {
    expect(getDmsAccentFromName("report.pdf")).toBe("#d6336c");
    expect(getDmsAccentFromName("data.xlsx")).toBe("#2f9e44");
    expect(getDmsAccentFromName("script.py")).toBe("#1098ad");
});

test("getDmsAccentFromName returns null for files without extension", () => {
    expect(getDmsAccentFromName("Makefile")).toBe(null);
    expect(getDmsAccentFromName("")).toBe(null);
    expect(getDmsAccentFromName(null)).toBe(null);
});

test("getDmsAccentFromName handles nested dots correctly", () => {
    // Uses the last segment after the last dot.
    expect(getDmsAccentFromName("my.report.final.pdf")).toBe("#d6336c");
});
