"use client";

import { useEffect, useRef, useState } from "react";

type LiquidVariant = "a" | "b" | "c";

const DEFAULT_VARIANT: LiquidVariant = "b";
const VALID_VARIANTS = new Set<LiquidVariant>(["a", "b", "c"]);

// The wordmark is an original outline assembled from a locally installed
// handwritten face and stored as SVG paths only. No font is shipped to the
// browser. Coordinates are kept in the source font's y-up space and flipped
// once by the SVG group transform below.
const SCRIPT_GLYPHS: Array<{ x: number; d: string }> = [
  { x: 0, d: "M908 2Q885 -31 841 -31Q801 -31 758 -5Q719 18 714 40Q712 48 712 55Q712 71 725.5 91.0Q739 111 738 126L708 462L536 74Q533 66 533 55Q533 47 535.5 30.0Q538 13 538 4Q538 -19 520 -31Q494 -49 459 -49Q424 -49 395.5 -30.5Q367 -12 360 18Q358 27 358 34Q358 41 360.0 51.0Q362 61 362 66Q362 72 360 78L216 462L230 100Q231 86 237.0 60.5Q243 35 243 23Q243 -14 188 -35Q181 -37 171 -37Q140 -37 107 -16Q69 7 56 44Q56 50 56 55Q56 65 68.0 77.5Q80 90 80 100L68 670Q68 684 58.0 705.5Q48 727 48 738Q48 755 66.0 774.5Q84 794 129 794Q195 794 234 762Q256 744 256 724Q256 721 255 715Q255 709 255 706Q255 697 258 690L456 210L678 720Q682 729 682 741Q682 745 681 753Q681 761 681 765Q681 788 702 804Q719 817 747 817Q790 817 830.5 791.0Q871 765 870 732Q869 716 855.0 705.5Q841 695 842 686L884 96Q885 86 900.0 61.5Q915 37 915 22Q915 12 908 2Z" },
  { x: 950, d: "M446 42Q431 -7 372 -7Q352 -7 340 0Q324 11 318 44Q306 101 294 133Q291 78 234.0 21.5Q177 -35 119 -35Q46 -35 18 62Q8 98 8 130Q8 223 103 289Q181 335 260 380Q264 397 264 413Q264 444 247.0 449.5Q230 455 218 455Q197 455 183.5 441.5Q170 428 158 416Q146 408 127 379Q112 356 94 354Q68 351 47.0 372.0Q26 393 26 421Q26 437 34 450Q57 488 103 516Q173 558 278 558Q345 558 370 494Q386 451 394 333Q403 190 416 124Q418 111 433.0 91.0Q448 71 448 56Q448 49 446 42ZM272 288Q242 272 212.5 255.0Q183 238 158 210Q122 169 122 140Q122 116 140 90Q150 76 162 76Q188 76 218.5 134.0Q249 192 272 288Z" },
  { x: 1430, d: "M396 6Q384 -21 322 -21Q283 -21 270 -5Q265 0 265 9Q265 16 270.0 31.0Q275 46 276 54Q230 -11 168 -11Q85 -11 47 83Q18 155 18 270Q18 376 63 463Q113 558 186 558Q227 558 270 492V621Q270 637 257.0 662.0Q244 687 244 700Q244 710 249 720Q270 765 331 765Q381 765 393 729Q397 717 397 706Q397 695 390.5 676.5Q384 658 384 645V75Q384 64 392.0 48.5Q400 33 400 23Q400 15 396 6ZM258 270Q258 316 239 378Q218 444 198 444Q175 444 161 383Q150 333 150 270Q150 259 149 234Q149 210 149 197Q149 84 198 84Q221 84 240 149Q258 209 258 270Z" },
  { x: 1880, d: "M390 105Q382 67 336 24Q329 13 281 -5Q226 -26 186 -23Q111 -18 68 63Q29 138 29 247Q29 365 73 454Q122 552 204 564Q220 566 235 566Q354 566 366 420Q372 353 313 274Q249 187 149 152Q160 112 166 100Q180 75 204 75Q227 75 253 93Q275 108 283 122Q287 124 291.0 144.5Q295 165 312 174Q318 177 326 177Q350 177 372.5 153.5Q395 130 390 105ZM233 457Q193 457 168 400Q135 324 141 250Q188 265 228.0 320.0Q268 375 268 418Q268 457 233 457Z" },
  { x: 2540, d: "M174 750Q177 747 177 740Q177 731 171 709Q164 682 162 672Q160 662 164 628Q164 607 151.5 600.5Q139 594 120 594Q93 594 65 605Q31 619 31 642Q31 649 37.0 661.5Q43 674 44 682Q46 690 44 722Q42 747 54 756Q70 768 111 768Q156 768 174 750ZM187 506Q187 492 171.5 462.5Q156 433 156 414V120Q156 100 167.0 63.5Q178 27 178 13Q178 -7 162 -17Q137 -33 108 -33Q70 -33 54 -7Q33 25 33 184Q33 222 34.5 302.5Q36 383 36 420Q36 434 33.0 456.5Q30 479 30 489Q30 522 54 546Q64 556 91 556Q118 556 145.0 547.5Q172 539 179.5 528.0Q187 517 187 506Z" },
  { x: 2760, d: "M480 64Q478 42 451.0 26.5Q424 11 391 11Q342 11 324 42Q332 350 306 354Q281 358 184 78Q184 48 184 18Q183 -18 164.5 -33.0Q146 -48 125 -48Q89 -48 48 -9Q36 1 35 143Q36 56 36 466Q36 475 34.0 490.5Q32 506 32 513Q32 532 42 546Q54 564 80 564Q107 564 136.5 547.5Q166 531 172 516Q176 506 176 496Q176 486 168.0 468.0Q160 450 160 438V300Q223 434 255 477Q312 551 384 546Q427 543 445 466Q459 408 460 294Q460 204 460 114Q462 107 474 89Q481 79 480 64Z" },
  { x: 3530, d: "M416 734Q418 689 377 679Q375 678 302 673Q296 673 294 672Q233 643 204 632Q193 543 202 394Q215 403 242 421Q266 449 282 448Q315 446 348.5 415.5Q382 385 382 352Q382 339 376 328Q365 306 321 304Q271 302 254 288Q240 283 227.5 270.5Q215 258 204 246Q196 179 204 58Q209 45 209 33Q209 1 174 -17Q161 -24 143 -24Q111 -24 84 -5Q54 15 48 46Q46 60 52.5 67.0Q59 74 66 80Q60 516 66 724Q65 734 65 742Q65 794 128 794Q139 794 152 792Q174 789 182 784Q184 783 196 770Q216 777 260 792Q270 798 281.5 805.5Q293 813 318 813Q347 813 381.0 788.0Q415 763 416 734Z" },
  { x: 3970, d: "M330 516Q397 448 397 287Q397 162 350 74Q297 -25 204 -25Q112 -25 62 64Q18 142 18 262Q18 368 52 452Q88 542 144 558Q173 566 204 566Q281 566 330 516ZM216 468Q183 471 159 406Q138 347 138 282Q138 188 146 149Q160 79 204 72Q232 68 256 149Q279 227 279 316Q279 462 216 468Z" },
  { x: 4400, d: "M354 134Q354 64 304.0 14.5Q254 -35 186 -35Q143 -35 97 6Q61 39 32 87Q7 129 10 140Q21 165 79 165Q103 165 117 158Q141 145 144 125Q147 102 154 96Q175 64 192 64Q205 64 216.5 81.5Q228 99 228 123Q228 138 223.0 153.0Q218 168 169 199Q110 236 85 264Q42 312 42 376Q42 451 86.0 507.5Q130 564 198 564Q268 564 305 511Q335 468 330 424Q341 412 341 384Q341 354 319.0 333.0Q297 312 274 312Q240 312 215 357Q208 369 208 389Q208 398 209.5 414.5Q211 431 211 438Q211 464 192 464Q163 464 163 407Q163 349 201 314Q216 300 266 274Q309 252 327 229Q354 194 354 134Z" },
  { x: 4790, d: "M438 84Q444 59 444 52Q444 31 419.5 17.5Q395 4 367 4Q324 4 312 36Q307 49 307 58Q307 71 318.5 86.0Q330 101 330 114Q342 166 342 264Q342 434 318 438Q300 441 260 381Q218 318 190 240Q157 148 162 78Q159 72 159 66Q159 57 167.0 40.5Q175 24 175 14Q175 4 168 -5Q141 -44 114 -44Q86 -44 60 0Q45 26 45 299Q45 399 50 754Q50 760 49.0 772.5Q48 785 48 792Q49 802 54 810Q65 831 101 831Q133 831 159.5 814.0Q186 797 180 774Q179 768 170.5 760.0Q162 752 162 744V422Q219 550 330 558Q390 562 426 468Q459 382 459 257Q459 161 438 84Z" },
  { x: 5280, d: "M446 42Q431 -7 372 -7Q352 -7 340 0Q324 11 318 44Q306 101 294 133Q291 78 234.0 21.5Q177 -35 119 -35Q46 -35 18 62Q8 98 8 130Q8 223 103 289Q181 335 260 380Q264 397 264 413Q264 444 247.0 449.5Q230 455 218 455Q197 455 183.5 441.5Q170 428 158 416Q146 408 127 379Q112 356 94 354Q68 351 47.0 372.0Q26 393 26 421Q26 437 34 450Q57 488 103 516Q173 558 278 558Q345 558 370 494Q386 451 394 333Q403 190 416 124Q418 111 433.0 91.0Q448 71 448 56Q448 49 446 42ZM272 288Q242 272 212.5 255.0Q183 238 158 210Q122 169 122 140Q122 116 140 90Q150 76 162 76Q188 76 218.5 134.0Q249 192 272 288Z" },
  { x: 5760, d: "M480 64Q478 42 451.0 26.5Q424 11 391 11Q342 11 324 42Q332 350 306 354Q281 358 184 78Q184 48 184 18Q183 -18 164.5 -33.0Q146 -48 125 -48Q89 -48 48 -9Q36 1 35 143Q36 56 36 466Q36 475 34.0 490.5Q32 506 32 513Q32 532 42 546Q54 564 80 564Q107 564 136.5 547.5Q166 531 172 516Q176 506 176 496Q176 486 168.0 468.0Q160 450 160 438V300Q223 434 255 477Q312 551 384 546Q427 543 445 466Q459 408 460 294Q460 204 460 114Q462 107 474 89Q481 79 480 64Z" },
];

