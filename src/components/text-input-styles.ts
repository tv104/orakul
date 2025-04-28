export const textInputStyles = {
    container: {
      base: "relative group hover:backdrop-grayscale-30",
      pseudo: {
        before:
          "before:absolute before:h-[2px] before:w-full before:bg-neutral-200 hover:before:bg-neutral-100 before:bottom-0 before:left-0 before:right-0 before:transition-transform before:ease-out before:duration-300",
        after:
          "after:absolute after:h-[2px] after:w-full after:bg-neutral-200 hover:after:bg-neutral-100 after:top-0 after:left-0 after:right-0 after:transition-transform after:ease-out after:duration-300",
      },
      states: {
        focus:
          "focus-within:before:translate-y-[3px] focus-within:after:translate-y-[-3px] focus-within:before:bg-neutral-100 focus-within:after:bg-neutral-100 focus-within:backdrop-grayscale-30 focus-within:backdrop-blur-xs",
        dirty:
          "before:translate-y-[3px] after:translate-y-[-3px] before:bg-neutral-100 after:bg-neutral-100 backdrop-grayscale-30 backdrop-blur-xs",
      },
    },
    input:
      "w-full max-h-[50vh] px-4 py-4 rounded border-none outline-none text-2xl text-shadow-md/30 overflow-auto resize-none text-white",
    label: {
      base: "absolute pointer-events-none top-5 left-4 text-white text-shadow-md/10 mix-blend-luminosity uppercase transition-position duration-300 ease-out group-focus-within:-top-7",
      dirty: "-top-7 pointer-events-auto",
    },
    maxLength: {
      base: "text-xs absolute bottom-[-20px] right-0 group-focus-within:translate-y-[3px] text-neutral-200 opacity-0 group-focus-within:opacity-100 transition-all duration-300 ease-out",
      dirty: "translate-y-[3px] opacity-100",
    },
  };
