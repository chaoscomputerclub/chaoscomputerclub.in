import { createFileRoute } from "@tanstack/react-router";
import { LenisProvider } from "@/components/LenisProvider";
import { CurtainPreloader } from "@/components/CurtainPreloader";
import { NotesModeProvider } from "@/hooks/useNotesMode";
import { NotesModeOverlay } from "@/components/Overlays/NotesModeOverlay";
import { HeaderNav } from "@/components/Navigation/HeaderNav";
import { BackNav } from "@/components/Navigation/BackNav";
import { HeroModular } from "@/components/Hero/HeroModular";
import { BlockVerticalSpec } from "@/components/Blocks/BlockVerticalSpec";
import { BlockHorizontalReel } from "@/components/Blocks/BlockHorizontalReel";
import { BlockRotatedSide } from "@/components/Blocks/BlockRotatedSide";
import { BlockScreensSplit } from "@/components/Blocks/BlockScreensSplit";
import { ValuesGrid } from "@/components/Values/ValuesGrid";
import { ForgeLoop } from "@/components/Loop/ForgeLoop";
import { ManifestoFooter } from "@/components/Footer/ManifestoFooter";

const TITLE = "Chaos Computer Club — Practical engineering under pressure";
const DESCRIPTION =
  "A student community for practical learning, competition and building under real constraints. Come to learn something. Stay to build something.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <NotesModeProvider>
      <LenisProvider>
        <CurtainPreloader />
        <NotesModeOverlay />
        <HeaderNav />
        <BackNav />
        <main className="min-h-screen bg-background">
          <HeroModular />
          <BlockVerticalSpec />
          <BlockHorizontalReel />
          <BlockRotatedSide />
          <BlockScreensSplit />
          <ValuesGrid />
          <ForgeLoop />
          <ManifestoFooter />
        </main>
      </LenisProvider>
    </NotesModeProvider>
  );
}