function ScriptSvg({ variant }: { variant: "handwriting" | "signature" }) {
  return (
    <svg className={`hero-liquid-signature hero-liquid-signature--${variant}`} viewBox="0 0 620 112" role="presentation" aria-hidden="true" focusable="false">
      <g transform="translate(0 96) scale(.095 -.095)">
        {SCRIPT_GLYPHS.map((glyph, index) => (
          <path key={`base-${index}`} className="signature-path" d={glyph.d} transform={`translate(${glyph.x} 0)`} />
        ))}
        {SCRIPT_GLYPHS.map((glyph, index) => (
          <path key={`liquid-${index}`} className="signature-liquid" d={glyph.d} transform={`translate(${glyph.x} 0)`} />
        ))}
        {SCRIPT_GLYPHS.map((glyph, index) => (
          <path key={`highlight-${index}`} className="signature-highlight" d={glyph.d} transform={`translate(${glyph.x} 0)`} />
        ))}
      </g>
      <path className="signature-reflection" pathLength="1" d="M6 92 C154 102 296 78 448 90 C515 96 565 91 614 82" />
    </svg>
  );
}

function SignatureSvg() {
  return (
    <svg className="hero-liquid-signature hero-liquid-signature--underline" viewBox="0 0 560 40" role="presentation" aria-hidden="true" focusable="false">
      <path className="signature-path" pathLength="1" d="M5 24 C78 12 105 29 166 20 C224 12 269 29 333 19 C397 8 461 27 555 12" />
      <path className="signature-liquid" pathLength="1" d="M5 24 C78 12 105 29 166 20 C224 12 269 29 333 19 C397 8 461 27 555 12" />
      <path className="signature-highlight" pathLength="1" d="M5 24 C78 12 105 29 166 20 C224 12 269 29 333 19 C397 8 461 27 555 12" />
    </svg>
  );
}

