type SectionKickerProps = {
  index: string;
  text: string;
  light?: boolean;
};

/**
 * 区块 kicker:mono 序号 + " / " + eyebrow 文本。
 * 无 icon、无星号、无装饰 —— 只保留序号与文本的编辑式注记。
 */
export function SectionKicker({ index, text, light = false }: SectionKickerProps) {
  return (
    <p className={`kh-kicker-row kh-eyebrow${light ? " kh-eyebrow-light" : ""}`}>
      <span className="kh-mono kh-kicker-index">{index}</span>
      <span className="kh-kicker-sep" aria-hidden="true">/</span>
      <span>{text}</span>
    </p>
  );
}
