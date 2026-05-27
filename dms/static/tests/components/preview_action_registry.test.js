// Copyright 2026 ledoent — Don Kendall
// License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).
//
// Locks down the dms.preview_actions registry contract: score ordering,
// match() predicate filtering, and the null-file guard. Regressions here
// silently break dms_auto_classification and future preview action modules.

import {expect, test} from "@odoo/hoot";
import {
    getPreviewActions,
    previewActionRegistry,
} from "@dms/js/components/preview/preview_action_registry.esm";

const _file = (id = 1, extra = {}) => ({
    id,
    name: "test.pdf",
    mimetype: "application/pdf",
    ...extra,
});

test("returns empty array for null file", () => {
    expect(getPreviewActions(null)).toEqual([]);
    expect(getPreviewActions(undefined)).toEqual([]);
});

test("returns empty array when no actions registered", () => {
    // Fresh registry — no side-effect imports in this module.
    expect(getPreviewActions(_file())).toEqual([]);
});

test("score ordering — higher score comes first", () => {
    const reg = previewActionRegistry();
    const onClick = () => undefined;
    reg.add("action_low", {label: "Low", icon: "fa-arrow-down", score: 1, onClick});
    reg.add("action_high", {label: "High", icon: "fa-arrow-up", score: 10, onClick});
    try {
        const actions = getPreviewActions(_file());
        expect(actions[0].key).toBe("action_high");
        expect(actions[1].key).toBe("action_low");
    } finally {
        reg.remove("action_low");
        reg.remove("action_high");
    }
});

test("match() predicate filters out non-matching files", () => {
    const reg = previewActionRegistry();
    const onClick = () => undefined;
    reg.add("picky_action", {
        label: "PDF Only",
        icon: "fa-file-pdf-o",
        match: (f) => (f.mimetype || "").startsWith("image/"),
        onClick,
    });
    try {
        const pdfFile = _file(1, {mimetype: "application/pdf"});
        const imgFile = _file(2, {mimetype: "image/jpeg"});
        expect(getPreviewActions(pdfFile).map((a) => a.key)).not.toInclude(
            "picky_action"
        );
        expect(getPreviewActions(imgFile).map((a) => a.key)).toInclude("picky_action");
    } finally {
        reg.remove("picky_action");
    }
});

test("action without match() always shows", () => {
    const reg = previewActionRegistry();
    const onClick = () => undefined;
    reg.add("universal_action", {label: "Always", icon: "fa-star", onClick});
    try {
        const actions = getPreviewActions(_file());
        expect(actions.map((a) => a.key)).toInclude("universal_action");
    } finally {
        reg.remove("universal_action");
    }
});
