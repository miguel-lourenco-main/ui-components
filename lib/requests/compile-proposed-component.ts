"use client";

/**
 * Browser-side compilation of proposed component source for request previews.
 * Strips imports and evaluates the module with a small set of injected externals.
 */
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as LucideIcons from "lucide-react";
import * as Babel from "@babel/standalone";

export function prepareProposedSource(source: string): string {
  return source
    .replace(/^"use client";?\s*/gm, "")
    .replace(/^import\s+type\s+.+$/gm, "")
    .replace(/^import\s+.+$/gm, "")
    .replace(/^export\s+interface\s+\w+\s*\{[\s\S]*?\}\s*/gm, "")
    .replace(/^interface\s+\w+\s*\{[\s\S]*?\}\s*/gm, "")
    .replace(/^export\s+type\s+[^;]+;\s*/gm, "")
    .replace(/^type\s+\w+\s*=[^;]+;\s*/gm, "")
    .replace(/\bcn\([^)]*\)/g, '""')
    .replace(/^export\s+default\s+function\s+(\w+)/m, "function $1")
    .replace(/^export\s+default\s+/m, "const __defaultExport = ")
    .replace(/^export\s+(function|const|class)\s+/gm, "$1 ");
}

const compileCache = new Map<
  string,
  React.ComponentType<Record<string, unknown>> | null
>();

export function compileProposedComponent(
  source: string,
  componentName: string
): React.ComponentType<Record<string, unknown>> | null {
  const cacheKey = `${componentName}:${source}`;
  if (compileCache.has(cacheKey)) {
    return compileCache.get(cacheKey) ?? null;
  }

  try {
    const prepared = prepareProposedSource(source);
    const result = Babel.transform(prepared, {
      presets: [
        ["typescript", { isTSX: true, allExtensions: true }],
        ["react", { runtime: "classic" }],
      ],
      filename: "preview.tsx",
      sourceType: "script",
    });

    const transformed = result.code;
    if (!transformed) return null;

    const exports: { default?: React.ComponentType<Record<string, unknown>> } =
      {};

    const factory = new Function(
      "React",
      "motion",
      "AnimatePresence",
      "lucide",
      "exports",
      `
        const { useEffect, useState, useMemo, useRef, useCallback } = React;
        const useTheme = () => ({ theme: "dark", setTheme: () => undefined, resolvedTheme: "dark" });
        const {
          Sun, Moon, Monitor, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
          X, Check, Plus, Minus, Loader2, Download, Heart, ShoppingCart, ArrowRight
        } = lucide;
        ${transformed}
        if (typeof __defaultExport !== "undefined") {
          exports.default = __defaultExport;
        } else if (typeof ${componentName} !== "undefined") {
          exports.default = ${componentName};
        }
      `
    );

    factory(React, motion, AnimatePresence, LucideIcons, exports);

    const compiled = exports.default ?? null;
    compileCache.set(cacheKey, compiled);
    return compiled;
  } catch (error) {
    console.error("[compile-proposed-component]", error);
    compileCache.set(cacheKey, null);
    return null;
  }
}
