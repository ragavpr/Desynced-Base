import type { src_Item, src_Component } from "./ReadFromLua"

export type src_Obj = src_Item | src_Component

export class Obj {
  id: string
  type: 'Item' | 'Component'
  name: string
  desc: string
  texture: string

  src_obj: src_Obj

  ingredients!: {
    obj: Item | Component
    count: number
  }[]
  produced_by!: {
    component: Component
    time: number //ticks <- (seconds * 5)
  }[]

  cumulative_time?: number

  used_in: Record<string, {
    obj: Obj
    count: number
    time_contribution: {
      contrib: number
      total: number
    }
  }>

  produces: Record<string, {
    obj: Obj
    time: number
    time_contribution: {
      contrib: number
      total: number
    }
  }>

  constructor(obj: src_Obj, type: 'Item' | 'Component') {
    this.id = obj.id
    this.type = type

    this.name = obj.name
    this.desc = obj.desc
    this.texture = obj.texture
    
    this.src_obj = obj

    this.used_in = {}
    this.produces = {}
  }

  serialize() {
    return {
      id: this.id,
      name: this.name,
      texture: this.texture,
      items: Object.fromEntries(
        this.ingredients.map(req => [req.obj.id, req.count])
      ),
      producers: Object.fromEntries(
        this.produced_by.map(producer => [producer.component.id, producer.time])
      )
    }
  }

  calcTotalTime(useMinimum = false) {
    if(!this.cumulative_time) {
      let time = 0
      this.ingredients.forEach(obj => {
        time += obj.obj.calcTotalTime() * obj.count
      })
      time += this.produced_by.reduce((acc, curr) => {
        return useMinimum ? Math.min(acc, curr.time) : Math.max(acc, curr.time)
      }, useMinimum ? Infinity : -Infinity)
      this.cumulative_time = time
    }
    if(!this.cumulative_time) throw new Error("NO TIME")
    return this.cumulative_time
  }
}

export class Item extends Obj {
  stack_size?: number
  slot_type?: string

  constructor(item: src_Item) {
    super(item, 'Item')

    this.stack_size = item.stack_size
    this.slot_type = item.slot_type
  }
}

export class Component extends Obj {
  attachment_size?: string
  race?: string

  constructor(component: src_Component) {
    super(component, 'Component')

    this.attachment_size = component.attachment_size
    this.race = component.race
  }
}