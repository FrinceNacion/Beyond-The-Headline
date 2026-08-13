import React from "react";
import { C, speckle } from "../../game/palette";
import { Body, Display, Mono, PixelButton, PixelSprite } from "../../components/Pixel";
import type { OutletProfile } from "../../game/sift";

/* Screen 5b — INVESTIGATE THE SOURCE.

   Deliberately not a trust score. Six independent readings the player has to
   weigh themselves: an outlet can be biased and reliable, or neutral and
   sloppy. Handing out a single number would teach the opposite of the point. */

function Row({ icon, label, children }: { icon: string; label: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 7,
        alignItems: "flex-start",
        padding: "5px 0",
        borderBottom: `2px dotted ${C.paper3}`,
      }}
    >
      <div style={{ flex: "0 0 auto", marginTop: 1 }}>
        <PixelSprite name={icon} scale={1} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Mono size={12} color={C.paper4}>
          {label}
        </Mono>
        <br />
        <Body size={13} color={C.ink}>
          {children}
        </Body>
      </div>
    </div>
  );
}

export function SourcePanel({
  outlet,
  sourceLabel,
  onDone,
  onBack,
}: {
  outlet: OutletProfile;
  /** which folder tab this profile belongs to — each source has its own */
  sourceLabel?: string;
  onDone: () => void;
  onBack?: () => void;
}) {
  const [openByline, setOpenByline] = React.useState(false);

  // a different source means a different profile; collapse the byline again
  React.useEffect(() => setOpenByline(false), [outlet.name]);

  return (
    <div
      className="bth-scroll bth-slide-r"
      role="region"
      aria-label="Source credibility"
      style={{
        height: "100%",
        overflowY: "auto",
        padding: "8px 10px 10px",
        ...speckle(C.paper, C.paper2, 4),
        boxShadow: `inset 2px 2px 0 0 ${C.white}, inset -2px -2px 0 0 ${C.paper3}, 0 0 0 2px ${C.ink}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ boxShadow: `0 0 0 2px ${C.ink}` }}>
          <PixelSprite name={outlet.logo ?? "tornlogo"} scale={1.6} title={outlet.name} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {sourceLabel ? (
            <>
              <Mono size={12} color={C.red}>
                WHO SAID THIS? — {sourceLabel}
              </Mono>
              <br />
            </>
          ) : null}
          <Display size={9} color={C.ink}>
            {outlet.name}
          </Display>
          <br />
          <Mono size={13} color={C.paper4}>
            {outlet.founded} · {outlet.country}
          </Mono>
        </div>
        <div
          style={{
            padding: "2px 6px",
            backgroundColor: C.ink,
            boxShadow: `0 0 0 2px ${C.brassDark}`,
          }}
        >
          <Mono size={13} color={C.brassLight}>
            {outlet.stance.toUpperCase()}
          </Mono>
        </div>
      </div>

      <div style={{ borderTop: `2px solid ${C.ink}`, margin: "6px 0 2px" }} />

      <Row icon="compBias" label="EDITORIAL STANCE">
        {outlet.stanceNote}
      </Row>
      <Row icon="handbook" label="CORRECTIONS RECORD">
        {outlet.corrections}
      </Row>
      <Row icon="coin" label="FUNDING DISCLOSURE">
        {outlet.funding}
      </Row>
      {/* The byline is the cheapest check nobody makes. Tapping it opens the
          two things that actually matter: what else they wrote, and who pays. */}
      <button
        type="button"
        onClick={() => setOpenByline((v) => !v)}
        aria-expanded={openByline}
        style={{
          display: "block",
          width: "100%",
          padding: 0,
          border: "none",
          background: "transparent",
          textAlign: "left",
          cursor: "pointer",
          font: "inherit",
        }}
      >
        <Row icon="bust1" label={`AUTHOR — ${outlet.author.name.toUpperCase()}  ${openByline ? "▾" : "▸"}`}>
          {outlet.author.beat}
          <br />
          <span style={{ color: C.ink3 }}>{outlet.author.history}</span>
          {!openByline ? (
            <>
              <br />
              <Mono size={12} color={C.red}>
                TAP FOR PAST STORIES + CONFLICTS
              </Mono>
            </>
          ) : null}
        </Row>
      </button>

      {openByline ? (
        <div
          className="bth-slide-r"
          style={{
            margin: "5px 0 2px",
            padding: 6,
            backgroundColor: C.paper3,
            boxShadow: `inset 2px 2px 0 0 ${C.paper4}, 0 0 0 2px ${C.ink}`,
          }}
        >
          <Mono size={12} color={C.ink3}>
            PAST BYLINES
          </Mono>
          <ul style={{ margin: "3px 0 0", padding: 0, listStyle: "none" }}>
            {(outlet.author.stories ?? ["No archive held for this byline."]).map((s) => (
              <li key={s} style={{ display: "flex", gap: 5, alignItems: "flex-start", marginTop: 2 }}>
                <div style={{ flex: "0 0 auto", marginTop: 2 }}>
                  <PixelSprite name="arrowR" scale={1} />
                </div>
                <Body size={13} color={C.ink}>
                  {s}
                </Body>
              </li>
            ))}
          </ul>
          <div style={{ borderTop: `2px dotted ${C.paper4}`, margin: "6px 0 4px" }} />
          <Mono size={12} color={C.red}>
            CONFLICT OF INTEREST
          </Mono>
          <br />
          <Body size={13} color={C.ink}>
            {outlet.author.conflict ?? "None declared — which is not the same as none."}
          </Body>
        </div>
      ) : null}

      <Row icon="compSource" label="DECLARED AFFILIATIONS">
        {outlet.author.affiliation}
      </Row>

      {outlet.flagged ? (
        <div
          style={{
            marginTop: 7,
            padding: 6,
            display: "flex",
            gap: 6,
            alignItems: "center",
            backgroundColor: "rgba(183,41,30,0.16)",
            boxShadow: `0 0 0 2px ${C.red}`,
          }}
        >
          <PixelSprite name="flag" scale={1.1} />
          <div>
            <Mono size={12} color={C.red}>
              FACT-CHECKER FLAG
            </Mono>
            <br />
            <Body size={13} color={C.ink}>
              {outlet.flagged}
            </Body>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 7, display: "flex", gap: 6, alignItems: "center" }}>
          <PixelSprite name="check" scale={1} />
          <Mono size={13} color={C.green}>
            NO EXTERNAL FACT-CHECKER FLAGS ON RECORD
          </Mono>
        </div>
      )}

      <div style={{ marginTop: 9, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        {onBack ? (
          <PixelButton variant="ink" size={9} icon="doc" iconScale={1.1} onClick={onBack} label="Button — Back to reading">
            ◂ BACK TO READING
          </PixelButton>
        ) : null}
        <PixelButton variant="brass" size={9} icon="siftCoverage" iconScale={1.2} onClick={onDone} label="Button — Next SIFT step">
          NEXT: FIND BETTER COVERAGE
        </PixelButton>
        <Mono size={12} color={C.paper4}>
          NONE OF THIS IS A SCORE. WEIGH IT.
        </Mono>
      </div>
    </div>
  );
}
