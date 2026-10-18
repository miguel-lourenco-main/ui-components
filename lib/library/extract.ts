/**
 * Static extraction of React components from TS/TSX source.
 *
 * Pure (no filesystem, no React): parses one file with `@babel/parser` and
 * returns every exported PascalCase component it can find, with props resolved
 * from the file's own interfaces/type aliases, defaults read from the
 * destructuring pattern, and JSDoc used as descriptions. Types defined in other
 * files cannot be resolved statically here; they are reported in
 * `propsExtends` instead of being guessed.
 */
import { parse } from "@babel/parser";
import type * as t from "@babel/types";
import type { LibraryProp } from "@/lib/contracts";

/** One component found in a file. */
export interface ExtractedComponent {
  name: string;
  exportKind: "default" | "named";
  description: string;
  props: LibraryProp[];
  propsExtends: string[];
}

/** Everything extracted from one file. */
export interface ExtractedFile {
  components: ExtractedComponent[];
  dependencies: string[];
  localImports: string[];
}

type TypeDecl = t.TSInterfaceDeclaration | t.TSTypeAliasDeclaration;

const PASCAL_CASE = /^[A-Z][A-Za-z0-9]*$/;
const WRAPPER_CALLEES = new Set(["forwardRef", "memo"]);
const NODE_TYPE_NAMES = new Set([
  "ReactNode",
  "React.ReactNode",
  "ReactElement",
  "React.ReactElement",
  "JSX.Element",
  "React.JSX.Element",
]);

/** Parse `source` and extract its exported components and imports. */
export function extractComponents(source: string, filename = "component.tsx"): ExtractedFile {
  const ast = parse(source, {
    sourceType: "module",
    plugins: filename.endsWith(".ts") ? ["typescript"] : ["typescript", "jsx"],
    errorRecovery: true,
  });
  const body = ast.program.body;
  const text = (node: t.Node | null | undefined) =>
    node && node.start != null && node.end != null ? source.slice(node.start, node.end) : "";

  // Local type declarations, so `Props` references can be resolved in-file.
  const types = new Map<string, TypeDecl>();
  for (const stmt of body) {
    const decl = unwrapExport(stmt);
    if (decl?.type === "TSInterfaceDeclaration" || decl?.type === "TSTypeAliasDeclaration") {
      types.set(decl.id.name, decl);
    }
  }

  // Candidate component definitions by local name.
  const definitions = new Map<string, { node: t.Node; doc: string }>();
  const exported = new Map<string, "default" | "named">();

  for (const stmt of body) {
    const doc = jsDoc(stmt) || jsDoc(unwrapExport(stmt));
    const isDefault = stmt.type === "ExportDefaultDeclaration";
    const isNamed = stmt.type === "ExportNamedDeclaration";
    const decl = unwrapExport(stmt);

    if (decl?.type === "FunctionDeclaration" && decl.id && PASCAL_CASE.test(decl.id.name)) {
      definitions.set(decl.id.name, { node: decl, doc });
      if (isDefault) exported.set(decl.id.name, "default");
      else if (isNamed) exported.set(decl.id.name, "named");
    } else if (decl?.type === "VariableDeclaration") {
      for (const d of decl.declarations) {
        if (d.id.type !== "Identifier" || !PASCAL_CASE.test(d.id.name) || !d.init) continue;
        definitions.set(d.id.name, { node: d, doc: doc || jsDoc(d) });
        if (isNamed) exported.set(d.id.name, "named");
      }
    } else if (isDefault && stmt.declaration.type === "Identifier") {
      exported.set(stmt.declaration.name, "default");
    } else if (isDefault && isComponentExpression(stmt.declaration)) {
      // `export default forwardRef(function Name(...) {...})` / `memo(...)`
      const name = innerFunctionName(stmt.declaration) ?? "DefaultExport";
      definitions.set(name, { node: stmt.declaration, doc });
      exported.set(name, "default");
    }

    if (isNamed && !stmt.declaration) {
      for (const spec of stmt.specifiers) {
        if (spec.type !== "ExportSpecifier" || stmt.source) continue;
        const exportedName = spec.exported.type === "Identifier" ? spec.exported.name : spec.exported.value;
        exported.set(spec.local.name, exportedName === "default" ? "default" : "named");
      }
    }
  }

  const components: ExtractedComponent[] = [];
  for (const [name, exportKind] of Array.from(exported)) {
    const def = definitions.get(name);
    if (!def) continue;
    const fn = componentFunction(def.node);
    if (!fn || !returnsJsx(fn.fn, def.node)) continue;

    const { props, propsExtends } = resolveProps(fn, types, text);
    components.push({ name, exportKind, description: def.doc, props, propsExtends });
  }

  const dependencies = new Set<string>();
  const localImports = new Set<string>();
  for (const stmt of body) {
    if (stmt.type !== "ImportDeclaration" || stmt.importKind === "type") continue;
    const spec = stmt.source.value;
    if (/^(\.|\/|@\/|~\/)/.test(spec)) localImports.add(spec);
    else {
      const pkg = spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0];
      if (pkg !== "react" && pkg !== "react-dom") dependencies.add(pkg);
    }
  }

  return {
    components,
    dependencies: Array.from(dependencies).sort(),
    localImports: Array.from(localImports).sort(),
  };
}

