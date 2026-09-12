export type R2WebsiteCategory =
  | "cake-boxes"
  | "cake-boards"
  | "cake-drums"
  | "pizza-boxes"
  | "food-packaging"
  | "mailer-boxes"
  | "corrugated-inserts"
  | "paperboard-inserts"
  | "cosmetic-packaging"
  | "retail-packaging"
  | "paper-bags";

export type R2WebsiteAsset = {
  assetId: string;
  category: R2WebsiteCategory;
  subtype: string;
  image: string;
  alt: string;
  altZh: string;
};

const webRoot = "/media/packaging/r2/finished-packaging";

function asset(category: R2WebsiteCategory, assetId: string, alt: string, altZh: string): R2WebsiteAsset {
  return {
    assetId,
    category,
    subtype: assetId,
    image: `${webRoot}/${category}/${assetId}-primary.webp`,
    alt,
    altZh,
  };
}

/**
 * R2 is a website-visual pack, not a SKU image pack. Every item is an
 * approved representative visual from the R2 manifest and stays outside the
 * exact-SKU product image map.
 */
export const r2WebsiteAssets: readonly R2WebsiteAsset[] = [
  asset("cake-boxes", "cake-box-square-white", "White square cake box with lid slightly open", "白色方形蛋糕盒，盒盖微微打开"),
  asset("cake-boxes", "cake-box-window-white", "White cake box with transparent window lid", "带透明开窗盒盖的白色蛋糕盒"),
  asset("cake-boxes", "cake-box-tall-white", "Tall white cake box with open top flaps", "顶部展开的高身白色蛋糕盒"),
  asset("cake-boxes", "cake-box-clear-collar", "Cake box with clear transparent side collar and white top and base", "带透明侧围、白色盒盖与底座的蛋糕盒"),
  asset("cake-boards", "gold-round-cake-board", "Gold round cake board with wrapped edge", "金色圆形蛋糕底托，带包边"),
  asset("cake-boards", "silver-round-cake-board", "Silver round cake board with wrapped edge", "银色圆形蛋糕底托，带包边"),
  asset("cake-boards", "white-round-cake-board", "White round cake board with wrapped edge", "白色圆形蛋糕底托，带包边"),
  asset("cake-boards", "square-cake-board", "Square cake board with visible thickness and wrapped edge", "方形蛋糕底托，展示厚度与包边"),
  asset("cake-drums", "gold-cake-drum", "Gold cake drum with thick wrapped edge", "金色厚边蛋糕鼓，带包边"),
  asset("cake-drums", "silver-cake-drum", "Silver cake drum with thick wrapped edge", "银色厚边蛋糕鼓，带包边"),
  asset("cake-drums", "white-cake-drum", "White cake drum with thick wrapped edge", "白色厚边蛋糕鼓，带包边"),
  asset("cake-drums", "black-cake-drum", "Black cake drum with thick wrapped edge", "黑色厚边蛋糕鼓，带包边"),
  asset("pizza-boxes", "kraft-pizza-box-open", "Kraft pizza box in open 45-degree view", "45 度打开的牛皮纸披萨盒"),
  asset("pizza-boxes", "white-pizza-box-open", "White pizza box in open 45-degree view", "45 度打开的白色披萨盒"),
  asset("pizza-boxes", "custom-printed-pizza-box-open", "Custom printed pizza box with abstract pattern in open 45-degree view", "45 度打开的抽象图案定制印刷披萨盒"),
  asset("pizza-boxes", "pizza-box-structure-detail", "Open kraft pizza box showing internal structure and corrugated edges", "打开的牛皮纸披萨盒，展示内部结构与瓦楞边缘"),
  asset("food-packaging", "takeout-food-box", "Paperboard takeout food box with open flaps", "展开盒盖的纸板外带食品盒"),
  asset("food-packaging", "bakery-food-box-window", "Bakery food box with transparent window", "带透明开窗的烘焙食品盒"),
  asset("food-packaging", "folding-food-carton", "Folding food carton shown open", "打开状态的折叠食品纸盒"),
  asset("food-packaging", "food-paper-tray", "Paper food tray with folded corners", "带折角的食品纸托"),
  asset("mailer-boxes", "kraft-mailer-box-open", "Kraft corrugated mailer box in 45-degree open view", "45 度打开的牛皮瓦楞邮寄盒"),
  asset("mailer-boxes", "white-mailer-box-open", "White corrugated mailer box in 45-degree open view", "45 度打开的白色瓦楞邮寄盒"),
  asset("mailer-boxes", "black-mailer-box-open", "Black corrugated mailer box in 45-degree open view", "45 度打开的黑色瓦楞邮寄盒"),
  asset("mailer-boxes", "custom-printed-mailer-box-open", "Custom printed corrugated mailer box in 45-degree open view", "45 度打开的定制印刷瓦楞邮寄盒"),
  asset("corrugated-inserts", "corrugated-insert-cross-divider", "Corrugated cross divider insert with interlocking slots", "带互锁插槽的瓦楞十字隔板内托"),
  asset("corrugated-inserts", "corrugated-insert-die-cut", "Die-cut corrugated product insert with custom cutouts", "带定制开孔的模切瓦楞产品内托"),
  asset("corrugated-inserts", "corrugated-insert-multi-compartment", "Multi-compartment corrugated insert with divider geometry", "带隔断结构的多分格瓦楞内托"),
  asset("corrugated-inserts", "corrugated-insert-protective", "Protective corrugated insert with folded support features", "带折叠支撑结构的保护型瓦楞内托"),
  asset("paperboard-inserts", "paperboard-insert-cosmetic-card", "Thin cosmetic paperboard insert with precise die-cut openings", "带精确模切开孔的薄型化妆品纸板内托"),
  asset("paperboard-inserts", "paperboard-insert-perfume", "Paperboard insert for perfume bottle presentation", "用于香水瓶展示的纸板内托"),
  asset("paperboard-inserts", "paperboard-insert-jar-bottle", "Paperboard insert for jar or bottle presentation", "用于罐装或瓶装产品展示的纸板内托"),
  asset("paperboard-inserts", "paperboard-insert-precision-die-cut", "Precision die-cut paperboard insert with multiple slots", "带多个定位槽的精密模切纸板内托"),
  asset("cosmetic-packaging", "perfume-gift-box", "Perfume gift box with insert and unbranded bottle", "带内托和无品牌瓶体示意的香水礼盒"),
  asset("cosmetic-packaging", "skincare-gift-box", "Skincare gift box with insert and unbranded cream jar", "带内托和无品牌面霜罐示意的护肤品礼盒"),
  asset("cosmetic-packaging", "cosmetic-box-with-insert", "Cosmetic presentation box with insert shown open", "打开状态的化妆品展示盒与内托"),
  asset("cosmetic-packaging", "premium-presentation-box", "Premium presentation box with structured interior compartments", "带结构化内部隔层的高级展示盒"),
  asset("retail-packaging", "folding-retail-box", "Folding retail box shown open", "打开状态的折叠零售盒"),
  asset("retail-packaging", "premium-retail-box", "Premium retail box with partially open lid", "盒盖半开的高级零售盒"),
  asset("retail-packaging", "window-retail-box", "Window retail box with clear front window", "带透明正面开窗的零售盒"),
  asset("paper-bags", "white-paper-bag", "White paper bag with paper handles", "带纸质提手的白色纸袋"),
  asset("paper-bags", "kraft-paper-bag", "Kraft paper bag with paper handles", "带纸质提手的牛皮纸袋"),
  asset("paper-bags", "premium-printed-paper-bag", "Premium black paper bag with abstract print and rope handles", "带抽象印刷和绳提手的高级黑色纸袋"),
] as const;

