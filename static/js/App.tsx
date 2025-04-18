import { useState } from "react";
import { OverlayModal } from "./components/OverlayModal";
import { MainSection } from "./sections/MainSection";

function App() {
  const [whiteLabel, setWhiteLabel] = useState<boolean>(true);

  return (
    <OverlayModal whiteLabel={whiteLabel}>
      <MainSection setWhiteLabel={setWhiteLabel} whiteLabel={whiteLabel} />
    </OverlayModal>
  );
}

export default App;