function unwrapExport(stmt: t.Statement | null | undefined): t.Node | null {
  if (!stmt) return null;
  if (stmt.type === "ExportNamedDeclaration") return stmt.declaration ?? null;
  if (stmt.type === "ExportDefaultDeclaration") return stmt.declaration;
  return stmt;
}

/** Text of the closest leading `/** ... *\/` comment, without tags. */
function jsDoc(node: t.Node | null | undefined): string {
  const comments = node?.leadingComments;
  if (!comments?.length) return "";
  const last = comments[comments.length - 1];
  if (last.type !== "CommentBlock" || !last.value.startsWith("*")) return "";
  const lines = last.value
    .split("\n")
    .map((line) => line.replace(/^\s*\*+ ?/, "").trimEnd());
  const out: string[] = [];
  for (const line of lines) {
    if (line.trim().startsWith("@")) break;
    out.push(line);
  }
  return out.join("\n").replace(/^\s+|\s+$/g, "").replace(/\n{3,}/g, "\n\n");
}

function calleeName(call: t.CallExpression): string | null {
  const c = call.callee;
  if (c.type === "Identifier") return c.name;
  if (c.type === "MemberExpression" && c.property.type === "Identifier") return c.property.name;
  return null;
}

function isComponentExpression(node: t.Node): boolean {
  return (
    node.type === "ArrowFunctionExpression" ||
    node.type === "FunctionExpression" ||
    (node.type === "CallExpression" && WRAPPER_CALLEES.has(calleeName(node) ?? ""))
  );
}

function innerFunctionName(node: t.Node): string | null {
  if (node.type === "FunctionExpression" && node.id) return node.id.name;
  if (node.type === "CallExpression" && node.arguments[0]) return innerFunctionName(node.arguments[0]);
  return null;
}

type Fn = t.FunctionDeclaration | t.FunctionExpression | t.ArrowFunctionExpression;

/**
 * The render function behind a definition plus any props type supplied from
 * outside it (`React.FC<Props>` annotation or `forwardRef<Ref, Props>`).
 */
function componentFunction(node: t.Node): { fn: Fn; externalPropsType?: t.TSType } | null {
  if (node.type === "FunctionDeclaration") return { fn: node };
  if (node.type === "VariableDeclarator") {
    const id = node.id as t.Identifier;
    const inner = node.init ? componentFunction(node.init) : null;
    if (!inner) return null;
    const ann = id.typeAnnotation?.type === "TSTypeAnnotation" ? id.typeAnnotation.typeAnnotation : undefined;
    if (ann?.type === "TSTypeReference" && ann.typeParameters?.params[0]) {
      return { ...inner, externalPropsType: inner.externalPropsType ?? ann.typeParameters.params[0] };
    }
    return inner;
  }
  if (node.type === "ArrowFunctionExpression" || node.type === "FunctionExpression") return { fn: node };
  if (node.type === "CallExpression" && WRAPPER_CALLEES.has(calleeName(node) ?? "")) {
    const arg = node.arguments[0];
    if (!arg) return null;
    const inner = componentFunction(arg);
    if (!inner) return null;
    const params = node.typeParameters?.params;
    // forwardRef<RefType, Props>
    if (calleeName(node) === "forwardRef" && params?.[1]) {
      return { ...inner, externalPropsType: inner.externalPropsType ?? params[1] };
    }
    return inner;
  }
  return null;
}

