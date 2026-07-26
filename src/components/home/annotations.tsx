type SectionKickerProps = {
  index: string;
  text: string;
  light?: boolean;
};

/** 10px 套准符:圆 + 十字线,工程图纸记号 */
export function RegMark() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <circle cx="5" cy="5" r="3.2" stroke="currentColor" strokeWidth="1" />
      <path d="M5 0v10M0 5h10" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

/** 区块 kicker:mono 序号 + 套准符 + eyebrow 文本 */
export function SectionKicker({ index, text, light = false }: SectionKickerProps) {
  return (
    <p className={`kh-kicker-row kh-eyebrow${light ? " kh-eyebrow-light" : ""}`}>
      <span className="kh-mono kh-kicker-index">{index}</span>
      <RegMark />
      <span>{text}</span>
    </p>
  );
}