const routeAssetIds: Record<string, readonly string[]> = {
  "paper-bags": ["premium-printed-paper-bag", "kraft-paper-bag", "white-paper-bag"],
  "cake-boxes": ["cake-box-window-white", "cake-box-square-white", "cake-box-tall-white", "cake-box-clear-collar"],
  "cake-boards-cake-drums": [
    "gold-round-cake-board",
    "silver-round-cake-board",
    "white-round-cake-board",
    "square-cake-board",
    "gold-cake-drum",
    "silver-cake-drum",
    "white-cake-drum",
    "black-cake-drum",
  ],
  "pizza-packaging": ["white-pizza-box-open", "kraft-pizza-box-open", "custom-printed-pizza-box-open", "pizza-box-structure-detail"],
  "food-packaging": ["takeout-food-box", "bakery-food-box-window", "folding-food-carton", "food-paper-tray"],
  "inserts-dividers": [
    "corrugated-insert-multi-compartment",
    "corrugated-insert-cross-divider",
    "corrugated-insert-die-cut",
    "corrugated-insert-protective",
    "paperboard-insert-cosmetic-card",
    "paperboard-insert-perfume",
    "paperboard-insert-jar-bottle",
    "paperboard-insert-precision-die-cut",
  ],
  "cosmetic-packaging": ["perfume-gift-box", "skincare-gift-box", "cosmetic-box-with-insert", "premium-presentation-box"],
  "retail-packaging": [
    "window-retail-box",
    "folding-retail-box",
    "premium-retail-box",
    "perfume-gift-box",
    "skincare-gift-box",
    "cosmetic-box-with-insert",
    "premium-presentation-box",
  ],
  "corrugated-mailer-boxes": ["white-mailer-box-open", "kraft-mailer-box-open", "black-mailer-box-open", "custom-printed-mailer-box-open"],
};

const assetsById = new Map(r2WebsiteAssets.map((item) => [item.assetId, item]));

export function getR2AssetsForPackagingRoute(route: string) {
  return (routeAssetIds[route] ?? []).map((assetId) => assetsById.get(assetId)).filter((item): item is R2WebsiteAsset => Boolean(item));
}

export function getR2HeroForPackagingRoute(route: string) {
  return getR2AssetsForPackagingRoute(route)[0];
}
