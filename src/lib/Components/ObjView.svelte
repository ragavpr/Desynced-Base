<script lang=ts>

  import type { Item, Component } from '$lib/DesyncedReader/Obj'
  import { race_colors, slot_colors } from '$lib/DesyncedReader/Colors'
  import humanizeDuration from '$lib/humanize-duration'

  export let obj: Item | Component

  export let top: string | undefined = undefined
  export let bottom: string | undefined = undefined

  export let time: {
    contrib: number,
    total: number
  } | undefined = undefined
  export let show_percent = false

  export let size = 60 //px

  $: time_color = time ? isFinite(time.total) ? `hsl(${240-Math.min(time.total/1800, 240)}, 50%, 50%)` : 'gray' : 'gray'
  $: time_percent = time ? time.contrib*100/time.total : 100

  const slot_color = obj.type == 'Component' ? slot_colors[obj.attachment_size] : 'gray'
  const race_color = obj.type == 'Component' ? race_colors[obj.race] : 'gray'

</script>

<template lang=pug>

div.view(style!='--size: {size}px; --slot_color: {slot_color}; --race_color: {race_color}; --time_contrib: {time_percent}%; --time_color: {time_color}')

  +if('time')
    div.time {show_percent ? `${(time_percent).toFixed(1)} %` : `${humanizeDuration(time.contrib * 200)}`}

  div.obj
    +if('top')
      div.top {top}
    div.group
    div.item
      img.texture(
        src='{obj.texture ? `/ModSource/${obj.texture}` : `/NoTexture.png`}',
        alt='{obj.texture}'
      )
    +if('bottom')
      div.bottom {bottom}

</template>

<style lang=sass>

div.view
  width: fit-content
  height: fit-content
  display: flex
  border: 1px solid color-mix(in srgb, var(--fg) 50%, transparent)
  border-radius: 8px
  overflow: hidden

div.time
  padding-top: 4px
  border-right: 2px solid color-mix(in srgb, var(--time_color) 40%, #fff5)
  background: linear-gradient(to bottom, color-mix(in srgb, var(--time_color) 40%, #fff5) var(--time_contrib), color-mix(in srgb, var(--time_color) 25%, transparent) var(--time_contrib))
  font-size: calc( var(--size) / 4.5 )
  writing-mode: vertical-rl

div.obj
  text-align: center

div.group
  width: 100%
  height: calc( var(--size) / 10 )
  background: linear-gradient(to right, color-mix(in srgb, var(--race_color) 60%, transparent) 50%, color-mix(in srgb, var(--slot_color) 60%, transparent) 50%)

div.item
  width: var(--size)
  height: var(--size)
  background-color: color-mix(in srgb, var(--race_color) 25%, transparent)
  img.texture
    width: 100%

</style>