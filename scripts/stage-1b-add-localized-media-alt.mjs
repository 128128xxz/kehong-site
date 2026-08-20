import { readFile, writeFile } from "node:fs/promises";

const file = "src/data/productImages.json";
const data = JSON.parse(await readFile(file, "utf8"));
const localized = {
  "kh-cupfan-family-representative": {
    id: "Gambar referensi lembar kipas paper cup",
    vi: "Hình ảnh tham khảo phôi quạt giấy làm cốc",
    th: "ภาพอ้างอิงชิ้นพัดกระดาษสำหรับขึ้นรูปแก้ว",
    ms: "Imej rujukan kepingan kipas cawan kertas",
    es: "Imagen de referencia de troqueles para vasos de papel",
  },
  "kh-kraft-family-representative": {
    id: "Gambar referensi kertas cupstock kraft dan cangkir kertas",
    vi: "Hình ảnh tham khảo giấy cupstock kraft và cốc giấy",
    th: "ภาพอ้างอิงกระดาษ cupstock คราฟท์และแก้วกระดาษ",
    ms: "Imej rujukan kertas cupstock kraft dan cawan kertas",
    es: "Imagen de referencia de papel cupstock kraft y vasos de papel",
  },
  "kh-white-cardboard-family-representative": {
    id: "Referensi struktur kemasan makanan karton putih",
    vi: "Hình ảnh tham khảo cấu trúc bao bì thực phẩm bìa trắng",
    th: "ภาพอ้างอิงโครงสร้างบรรจุภัณฑ์อาหารกระดาษการ์ดขาว",
    ms: "Rujukan struktur pembungkusan makanan kadbod putih",
    es: "Imagen de referencia de estructura de envase alimentario de cartón blanco",
  },
  "kh-corrugated-family-representative": {
    id: "Gambar referensi penampang karton bergelombang",
    vi: "Hình ảnh tham khảo mặt cắt tấm carton sóng",
    th: "ภาพอ้างอิงหน้าตัดกระดาษลูกฟูก",
    ms: "Imej rujukan keratan rentas papan beralun",
    es: "Imagen de referencia de secciones de cartón corrugado",
  },
  "kh-specialty-family-representative": {
    id: "Gambar referensi kertas khusus emas perak dan holografik",
    vi: "Hình ảnh tham khảo giấy đặc biệt màu vàng bạc và hologram",
    th: "ภาพอ้างอิงกระดาษชนิดพิเศษสีทอง เงิน และโฮโลแกรม",
    ms: "Imej rujukan kertas khas emas perak dan holografik",
    es: "Imagen de referencia de papeles especiales dorados, plateados y holográficos",
  },
  "kh-food-box-family-representative": {
    id: "Gambar referensi struktur kotak kemasan makanan",
    vi: "Hình ảnh tham khảo cấu trúc hộp bao bì thực phẩm",
    th: "ภาพอ้างอิงโครงสร้างกล่องบรรจุอาหาร",
    ms: "Imej rujukan struktur kotak pembungkusan makanan",
    es: "Imagen de referencia de estructura de caja para alimentos",
  },
  "kh-paper-pad-family-representative": {
    id: "Gambar produk referensi papan kek dan pad kertas",
    vi: "Hình ảnh tham khảo đế bánh và miếng lót giấy",
    th: "ภาพอ้างอิงฐานเค้กและแผ่นรองกระดาษ",
    ms: "Imej rujukan papan kek dan pad kertas",
    es: "Imagen de referencia de bases de tarta y almohadillas de papel",
  },
  "kh-paper-insert-family-representative": {
    id: "Gambar referensi baki sisipan kertas cetak mati",
    vi: "Hình ảnh tham khảo khay lót giấy bế định hình",
    th: "ภาพอ้างอิงถาดกระดาษขึ้นรูปด้วยไดคัท",
    ms: "Imej rujukan dulang sisipan kertas die-cut",
    es: "Imagen de referencia de bandeja de inserción de papel troquelada",
  },
  "kh-paper-box-family-representative": {
    id: "Gambar referensi struktur kotak kertas",
    vi: "Hình ảnh tham khảo cấu trúc hộp giấy",
    th: "ภาพอ้างอิงโครงสร้างกล่องกระดาษ",
    ms: "Imej rujukan struktur kotak kertas",
    es: "Imagen de referencia de estructura de caja de papel",
  },
  "kh-material-family-representative": {
    id: "Gambar referensi gulungan kertas berlapis PE",
    vi: "Hình ảnh tham khảo cuộn giấy tráng PE",
    th: "ภาพอ้างอิงม้วนกระดาษเคลือบ PE",
    ms: "Imej rujukan gulungan kertas bersalut PE",
    es: "Imagen de referencia de rollo de papel recubierto de PE",
  },
  "kh-cup-bottom-family-representative": {
    id: "Gambar referensi gulungan dasar cangkir kertas",
    vi: "Hình ảnh tham khảo cuộn đáy cốc giấy",
    th: "ภาพอ้างอิงม้วนกระดาษก้นแก้ว",
    ms: "Imej rujukan gulungan dasar cawan kertas",
    es: "Imagen de referencia de rollos para fondos de vasos de papel",
  },
  "kh-coated-sheet-family-representative": {
    id: "Gambar referensi lembar kertas berlapis",
    vi: "Hình ảnh tham khảo tờ giấy tráng phủ",
    th: "ภาพอ้างอิงแผ่นกระดาษเคลือบ",
    ms: "Imej rujukan kepingan kertas bersalut",
    es: "Imagen de referencia de hojas de papel recubiertas",
  },
  "kh-coated-sheet-family-concept": {
    id: "Format bahan lembar kertas berlapis PE",
    vi: "Dạng vật liệu tờ giấy tráng PE",
    th: "รูปแบบวัสดุแผ่นกระดาษเคลือบ PE",
    ms: "Format bahan kepingan kertas bersalut PE",
    es: "Formato de material de hojas de papel recubiertas de PE",
  },
  "kh-food-tray-family-concept": {
    id: "Format bahan baki kertas dan sisipan",
    vi: "Dạng vật liệu khay và miếng lót giấy",
    th: "รูปแบบวัสดุถาดและแผ่นรองกระดาษ",
    ms: "Format bahan dulang dan sisipan kertas",
    es: "Formatos de material para bandejas e insertos de papel",
  },
};

for (const asset of data.assets) {
  const values = localized[asset.assetId];
  if (!values) throw new Error(`Missing localized alt map for ${asset.assetId}`);
  asset.alt = { ...asset.alt, ...values };
}
await writeFile(file, `${JSON.stringify(data, null, 2)}\n`);
console.log(JSON.stringify({ assets: data.assets.length, localizedLocales: ["en", "zh", "id", "vi", "th", "ms", "es"] }, null, 2));
