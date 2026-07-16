import {
  Color,
  TextDocument,
  ColorInformation,
  Range,
  ColorPresentation,
} from "vscode";
import { formatHex, formatRgb, formatHsl } from "culori";
const { findColors } = require("./colorMatch");

export const colorProvider = {
  provideColorPresentations(color: Color) {
    const rgb = {
      mode: "rgb" as const,
      r: color.red,
      g: color.green,
      b: color.blue,
      alpha: color.alpha,
    };
    return [
      new ColorPresentation(formatHex(rgb)),
      new ColorPresentation(formatRgb(rgb)),
      new ColorPresentation(formatHsl(rgb)),
    ];
  },
  provideDocumentColors(document: TextDocument) {
    const colors: ColorInformation[] = [];
    for (let i = 0; i < document.lineCount; i++) {
      const text = document.lineAt(i).text;
      for (const c of findColors(text)) {
        colors.push(
          new ColorInformation(
            new Range(i, c.index, i, c.index + c.length),
            new Color(c.rgb.r, c.rgb.g, c.rgb.b, c.rgb.a)
          )
        );
      }
    }
    return colors;
  },
};