/** Whether the function (or the wrapping definition) contains JSX. */
function returnsJsx(fn: Fn, container: t.Node): boolean {
  if (fn.type === "ArrowFunctionExpression" && fn.body.type !== "BlockStatement") {
    if (containsJsx(fn.body)) return true;
  }
  return containsJsx(fn.body) || containsJsx(container);
}

function containsJsx(node: unknown, depth = 0): boolean {
  if (!node || typeof node !== "object" || depth > 60) return false;
  const n = node as { type?: string };
  if (n.type === "JSXElement" || n.type === "JSXFragment") return true;
  for (const [key, value] of Object.entries(node)) {
    if (key === "leadingComments" || key === "trailingComments" || key === "loc") continue;
    if (Array.isArray(value)) {
      if (value.some((v) => containsJsx(v, depth + 1))) return true;
    } else if (value && typeof value === "object" && containsJsx(value, depth + 1)) {
      return true;
    }
  }
  return false;
}

function resolveProps(
  { fn, externalPropsType }: { fn: Fn; externalPropsType?: t.TSType },
  types: Map<string, TypeDecl>,
  text: (node: t.Node | null | undefined) => string
): { props: LibraryProp[]; propsExtends: string[] } {
  const param = fn.params[0];
  let paramType: t.TSType | undefined = externalPropsType;
  let pattern: t.ObjectPattern | undefined;

  if (param?.type === "ObjectPattern") pattern = param;
  if (param?.type === "AssignmentPattern" && param.left.type === "ObjectPattern") pattern = param.left;
  const annotated = pattern ?? (param?.type === "Identifier" ? param : undefined);
  if (!paramType && annotated?.typeAnnotation?.type === "TSTypeAnnotation") {
    paramType = annotated.typeAnnotation.typeAnnotation;
  }

  const members = new Map<string, LibraryProp>();
  const propsExtends: string[] = [];
  if (paramType) collectMembers(paramType, types, text, members, propsExtends, new Set());

  // Defaults (and props only visible through destructuring) from the pattern.
  if (pattern) {
    for (const prop of pattern.properties) {
      if (prop.type !== "ObjectProperty") continue;
      const key = prop.key.type === "Identifier" ? prop.key.name : prop.key.type === "StringLiteral" ? prop.key.value : null;
      if (!key) continue;
      const existing = members.get(key) ?? {
        name: key,
        type: "string",
        tsType: "unknown",
        required: false,
      };
      if (prop.value.type === "AssignmentPattern") {
        const literal = literalValue(prop.value.right);
        if (literal.ok) existing.defaultValue = literal.value;
        else existing.defaultExpression = text(prop.value.right);
        existing.required = false;
      }
      members.set(key, existing);
    }
  }

  return { props: Array.from(members.values()), propsExtends };
}

function collectMembers(
  type: t.TSType,
  types: Map<string, TypeDecl>,
  text: (node: t.Node | null | undefined) => string,
  out: Map<string, LibraryProp>,
  propsExtends: string[],
  seen: Set<string>
): void {
  if (type.type === "TSTypeLiteral") {
    addMembers(type.members, text, out);
  } else if (type.type === "TSIntersectionType") {
    for (const part of type.types) collectMembers(part, types, text, out, propsExtends, seen);
  } else if (type.type === "TSParenthesizedType") {
    collectMembers(type.typeAnnotation, types, text, out, propsExtends, seen);
  } else if (type.type === "TSTypeReference" && type.typeName.type === "Identifier" && types.has(type.typeName.name)) {
    const name = type.typeName.name;
    if (seen.has(name)) return;
    seen.add(name);
    const decl = types.get(name)!;
    if (decl.type === "TSInterfaceDeclaration") {
      for (const ext of decl.extends ?? []) {
        const extName = ext.expression.type === "Identifier" ? ext.expression.name : null;
        if (extName && types.has(extName) && !ext.typeParameters) {
          collectMembers(
            { type: "TSTypeReference", typeName: ext.expression, start: ext.start, end: ext.end } as t.TSTypeReference,
            types,
            text,
            out,
            propsExtends,
            seen
          );
        } else {
          propsExtends.push(text(ext));
        }
      }
      addMembers(decl.body.body, text, out);
    } else {
      collectMembers(decl.typeAnnotation, types, text, out, propsExtends, seen);
    }
  } else {
    // External or utility type (e.g. React.ComponentProps<"button">): record, don't guess.
    propsExtends.push(text(type));
  }
}

