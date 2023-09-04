import luaJson from 'lua-json'

export type src_Component = {
  id: string,
  raw: string,
  name: string,
  desc: string,
  race?: string,
  attachment_size?: 'Hidden'|'Internal'|'Small'|'Medium'|'Large',
  production_recipe?: {
    items: Record<string, number>
    components: Record<string, number>
    count: number
  }
  texture: string
  extracts: string
  extraction_time: number 
  // power?: number,
  // power_storage?: number,
  // drain_rate?: number
	// charge_rate?: number
	// bandwidth?: number
  // transfer_radius?:  number
  // adjust_extra_power?: boolean
  // dumping_ground?: boolean
  // trigger_radius?: number
  // trigger_channels?: "bot|building|bug",
	// non_removable?: boolean
}

export async function readComponents(mod_id: string) {
  // const str = fs.readFileSync(`/ModSource/${mod_id}/data/components.lua`, 'utf-8') // ServerSide only
  const str = (await (await fetch(`/ModSource/${mod_id}/data/components.lua`)).text())

  const source = str.replace(/\r\n/g, "\n").replace(/--\[\[.*?\]\]/gms, "").replace(/--.+?$/gms, "")

  const regex = /:RegisterComponent\("(.*?)".*?,.*?({.*?})\)\n/gms

  const components: Record<string, src_Component> = {}
  let match;
  while ((match = regex.exec(source)) !== null) {
    const id = match[1];
    try {
      const match_rep = (match[2] as string)
        .replace(/CreateProductionRecipe\(({.*?}),.*?({.*?})(|, (\d*))\)/gms, `{ items = $1, components = $2 ${match[3] ? `count = ${match[4]}` : ''} }`)
        .replace('is_missing_ingredient_register = function(idx) return idx == 2 end,', '')
        .replaceAll(/(^\son_.*?) = func.*?^\send,?/gms, '')
        .replace(/blight_threshold./gms, '')
        .replaceAll(/^\sregisters = {.*?^\s},/gms, '')
      const json = luaJson.parse("return " + match_rep);
      components[id] = json as src_Component
      components[id].id = id
      components[id].raw = match_rep
    } catch (e) {
      components[id] = {} as src_Component
      console.log(`${id} - Component ReadError - ${(e as Error).message}`)
    }
  }

  return components
}

export type src_Item = {
  id: string,
  raw: string,
  name: string
	desc: string
	tag: string
	stack_size: number
	slot_type: string
	mining_recipe?: Record<string, number>
  production_recipe?: {
    items: Record<string, number>
    components: Record<string, number>
    count: number
  }
  texture: string
}

export async function readItems(mod_id: string) {
  // const str = fs.readFileSync(`/ModSource/${mod_id}/data/items.lua`, 'utf-8') // ServerSide only
  const str = (await (await fetch(`/ModSource/${mod_id}/data/items.lua`)).text())

  const source = str.replace(/\r\n/g, "\n").replace(/--\[\[.*?\]\]/gms, "").replace(/--.+?$/gms, "")

  const regex = /data.items.(.*?)\s=\s({.*?})\n/gms

  const items: Record<string, src_Item> = {}
  let match;
  while ((match = regex.exec(source)) !== null) {
    const id = match[1];
    try {
      const match_rep = match[2]
        .replace(/CreateMiningRecipe\(({.*?})\)/gms, '$1')
        .replace(/CreateProductionRecipe\(({.*?}),.*?({.*?})(|, (\d*))\)/gms, `{ items = $1, components = $2 ${match[3] ? `count = ${match[4]}` : ''} }`)
      const json = luaJson.parse("return " + match_rep);
      items[id] = json as src_Item
      items[id].raw = match_rep
      items[id].id = id
    } catch (e) {
      items[id] = {} as src_Item
      console.log(`${id} - Item ReadError - ${(e as Error).message}`)
    }
  }

  return items
}
