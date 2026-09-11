/**
 * Chaos Computer Club India — chaoscomputerclub.in
 *
 * Copyright (c) 2026 Chaos Computer Club India
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

import { createFileRoute } from "@tanstack/react-router";
import { LenisProvider } from "@/components/LenisProvider";
import { CurtainPreloader } from "@/components/CurtainPreloader";
import { NotesModeProvider } from "@/hooks/useNotesMode";
import { NotesModeOverlay } from "@/components/Overlays/NotesModeOverlay";
import TargetCursor from "@/components/Cursor/TargetCursor";
import { HeaderNav } from "@/components/Navigation/HeaderNav";
import { HeroModular } from "@/components/Hero/HeroModular";
import { BlockVerticalSpec } from "@/components/Blocks/BlockVerticalSpec";
import { BlockHorizontalReel } from "@/components/Blocks/BlockHorizontalReel";
import { BlockRotatedSide } from "@/components/Blocks/BlockRotatedSide";
import { BlockScreensSplit } from "@/components/Blocks/BlockScreensSplit";
import { ValuesGrid } from "@/components/Values/ValuesGrid";
import { ForgeLoop } from "@/components/Loop/ForgeLoop";
import { ManifestoFooter } from "@/components/Footer/ManifestoFooter";
import { AboutUs } from "@/components/About/AboutUs";

const TITLE = "Chaos Computer Club — Practical engineering under pressure";
const DESCRIPTION =
  "A technology community built around practical experimentation, competition, open knowledge, and people who want to become better by doing difficult things.";

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
        <TargetCursor
          spinDuration={2}
          hideDefaultCursor={true}
          parallaxOn={true}
          cursorColor="#ffffff"
          cursorColorOnTarget="#CCFF00"
          targetSelector=".cursor-target, a, button, input, [role='button'], [data-spec-box]"
        />
        <NotesModeOverlay />
        <HeaderNav />
        <main className="min-h-screen bg-background">
          <HeroModular />
          <AboutUs />
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
