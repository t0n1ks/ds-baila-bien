import { DotLottieReact, setWasmUrl } from '@lottiefiles/dotlottie-react';
import wasmUrl from '@lottiefiles/dotlottie-web/dotlottie-player.wasm?url';

// Self-host the renderer. Without this the library fetches its WASM from
// jsdelivr/unpkg; an explicit URL also disables that CDN fallback.
setWasmUrl(wasmUrl);

const SRC = `${import.meta.env.BASE_URL}animations/dancing-girl.lottie`;

/**
 * The Lottie dancer, split into its own chunk (library + WASM load only when
 * the events visual is actually shown). Original colours, looping; with
 * reduced motion it renders the first frame and stays still. Off-screen
 * frames are frozen by the player itself.
 */
export default function Dancer({ still }) {
  return (
    <DotLottieReact
      key={still ? 'still' : 'play'}
      src={SRC}
      loop
      autoplay={!still}
      renderConfig={{ freezeOnOffscreen: true }}
      className="h-full w-full"
    />
  );
}
