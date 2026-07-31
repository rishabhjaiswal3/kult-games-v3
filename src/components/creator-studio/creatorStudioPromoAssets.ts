import creatorStudioPromoImage440 from "@/assets/background_Creator_model-440.webp";
import creatorStudioPromoImage880 from "@/assets/background_Creator_model.webp";

/** Display width × height for layout stability (3:2 source art). */
export const CREATOR_STUDIO_PROMO_IMAGE_WIDTH = 880;
export const CREATOR_STUDIO_PROMO_IMAGE_HEIGHT = 587;

export const creatorStudioPromoSrcSet = `${creatorStudioPromoImage440} 440w, ${creatorStudioPromoImage880} 880w`;
export const creatorStudioPromoSizes = "(max-width: 440px) 98vw, 440px";

let preloadStarted = false;

/** Warm the promo hero before the modal/card opens. */
export function preloadCreatorStudioPromoImage() {
  if (preloadStarted || typeof window === "undefined") return;
  preloadStarted = true;

  const mobile = new Image();
  mobile.decoding = "async";
  mobile.src = creatorStudioPromoImage440;

  if (window.matchMedia("(min-width: 441px)").matches) {
    const desktop = new Image();
    desktop.decoding = "async";
    desktop.src = creatorStudioPromoImage880;
  }
}

export { creatorStudioPromoImage440, creatorStudioPromoImage880 };
