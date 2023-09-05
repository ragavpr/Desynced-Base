<script lang=ts>

  import type { Obj } from '$lib/DesyncedReader/Obj'
  import { onMount } from "svelte";
  import humanizeDuration from "$lib/humanize-duration";
  import Data from "$lib/DesyncedReader/Data";

  import ObjView from "$lib/Components/ObjView.svelte";

  let search_term: string = ""
  let all_objs: Obj[] = []
  $: objs = search_term ? all_objs.filter(obj => obj.name?.toLowerCase().indexOf(search_term) > -1 || obj.id.toLowerCase().indexOf(search_term) > -1) : all_objs

  onMount(async () => {
    const main_mod = await Data.getMod(Data.mod_list[0])
    await main_mod.ready
    all_objs = Object.values(main_mod.obj_list)
  })

</script>

<template lang=pug>

div.bar
  input#search(type='search' bind:value='{search_term}')
  p {search_term}
  
div.grid
  +each('objs as obj, i (obj.id)')

    div.container
      ObjView(
        obj='{obj}'
        size=80
      )

    div.info 
      p.name {obj.name}
      p.id {obj.id}

    div.ingredients.list
      +each('obj.ingredients as ingredient')
        div.ingredient
          ObjView(
            obj='{ingredient.obj}'
            time=`{{
              contrib: ingredient.obj.cumulative_time*ingredient.count,
              total: obj.cumulative_time
            }}`
            bottom='{ingredient.count}'
          )

    div.produced_by.list
      +each('obj.produced_by as producer')
        div.producer
          ObjView(
            obj='{producer.component}'
            time=`{{
              contrib: producer.time,
              total: obj.cumulative_time
            }}`
            bottom='{humanizeDuration(producer.time * 200)}'
          )

</template>

<style lang=sass>

div.info
  margin: auto 0
  p
    margin: 0
    &.id
      font-size: 0.8em

div.list
  display: flex

div.grid
  display: grid
  gap: 4px
  grid-template-columns: minmax(auto, 100px) auto auto auto

</style>
