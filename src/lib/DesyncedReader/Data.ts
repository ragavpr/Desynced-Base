import Mod, { type src_ModDef } from "./Mod";

export default class Data {
  static mod_list: string[] = Object.keys(import.meta.glob('/ModSource/*/def.json')).map(path => path.split('/')[2])

  static mods: Record<string, Mod> = {}

  static getModList() {
    return Data.mod_list
  }

  static async getModInfo() {
    return await Promise.all(
      Data.mod_list.map(id => import(/* @vite-ignore */`/ModSource/${id}/def.json`) as Promise<src_ModDef>)
    )
  }

  static async getMod(id: string) {
    if(!Data.mod_list.includes(id))
      throw new Error('mod_id not in list')
    if(!Data.mods[id])
      Data.mods[id] = new Mod(await import(/* @vite-ignore */`/ModSource/${id}/def.json`))
    await Data.mods[id].ready
    return Data.mods[id]
  }
}