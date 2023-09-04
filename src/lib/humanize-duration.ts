import humanizeDuration from "humanize-duration"

export default humanizeDuration.humanizer({
  language: "shortEn",
  languages: {
    shortEn: {
      y: () => "Y",
      mo: () => "M",
      w: () => "w",
      d: () => "d",
      h: () => "h",
      m: () => "m",
      s: () => "s",
      ms: () => "ms",
    },
  },
  spacer: "",
  delimiter: " ",
  largest: 2,
  round: false
});