function addMembers(
  members: t.TSTypeElement[],
  text: (node: t.Node | null | undefined) => string,
  out: Map<string, LibraryProp>
): void {
  for (const member of members) {
    if (member.type !== "TSPropertySignature" && member.type !== "TSMethodSignature") continue;
    const key = member.key;
    const name = key.type === "Identifier" ? key.name : key.type === "StringLiteral" ? key.value : null;
    if (!name) continue;

    let tsType: string;
    let typeNode: t.TSType | undefined;
    if (member.type === "TSMethodSignature") {
      const params = member.parameters.map((p) => text(p)).join(", ");
      const ret = member.typeAnnotation ? text(member.typeAnnotation.typeAnnotation) : "void";
      tsType = `(${params}) => ${ret}`;
    } else {
      typeNode = member.typeAnnotation?.typeAnnotation;
      tsType = typeNode ? text(typeNode) : "unknown";
    }

    const prop: LibraryProp = {
      name,
      tsType,
      required: !member.optional,
      ...normalizeType(typeNode, tsType, text, member.type === "TSMethodSignature" ? member : undefined),
    };
    const description = jsDoc(member);
    if (description) prop.description = description;
    out.set(name, prop);
  }
}

/** Map a TS type to the registry's internal prop type vocabulary. */
function normalizeType(
  node: t.TSType | undefined,
  tsType: string,
  text: (node: t.Node | null | undefined) => string,
  method?: t.TSMethodSignature
): Pick<LibraryProp, "type" | "options" | "functionSignature"> {
  if (method) {
    return {
      type: "function",
      functionSignature: {
        params: method.parameters.map((p) => text(p)).join(", "),
        returnType: method.typeAnnotation ? text(method.typeAnnotation.typeAnnotation) : "void",
      },
    };
  }
  if (!node) return { type: "string" };

  const parts =
    node.type === "TSUnionType"
      ? node.types.filter((p) => p.type !== "TSUndefinedKeyword" && p.type !== "TSNullKeyword")
      : [node];

  if (parts.length > 1 && parts.every((p) => p.type === "TSLiteralType")) {
    const options = parts
      .map((p) => (p as t.TSLiteralType).literal)
      .map((lit) => (lit.type === "StringLiteral" || lit.type === "NumericLiteral" ? lit.value : null))
      .filter((v): v is string | number => v !== null);
    if (options.length === parts.length) return { type: "enum", options };
  }

  const single = parts.length === 1 ? parts[0] : null;
  if (single) {
    switch (single.type) {
      case "TSStringKeyword":
        return { type: "string" };
      case "TSNumberKeyword":
        return { type: "number" };
      case "TSBooleanKeyword":
        return { type: "boolean" };
      case "TSArrayType":
        return { type: "array" };
      case "TSFunctionType":
        return {
          type: "function",
          functionSignature: {
            params: single.parameters.map((p) => text(p)).join(", "),
            returnType: single.typeAnnotation ? text(single.typeAnnotation.typeAnnotation) : "void",
          },
        };
      case "TSTypeLiteral":
        return { type: "object" };
      case "TSTypeReference": {
        const ref = text(single.typeName);
        if (NODE_TYPE_NAMES.has(ref)) return { type: "component" };
        if (ref === "Array" || ref === "ReadonlyArray") return { type: "array" };
        return { type: "object" };
      }
    }
  }

  if (parts.some((p) => p.type === "TSTypeReference" && NODE_TYPE_NAMES.has(text(p.typeName)))) {
    return { type: "component" };
  }
  if (/=>/.test(tsType)) return { type: "function" };
  return { type: "object" };
}

function literalValue(node: t.Node): { ok: true; value: unknown } | { ok: false } {
  switch (node.type) {
    case "StringLiteral":
    case "NumericLiteral":
    case "BooleanLiteral":
      return { ok: true, value: node.value };
    case "NullLiteral":
      return { ok: true, value: null };
    case "UnaryExpression":
      if (node.operator === "-" && node.argument.type === "NumericLiteral") {
        return { ok: true, value: -node.argument.value };
      }
      return { ok: false };
    case "TemplateLiteral":
      if (node.expressions.length === 0) return { ok: true, value: node.quasis[0]?.value.cooked ?? "" };
      return { ok: false };
    default:
      return { ok: false };
  }
}