function parseVariant(): LiquidVariant {
  const rawValue = new URLSearchParams(window.location.search).get("heroMotion");
  const value = rawValue?.replace(/^glass-/, "");
  return value && VALID_VARIANTS.has(value as LiquidVariant) ? value as LiquidVariant : DEFAULT_VARIANT;
}

export default function LiquidHeroTitle() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const hasPlayedRef = useRef(false);
  const [variant, setVariant] = useState<LiquidVariant>(DEFAULT_VARIANT);
  const [jsReady, setJsReady] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const target = titleRef.current;
    if (!target) return;

    let observer: IntersectionObserver | null = null;
    let frame = 0;
    let pointerFrame = 0;
    const pointerFine = window.matchMedia("(pointer: fine)").matches;
    const playOnce = () => {
      if (hasPlayedRef.current) return;
      hasPlayedRef.current = true;
      setActive(true);
      observer?.disconnect();
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) {
      frame = window.requestAnimationFrame(() => {
        setVariant(parseVariant());
        setJsReady(true);
        playOnce();
      });
      return () => window.cancelAnimationFrame(frame);
    }

    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) playOnce();
      },
      { threshold: 0.35 },
    );
    observer.observe(target);

    frame = window.requestAnimationFrame(() => {
      setVariant(parseVariant());
      setJsReady(true);
    });

    const updatePointer = (event: PointerEvent) => {
      if (!pointerFine || !target) return;
      if (pointerFrame) window.cancelAnimationFrame(pointerFrame);
      pointerFrame = window.requestAnimationFrame(() => {
        const bounds = target.getBoundingClientRect();
        target.style.setProperty("--pointer-x", `${((event.clientX - bounds.left) / Math.max(bounds.width, 1) * 100).toFixed(2)}%`);
        target.style.setProperty("--pointer-y", `${((event.clientY - bounds.top) / Math.max(bounds.height, 1) * 100).toFixed(2)}%`);
      });
    };
    const resetPointer = () => {
      if (pointerFrame) window.cancelAnimationFrame(pointerFrame);
      target.style.setProperty("--pointer-x", "50%");
      target.style.setProperty("--pointer-y", "50%");
    };
    if (pointerFine) {
      target.addEventListener("pointermove", updatePointer, { passive: true });
      target.addEventListener("pointerleave", resetPointer, { passive: true });
    }

    return () => {
      window.cancelAnimationFrame(frame);
      if (pointerFrame) window.cancelAnimationFrame(pointerFrame);
      observer?.disconnect();
      if (pointerFine) {
        target.removeEventListener("pointermove", updatePointer);
        target.removeEventListener("pointerleave", resetPointer);
      }
    };
  }, []);

  const state = !jsReady ? "static" : active ? "active" : "pending";

  return (
    <h1
      ref={titleRef}
      className={`hero-liquid-title kh-rise kh-rise-3 hero-liquid-title--${variant}`}
      aria-label="Paper materials & custom packaging — Made in Foshan"
      data-hero-motion={variant}
      data-motion-state={state}
      data-animation-once="true"
    >
      <span className="hero-liquid-title__main">Paper materials &amp; custom packaging</span>
      <span className="sr-only"> — Made in Foshan</span>
      <span className="hero-liquid-title__visual" aria-hidden="true">
        {variant === "a" ? (
          <>
            <span className="hero-liquid-title__a-accent">Made in Foshan</span>
          </>
        ) : (
          <>
            {variant === "b" ? (
              <span className="hero-liquid-title__accent" aria-hidden="true">
                <ScriptSvg variant="handwriting" />
              </span>
            ) : (
              <span className="hero-liquid-title__signature" aria-hidden="true">
                <span>Made in Foshan</span>
                <SignatureSvg />
              </span>
            )}
          </>
        )}
      </span>
    </h1>
  );
}
