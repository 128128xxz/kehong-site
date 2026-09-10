export type R2Model = {
  id: string;
  title: { en: string; zh: string };
  description: { en: string; zh: string };
  src: string;
  poster?: string;
  route: string;
  routeLabel: { en: string; zh: string };
};

/** Public labels for the R2 release. Only the active src is requested. */
export const r2Models: R2Model[] = [
  { id: "01-cake-box-empty", title: { en: "Cake box · empty", zh: "蛋糕盒 · 空盒" }, description: { en: "Review the transparent cake box structure and opening.", zh: "查看透明蛋糕盒结构与开启方式。" }, src: "/models/r2/01_cake_box_empty.glb", route: "/packaging/cake-boxes", routeLabel: { en: "Cake boxes", zh: "蛋糕盒" } },
  { id: "02-cake-box-with-cake", title: { en: "Cake box · with cake", zh: "蛋糕盒 · 含蛋糕" }, description: { en: "See the cake, clear box and silver drum together at working scale.", zh: "查看蛋糕、透明盒与银色蛋糕鼓的组合比例。" }, src: "/models/r2/02_cake_box_with_cake.glb", poster: "/media/3d/r2/02_cake_box_with_cake.png", route: "/packaging/cake-boxes", routeLabel: { en: "Cake boxes", zh: "蛋糕盒" } },
  { id: "03-cosmetic-box-tray", title: { en: "Cosmetic box · tray", zh: "化妆品盒 · 纸托" }, description: { en: "Inspect the box and fitted paper tray as a packaging set.", zh: "查看盒体与纸托组成的化妆品包装套装。" }, src: "/models/r2/03_cosmetic_box_tray.glb", route: "/packaging/inserts-dividers", routeLabel: { en: "Inserts & dividers", zh: "内托与隔板" } },
  { id: "04-perfume-bottle", title: { en: "Perfume bottle", zh: "香水瓶" }, description: { en: "A glass-bottle reference for presentation and protective packaging review.", zh: "用于展示与保护性包装评审的玻璃瓶参考模型。" }, src: "/models/r2/04_perfume_bottle.glb", poster: "/media/3d/r2/04_perfume_bottle.png", route: "/packaging/retail-packaging", routeLabel: { en: "Retail packaging", zh: "零售包装" } },
  { id: "05-cream-jar", title: { en: "Cream jar", zh: "面霜罐" }, description: { en: "A compact cosmetic pack reference for box and insert planning.", zh: "用于盒型与内托规划的紧凑型化妆品包装参考。" }, src: "/models/r2/05_cream_jar.glb", route: "/packaging/retail-packaging", routeLabel: { en: "Retail packaging", zh: "零售包装" } },
  { id: "06-cosmetic-complete-set", title: { en: "Cosmetic complete set", zh: "化妆品完整套装" }, description: { en: "Review a complete cosmetic presentation set before developing the outer pack.", zh: "在开发外盒前查看完整的化妆品展示套装。" }, src: "/models/r2/06_cosmetic_complete_set.glb", poster: "/media/3d/r2/06_cosmetic_complete_set.png", route: "/packaging/retail-packaging", routeLabel: { en: "Retail packaging", zh: "零售包装" } },
  { id: "07-mailer-box-empty", title: { en: "Mailer box · empty", zh: "邮寄盒 · 空盒" }, description: { en: "Review the empty corrugated mailer structure and closure.", zh: "查看空的瓦楞邮寄盒结构与闭合方式。" }, src: "/models/r2/07_mailer_box_empty.glb", route: "/packaging/corrugated-mailer-boxes", routeLabel: { en: "Mailer boxes", zh: "瓦楞邮寄盒" } },
  { id: "08-mailer-with-cosmetic-set", title: { en: "Mailer · cosmetic set", zh: "邮寄盒 · 化妆品套装" }, description: { en: "See how the cosmetic set sits inside the corrugated mailer.", zh: "查看化妆品套装在瓦楞邮寄盒中的装配关系。" }, src: "/models/r2/08_mailer_with_cosmetic_set.glb", poster: "/media/3d/r2/08_mailer_with_cosmetic_set.png", route: "/packaging/corrugated-mailer-boxes", routeLabel: { en: "Mailer boxes", zh: "瓦楞邮寄盒" } },
  { id: "09-paper-cup-empty", title: { en: "Paper cup · empty", zh: "纸杯 · 空杯" }, description: { en: "Review the empty paper cup body and proportions.", zh: "查看空纸杯杯体与比例。" }, src: "/models/r2/09_paper_cup_empty.glb", route: "/packaging/food-packaging", routeLabel: { en: "Food packaging", zh: "食品包装" } },
  { id: "10-paper-cup-coffee-lid", title: { en: "Paper cup · coffee lid", zh: "纸杯 · 咖啡杯盖" }, description: { en: "Review the cup and coffee lid as a foodservice component set.", zh: "查看纸杯与咖啡杯盖组成的餐饮组件。" }, src: "/models/r2/10_paper_cup_coffee_lid.glb", poster: "/media/3d/r2/10_paper_cup_coffee_lid.png", route: "/packaging/food-packaging", routeLabel: { en: "Food packaging", zh: "食品包装" } },
  { id: "11-cake-only", title: { en: "Cake · presentation reference", zh: "蛋糕 · 展示参考" }, description: { en: "A cake reference for sizing the box, drum and protective structure.", zh: "用于确认蛋糕盒、蛋糕鼓与保护结构尺寸的蛋糕参考。" }, src: "/models/r2/11_cake_only.glb", poster: "/media/3d/r2/11_cake_only.png", route: "/packaging/cake-boards-cake-drums", routeLabel: { en: "Cake boards & drums", zh: "蛋糕底托与蛋糕鼓" } },
  { id: "12-silver-cake-drum", title: { en: "Silver cake drum", zh: "银色蛋糕鼓" }, description: { en: "Review the support format used beneath heavier cake presentations.", zh: "查看用于较重蛋糕展示的承托结构。" }, src: "/models/r2/12_silver_cake_drum.glb", route: "/packaging/cake-boards-cake-drums", routeLabel: { en: "Cake boards & drums", zh: "蛋糕底托与蛋糕鼓" } },
  { id: "13-cup-lid-only", title: { en: "Cup lid", zh: "杯盖" }, description: { en: "Review the lid component separately for fit and closure discussions.", zh: "单独查看杯盖组件，便于评审适配与闭合。" }, src: "/models/r2/13_cup_lid_only.glb", route: "/packaging/food-packaging", routeLabel: { en: "Food packaging", zh: "食品包装" } },
];

export const r2PackagingRoutes = [
  { href: "/packaging/cake-boxes", en: "Cake boxes", zh: "蛋糕盒" },
  { href: "/packaging/cake-boards-cake-drums", en: "Cake boards & drums", zh: "蛋糕底托与蛋糕鼓" },
  { href: "/packaging/corrugated-mailer-boxes", en: "Mailer boxes", zh: "瓦楞邮寄盒" },
  { href: "/packaging/inserts-dividers", en: "Inserts & dividers", zh: "内托与隔板" },
  { href: "/packaging/food-packaging", en: "Food packaging", zh: "食品包装" },
] as const;
