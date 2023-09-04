import { Obj, Item, Component } from "./Obj"
import { readComponents, readItems } from "./ReadFromLua"

export type src_ModDef = {
  id: string
  name: string
  version_name: string
  version_code: number
  author?: string
  homepage?: string
  description?: string
  packages?: Record<string, {
    name: string
    entry?: string
    dependencies?: string[]
    type?: string
    description?: string
    modes?: string[]
    languagesdir?: string
    languages?: Record<string, string>
  }>
}

export default class Mod {
  id: string

  mod_def: src_ModDef
  
  obj_list: Record<string, Obj> = {}
  
  ready: Promise<void>

  constructor(mod_def: src_ModDef) {
    this.mod_def = mod_def
    this.id = mod_def.id

    this.ready = this.readAll()
  }

  async readAll() {
    //Reads everything from the Mod and processes everything at once
    //TODO might need to optimize in future

    const src_items = Object.values(await readItems(this.id))
    const src_components = Object.values(await readComponents(this.id))

    src_items.forEach(item => {
      this.obj_list[item.id] = new Item(item)
    })

    src_components.forEach(component => {
      this.obj_list[component.id] = new Component(component)
    })

    src_items.forEach(item => {
      this.obj_list[item.id].items = Object.entries(
        item.production_recipe?.items ?? {}
      ).map(i => {return {item: this.obj_list[i[0]], count: i[1]}})
      this.obj_list[item.id].producers = Object.entries(
        {...item.mining_recipe, ...item.production_recipe?.components}
      ).map(i => {return {component: this.obj_list[i[0]], time: i[1]}})
    })

    src_components.forEach(component => {
      this.obj_list[component.id].items = Object.entries(
        component.production_recipe?.items ?? {}
      ).map(i => {return {item: this.obj_list[i[0]], count: i[1]}})
      this.obj_list[component.id].producers = Object.entries(
        component.production_recipe?.components ?? {}
      ).map(i => {return {component: this.obj_list[i[0]], time: i[1]}})
    })

    src_components.forEach(component => {
      if(component.extracts)
      this.obj_list[component.extracts].producers.push(
          {
            component: this.obj_list[component.id],
            time: component.extraction_time
          }
        )
    })

    const obj_list_values = Object.values(this.obj_list)

    obj_list_values.forEach(obj => {
      obj.calcTotalTime()
    })

    obj_list_values.forEach(obj => {
      obj.items.forEach(item => {
        item.item.used_in[obj.id] = {
          obj,
          count: item.count,
          time_contribution: {
            contrib: item.item.cumulative_time! * item.count,
            total: obj.cumulative_time!
          }
        }
      })
      obj.producers.forEach(producer => {
        producer.component.produces[obj.id] = {
          obj,
          time: producer.time,
          time_contribution: {
            contrib: producer.component.cumulative_time!,
            total: obj.cumulative_time!
          }
        }
      })
    })
  }
}