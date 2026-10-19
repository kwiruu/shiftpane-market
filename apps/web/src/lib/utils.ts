import { createCn } from 'cn/engine'

import tables from './cn-tables'

/**
 * Class merging that knows the DESIGN.md tokens in globals.css (see cn-theme.mjs). The tables are
 * compiled at build time by `cn build`, so the browser gets a few kilobytes of lookup tables
 * instead of the merge compiler.
 *
 * shadcn components import `cn` from "cn" when added; point them here instead.
 */
export const cn = createCn(tables)
