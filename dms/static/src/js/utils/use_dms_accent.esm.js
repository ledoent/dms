// Copyright 2026 ledoent — Don Kendall
// License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

// ===========================================================================
//  useDmsAccent — resolve the --dms-accent colour for an extension
// ===========================================================================
//
// Mirrors the extension→colour mapping defined in `dms_ext_palette.scss` so
// that sibling card components (dms_field, dms_auto_classification, …) can
// apply the accent without needing the `.o_kanban_dms_card[data-ext="…"]`
// DOM selector to be on the same element.
//
// Usage (OWL composable):
//
//     const accent = useDmsAccent(() => this.props.file.name);
//     // accent.color → e.g. "#d6336c" or null for unknown extensions
//
// Or as a plain utility function:
//
//     import {getDmsAccent} from "@dms/js/utils/use_dms_accent.esm";
//     const color = getDmsAccent("pdf"); // "#d6336c"
//
// ---------------------------------------------------------------------------
//  Fallback
// ---------------------------------------------------------------------------
// Unknown extensions return `null`. Callers should fall back to the Bootstrap
// secondary colour (`var(--bs-secondary-color)`) or the base card default.

import {useState} from "@odoo/owl";

const _ACCENT_MAP = {
    // Documents
    pdf: "#d6336c",
    doc: "#1971c2",
    docx: "#1971c2",
    odt: "#1971c2",
    rtf: "#1971c2",
    // Spreadsheets
    xls: "#2f9e44",
    xlsx: "#2f9e44",
    ods: "#2f9e44",
    csv: "#2f9e44",
    // Presentations
    ppt: "#e8590c",
    pptx: "#e8590c",
    odp: "#e8590c",
    // Plain text / markup
    txt: "#495057",
    md: "#495057",
    rst: "#495057",
    // Code
    py: "#1098ad",
    js: "#1098ad",
    ts: "#1098ad",
    java: "#1098ad",
    c: "#1098ad",
    cc: "#1098ad",
    cpp: "#1098ad",
    cs: "#1098ad",
    h: "#1098ad",
    hpp: "#1098ad",
    go: "#1098ad",
    rs: "#1098ad",
    rb: "#1098ad",
    php: "#1098ad",
    sh: "#1098ad",
    bash: "#1098ad",
    aj: "#1098ad",
    groovy: "#1098ad",
    coffee: "#1098ad",
    cbl: "#1098ad",
    f: "#1098ad",
    f90: "#1098ad",
    // Web / data
    html: "#7048e8",
    htm: "#7048e8",
    xml: "#7048e8",
    json: "#7048e8",
    yaml: "#7048e8",
    yml: "#7048e8",
    toml: "#7048e8",
    // Archives
    zip: "#5f3dc4",
    tar: "#5f3dc4",
    gz: "#5f3dc4",
    bz2: "#5f3dc4",
    "7z": "#5f3dc4",
    rar: "#5f3dc4",
    // Images
    png: "#d6336c",
    jpg: "#d6336c",
    jpeg: "#d6336c",
    gif: "#d6336c",
    webp: "#d6336c",
    svg: "#d6336c",
    // Audio / video
    mp4: "#ae3ec9",
    webm: "#ae3ec9",
    mkv: "#ae3ec9",
    mov: "#ae3ec9",
    mp3: "#ae3ec9",
    ogg: "#ae3ec9",
    wav: "#ae3ec9",
    m4a: "#ae3ec9",
    flac: "#ae3ec9",
};

export function getDmsAccent(ext) {
    if (!ext) {
        return null;
    }
    return _ACCENT_MAP[ext.toLowerCase()] || null;
}

export function getDmsAccentFromName(name) {
    if (!name) {
        return null;
    }
    const ext = name.split(".").pop();
    return getDmsAccent(ext);
}

// OWL composable — re-evaluates whenever the `getExt` accessor returns a
// different value (the caller passes `() => file.name` or `() => file.extension`).
export function useDmsAccent(getNameOrExt) {
    const state = useState({color: null});
    const update = () => {
        const raw = getNameOrExt();
        const hasSlash = raw && raw.includes(".");
        state.color = hasSlash ? getDmsAccentFromName(raw) : getDmsAccent(raw);
    };
    update();
    return state;
}
